import type { Patient } from "@/data/mockPatients";
import type { ClinicalTab } from "@/types/clinical";

/** "2026-04-14" → local midnight (not UTC, which would shift the day west). */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** 03/12/26 — the form the study bar and every menu row use. */
export function formatShortDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

export function formatRelative(date: Date, now = new Date()): string {
  const months =
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth());
  if (months <= 0) {
    const days = Math.round((now.getTime() - date.getTime()) / 86_400_000);
    if (days <= 0) return "today";
    if (days === 1) return "1 day ago";
    if (days < 14) return `${days} days ago`;
    const weeks = Math.round(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.round(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function isToday(date: Date, now = new Date()): boolean {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function shiftDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

/** One metadata chip on a visit row: "4 BW", "1 note", "Stage 3". */
export interface VisitChip {
  label: string;
  /** Accented chips carry the headline fact of the visit — the full-mouth
   *  series, the perio stage. One per visit at most. */
  accent?: boolean;
}

export interface Visit {
  date: Date;
  chips: VisitChip[];
  /** Capture not yet processed: the row shows "still uploading" in place of the
   *  relative time and can't be loaded. No mock visit sets this yet. */
  pending?: boolean;
}

export interface VisitGroup {
  /** Rendered above the group, with a rule between groups. */
  label?: string;
  visits: Visit[];
}

export interface VisitMenu {
  /** Single line above an ungrouped list ("Image dates · 7 visits"). Grouped
   *  menus (notes) label each group instead. */
  header?: string;
  groups: VisitGroup[];
}

/**
 * Mock visit history behind the study bar's date picker.
 *
 * Every list is expressed as days *back from the patient's own visit date*, so
 * the loaded study is always the first row and the history stays plausible for
 * whichever patient is open. The intervals and chips are the ones drawn in the
 * Figma spec (Cross-Product Workflow → DateSwitcher), which is also where the
 * three menu shapes come from: images and perio carry a counted header, notes
 * groups the newest visit away from the rest.
 */
interface VisitSeed {
  /** Days before the patient's visit date. */
  back: number;
  chips: string[];
  /** Index into `chips` that renders accented. */
  accent?: number;
}

const IMAGE_VISITS: readonly VisitSeed[] = [
  { back: 0, chips: ["4 BW", "8 PA", "1 PANO", "4 IMAGES"] },
  { back: 174, chips: ["4 BW", "2 PA"] },
  { back: 376, chips: ["FMX", "14 PA", "4 BW"], accent: 0 },
  { back: 574, chips: ["4 BW"] },
  { back: 770, chips: ["2 PA", "6 IMAGES"] },
  { back: 977, chips: ["4 BW", "1 PANO"] },
  { back: 1149, chips: ["1 PANO", "2 PA"] },
];

const NOTE_VISITS: readonly VisitSeed[] = [
  { back: 0, chips: ["1 note"] },
  { back: 73, chips: ["3 notes"] },
  { back: 177, chips: ["2 notes"] },
  { back: 344, chips: ["1 note"] },
  { back: 477, chips: ["4 notes"] },
  { back: 674, chips: ["1 note"] },
];

const PERIO_VISITS: readonly VisitSeed[] = [
  { back: 0, chips: ["Stage 3", "Full mouth"], accent: 0 },
  { back: 171, chips: ["Stage 3", "UR, LR"], accent: 0 },
  { back: 347, chips: ["Stage 2", "Full mouth"], accent: 0 },
  { back: 572, chips: ["Stage 2", "UL, LL"], accent: 0 },
  { back: 777, chips: ["Stage 2", "Full mouth"], accent: 0 },
];

/** The summary isn't captured per modality, so its rows carry no chips. */
const SUMMARY_VISITS: readonly VisitSeed[] = IMAGE_VISITS.map(({ back }) => ({
  back,
  chips: [],
}));

const VISITS_BY_TAB: Record<ClinicalTab, readonly VisitSeed[]> = {
  xray: IMAGE_VISITS,
  voice: NOTE_VISITS,
  perio: PERIO_VISITS,
  chart: SUMMARY_VISITS,
};

const HEADER_BY_TAB: Record<ClinicalTab, string> = {
  xray: "Image dates",
  voice: "Clinical notes",
  perio: "SRP & perio history",
  chart: "Visit history",
};

function toVisits(seeds: readonly VisitSeed[], from: Date): Visit[] {
  return seeds.map((seed) => ({
    date: shiftDays(from, seed.back),
    chips: seed.chips.map((label, i) => ({
      label,
      accent: i === seed.accent,
    })),
  }));
}

export function getVisitMenu(patient: Patient, tab: ClinicalTab): VisitMenu {
  const visits = toVisits(VISITS_BY_TAB[tab], parseISODate(patient.appointmentDate));

  // Notes group the newest visit on its own — "Today" when it really is today,
  // and the rest under "Earlier visits".
  if (tab === "voice") {
    const [latest, ...earlier] = visits;
    return {
      groups: [
        { label: isToday(latest.date) ? "Today" : "Latest visit", visits: [latest] },
        { label: "Earlier visits", visits: earlier },
      ],
    };
  }

  return {
    header: `${HEADER_BY_TAB[tab]} · ${visits.length} visits`,
    groups: [{ visits }],
  };
}
