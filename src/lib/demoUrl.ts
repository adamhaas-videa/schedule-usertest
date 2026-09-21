// User-test build only. Every demo-menu selection is mirrored into the URL so a
// participant can be dropped straight onto one permutation of the schedule.
//
// Two shapes, both plain paths (no query strings), both parsed by the same
// vocabulary below:
//
//   /t/<preset>          a named condition, e.g. /t/inline-chart
//   /x/<tokens>/...      the permutation spelled out, e.g. /x/c6-tx-s2-on-n3-auto
//
// `/t/...` is a client-side redirect onto the canonical `/x/...` form, and the
// whole app lives under that prefix, so the address bar always spells out the
// current selection and can be copied straight into a test script.
import {
  DEFAULT_CARD_COLOR_MODE,
  DEFAULT_CARD_VERSION,
  type CardColorMode,
  type CardVersion,
} from "@/lib/cardVersions";
import {
  DEFAULT_NAV_FOOTER_MODE,
  DEFAULT_NAV_VERSION,
  type NavFooterMode,
  type NavVersion,
} from "@/lib/navVersions";
import {
  DEFAULT_SUMMARY_VERSION,
  type SummaryVersion,
} from "@/lib/summaryVersions";

/** The six demo-menu dimensions that a URL can pin. */
export interface DemoSelection {
  cardVersion: CardVersion;
  cardColorMode: CardColorMode;
  summaryVersion: SummaryVersion;
  cardSummaryOn: boolean;
  navVersion: NavVersion;
  navFooterMode: NavFooterMode;
}

/** Matches the provider's own initial state, so `/schedule` and the canonical
 *  default permutation render identically. */
export const DEFAULT_DEMO_SELECTION: DemoSelection = {
  cardVersion: DEFAULT_CARD_VERSION,
  cardColorMode: DEFAULT_CARD_COLOR_MODE,
  summaryVersion: DEFAULT_SUMMARY_VERSION,
  cardSummaryOn: false,
  navVersion: DEFAULT_NAV_VERSION,
  navFooterMode: DEFAULT_NAV_FOOTER_MODE,
};

export const DEMO_PREFIX = "/x";
export const PRESET_PREFIX = "/t";

const CARD_TOKEN = /^c([1-7])$/;
const SUMMARY_TOKEN = /^s([1-3])$/;
const NAV_TOKEN = /^n([1-4])$/;

/**
 * Tokens are self-identifying, so order does not matter and unknown tokens are
 * ignored rather than fatal — a mistyped link still lands the participant on a
 * working schedule instead of a blank page.
 *
 *   c1..c7          card version
 *   tx | prov       card color: appointment family vs provider palette
 *   s1..s3          summary slideout tier
 *   on | off        patient-summary blurb on the card
 *   n1..n4          sidebar nav version
 *   auto|full|min   sidebar footer mode
 */
export function decodeDemo(raw: string | undefined): DemoSelection {
  const selection = { ...DEFAULT_DEMO_SELECTION };
  if (!raw) return selection;
  for (const token of raw.toLowerCase().split("-")) {
    const card = CARD_TOKEN.exec(token);
    if (card) {
      selection.cardVersion = Number(card[1]) as CardVersion;
      continue;
    }
    const summary = SUMMARY_TOKEN.exec(token);
    if (summary) {
      selection.summaryVersion = Number(summary[1]) as SummaryVersion;
      continue;
    }
    const nav = NAV_TOKEN.exec(token);
    if (nav) {
      selection.navVersion = Number(nav[1]) as NavVersion;
      continue;
    }
    if (token === "tx") selection.cardColorMode = "appointment";
    else if (token === "prov") selection.cardColorMode = "provider";
    else if (token === "on") selection.cardSummaryOn = true;
    else if (token === "off") selection.cardSummaryOn = false;
    else if (token === "auto" || token === "full") selection.navFooterMode = token;
    else if (token === "min") selection.navFooterMode = "minimal";
  }
  return selection;
}

