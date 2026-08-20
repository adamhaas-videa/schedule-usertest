import type { ComponentType } from "react";

export interface ProductNavItem {
  type?: "item";
  key: string;
  label: string;
  path: string;
  /** Font Awesome class (rendered as <i className="fa-regular fa-..."/>). */
  iconClass?: string;
  /** Custom inline-SVG icon component (for glyphs not in FA Pro). */
  IconComponent?: ComponentType<{ className?: string }>;
  /** PLG: item is visible but not purchased. */
  locked?: boolean;
}

export interface ProductNavDivider {
  type: "divider";
  key: string;
}

export interface ProductNavLabel {
  type: "label";
  key: string;
  label: string;
}

export type ProductNavEntry =
  | ProductNavItem
  | ProductNavDivider
  | ProductNavLabel;

export function isNavItem(
  entry: ProductNavEntry
): entry is ProductNavItem {
  return entry.type !== "divider" && entry.type !== "label";
}

const schedule: ProductNavItem = {
  key: "schedule",
  label: "Schedule",
  path: "/schedule",
  iconClass: "fa-regular fa-calendar",
};
const voiceNotes: ProductNavItem = {
  key: "voice-notes",
  label: "Voice Notes",
  path: "/voice-notes",
  iconClass: "fa-regular fa-microphone",
};
const autoverify: ProductNavItem = {
  key: "autoverify",
  label: "AutoVerify",
  path: "/autoverify",
  iconClass: "fa-regular fa-shield-check",
};
const cleanClaims: ProductNavItem = {
  key: "clean-claims",
  label: "Clean Claims",
  path: "/clean-claims",
  iconClass: "fa-regular fa-file-lines",
};
const recall: ProductNavItem = {
  key: "recall",
  label: "Recall",
  path: "/recall",
  iconClass: "fa-regular fa-comment-arrow-up-right",
};
const referrals: ProductNavItem = {
  key: "referrals",
  label: "Referrals",
  path: "/referrals",
  iconClass: "fa-regular fa-share-nodes",
};
const ambientIntel: ProductNavItem = {
  key: "ambient-intel",
  label: "Ambient Intel",
  path: "/ambient-intel",
  iconClass: "fa-regular fa-signal-stream",
};
const insights: ProductNavItem = {
  key: "insights",
  label: "Insights",
  path: "/insights",
  iconClass: "fa-regular fa-chart-mixed",
};
const engagement: ProductNavItem = {
  key: "engagement",
  label: "Engagement",
  path: "/engagement",
  iconClass: "fa-regular fa-gauge-high",
};

export const PRODUCT_ITEMS = {
  schedule,
  voiceNotes,
  autoverify,
  cleanClaims,
  recall,
  referrals,
  ambientIntel,
  insights,
  engagement,
} as const;

function locked(item: ProductNavItem): ProductNavItem {
  return { ...item, locked: true };
}

/**
 * Product suite navigation. First item is the schedule surface (relabeled from
 * ux-vision's Clinical Assist). Remaining items are placeholders.
 *
 * This list is nav version 1 (persona groupings, unlabeled dividers).
 */
export const productNav: ProductNavEntry[] = [
  schedule,
  voiceNotes,
  { type: "divider", key: "divider-1" },
  autoverify,
  cleanClaims,
  recall,
  referrals,
  { type: "divider", key: "divider-2" },
  ambientIntel,
  insights,
  engagement,
];

/** Workflow order: schedule is home, then chair-time tools, then revenue. */
export const workflowNav: ProductNavEntry[] = [
  schedule,
  autoverify,
  voiceNotes,
  referrals,
  cleanClaims,
  recall,
  { type: "divider", key: "divider-1" },
  insights,
  ambientIntel,
  engagement,
];

/**
 * PLG variant of workflow order. Unpurchased items stay visible with a lock
 * (expanded only) and open an upsell landing instead of the product surface.
 */
export const plgNav: ProductNavEntry[] = [
  schedule,
  locked(autoverify),
  voiceNotes,
  locked(referrals),
  locked(cleanClaims),
  locked(recall),
  { type: "divider", key: "divider-1" },
  ambientIntel,
];

/** Persona groupings with Clinical / Efficiency / Revenue labels when expanded. */
export const labeledNav: ProductNavEntry[] = [
  { type: "label", key: "label-clinical", label: "Clinical" },
  schedule,
  voiceNotes,
  { type: "label", key: "label-efficiency", label: "Efficiency" },
  autoverify,
  cleanClaims,
  referrals,
  recall,
  { type: "label", key: "label-revenue", label: "Revenue" },
  insights,
  ambientIntel,
  engagement,
];