/** The canonical token string. Always all six dimensions, always this order. */
export function encodeDemo(selection: DemoSelection): string {
  return [
    `c${selection.cardVersion}`,
    selection.cardColorMode === "provider" ? "prov" : "tx",
    `s${selection.summaryVersion}`,
    selection.cardSummaryOn ? "on" : "off",
    `n${selection.navVersion}`,
    selection.navFooterMode === "minimal" ? "min" : selection.navFooterMode,
  ].join("-");
}

const PREFIX_RE = new RegExp(`^${DEMO_PREFIX}/[^/]+`);

/** The `/x/<tokens>` head of a pathname, or "" when there isn't one. */
export function demoPrefixOf(pathname: string): string {
  return PREFIX_RE.exec(pathname)?.[0] ?? "";
}

/** A pathname with the permutation head removed, for code that matches on
 *  app routes (`/schedule`, `/patient/:id/xray`, …). */
export function stripDemoPrefix(pathname: string): string {
  const rest = pathname.slice(demoPrefixOf(pathname).length);
  return rest || "/";
}

export function demoUrl(selection: DemoSelection, path = "/schedule"): string {
  return `${DEMO_PREFIX}/${encodeDemo(selection)}${path}`;
}

export interface DemoPreset {
  slug: string;
  title: string;
  description: string;
  selection: DemoSelection;
}

function preset(
  slug: string,
  title: string,
  description: string,
  overrides: Partial<DemoSelection>
): DemoPreset {
  return {
    slug,
    title,
    description,
    selection: { ...DEFAULT_DEMO_SELECTION, ...overrides },
  };
}

/**
 * Named test conditions. These are a convenience layer over `/x/...` — add,
 * rename, or drop them freely; anything not listed here is still reachable by
 * spelling the tokens out.
 */
export const DEMO_PRESETS: DemoPreset[] = [
  preset("baseline", "Baseline", "Summary actions card, full-suite summary, persona nav.", {}),
  preset("inline-chart", "Inline odontogram", "V6 card: Daily Dashboard chart inline on 60-minute appointments.", { cardVersion: 6 }),
  preset("flyout-chart", "Flyout odontogram", "V7 card: teeth icon floats the chart out beside the column.", { cardVersion: 7 }),
  preset("hover-actions", "Actions on hover", "V3 card: buttons stay hidden until the card is hovered.", { cardVersion: 3 }),
  preset("card-to-images", "Whole card to Images", "V4 card: no buttons, clicking anywhere opens Images.", { cardVersion: 4 }),
  preset("provider-color", "Provider colors", "Card chrome follows the provider palette instead of the procedure family.", { cardColorMode: "provider" }),
  preset("summary-essentials", "Summary: Essentials", "Tier 1 slideout — identity, alerts, today's treatment, last visit.", { summaryVersion: 1 }),
  preset("summary-core", "Summary: Core", "Tier 2 slideout — adds Daily Dashboard odontogram and opportunities.", { summaryVersion: 2 }),
  preset("nav-workflow", "Nav: Workflow", "Sidebar in visit-to-revenue order with Schedule as home.", { navVersion: 2 }),
  preset("nav-plg", "Nav: PLG", "Workflow order with unpurchased products locked behind an upsell.", { navVersion: 3 }),
  preset("nav-labeled", "Nav: Labeled", "Persona grouping with Clinical / Efficiency / Revenue labels.", { navVersion: 4 }),
];

export function findPreset(slug: string | undefined): DemoPreset | undefined {
  if (!slug) return undefined;
  const wanted = slug.toLowerCase();
  return DEMO_PRESETS.find((p) => p.slug === wanted);
}

/**
 * Reads the permutation out of the browser URL at boot, before React renders,
 * so the very first paint is already the requested condition — no flash of the
 * default schedule while an effect catches up.
 */
export function readDemoSelectionFromLocation(
  pathname: string = window.location.pathname
): DemoSelection {
  const presetMatch = new RegExp(`^${PRESET_PREFIX}/([^/]+)`).exec(pathname);
  if (presetMatch) {
    return findPreset(presetMatch[1])?.selection ?? DEFAULT_DEMO_SELECTION;
  }
  const prefix = demoPrefixOf(pathname);
  if (!prefix) return DEFAULT_DEMO_SELECTION;
  return decodeDemo(prefix.slice(DEMO_PREFIX.length + 1));
}
