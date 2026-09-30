import type { Patient, Provider } from "@/data/mockPatients";
import { isHygieneProcedure } from "@/data/mockPatients";
import type { CardColorMode } from "@/lib/cardVersions";
import { getProviderColor, type ProviderColor } from "@/lib/providerColors";

// Procedure families for the appointment-color card mode. Status hues stay
// reserved: red/green for clinical and insurance state, amber/orange/brown for
// warnings and periapical findings — so a scan of the board reads *kind of
// work*, never *patient status*.
//
// Each family owns one hue and walks by lightness inside it. The previous
// scheme spent hue on the walk *within* restorative, which left the families
// themselves only ~13° apart: hygiene and prosthetic were both pale cyan and
// read as the same thing from a step back. Holding hue per family and moving
// lightness instead frees the spectrum for five families.
//
//   Restorative  sky blue      242°, filling → extraction, lightest to most definitive
//   Hygiene      mint teal     174°, prophy lighter, SRP a step darker
//   Prosthetic   lavender      291°, implants, dentures, night guards
//   Ortho        pink          344°, aligners, attachments, retainers
//   Visit        warm neutral  exams, consults, post-op — no hue, it is the
//                              absence of a procedure family
//
// Generated in OKLCH for perceptual spacing: worst cross-family pair is ΔE 5.9
// where the old palette's worst was 2.2, and every header clears 5.6:1 text
// contrast. Re-tune with the generator rather than nudging hexes by hand.
export type AppointmentKind =
  | "filling"
  | "onlay"
  | "crown"
  | "endo"
  | "extraction"
  | "prophy"
  | "srp"
  | "implant"
  | "prosthetic"
  | "ortho"
  | "exam";

export type AppointmentFamily =
  | "restorative"
  | "hygiene"
  | "prosthetic"
  | "ortho"
  | "visit";

const BY_KIND: Record<AppointmentKind, ProviderColor> = {
  // Restorative — sky blue, walking darker as the work gets more definitive.
  filling: { bg: "#BEEEFF", fg: "#094C74", border: "#93D3FF" },
  onlay: { bg: "#B7E6FF", fg: "#094C74", border: "#8CCCFC" },
  crown: { bg: "#B0DFFF", fg: "#094C74", border: "#85C5F5" },
  endo: { bg: "#A9D8FC", fg: "#094C74", border: "#7EBEEE" },
  extraction: { bg: "#A2D1F4", fg: "#094C74", border: "#78B7E6" },
  // Hygiene — mint teal.
  prophy: { bg: "#ABF6E0", fg: "#005744", border: "#75DFC3" },
  srp: { bg: "#9FE9D3", fg: "#005744", border: "#68D3B7" },
  // Prosthetic — lavender.
  implant: { bg: "#D7CFFF", fg: "#483D74", border: "#BCB0FE" },
  prosthetic: { bg: "#CCC4FF", fg: "#483D74", border: "#B1A5F3" },
  // Ortho — pink.
  ortho: { bg: "#FFCFEF", fg: "#683254", border: "#F8ABD8" },
  // Visit — warm neutral, deliberately hueless.
  exam: { bg: "#EBE8E2", fg: "#4A4742", border: "#D0CCC5" },
};

const FAMILY_BY_KIND: Record<AppointmentKind, AppointmentFamily> = {
  filling: "restorative",
  onlay: "restorative",
  crown: "restorative",
  endo: "restorative",
  extraction: "restorative",
  prophy: "hygiene",
  srp: "hygiene",
  implant: "prosthetic",
  prosthetic: "prosthetic",
  ortho: "ortho",
  exam: "visit",
};

// First match wins. Narrower labels (onlay, implant consult) sit above the
// broader crown / implant patterns so they don't get swallowed.
const KIND_PATTERNS: [RegExp, AppointmentKind][] = [
  [/extract/i, "extraction"],
  [/implant\s*consult/i, "exam"],
  [/implant/i, "implant"],
  [/root canal|endo/i, "endo"],
  [/onlay|inlay/i, "onlay"],
  [/crown|bridge|veneer/i, "crown"],
  [/filling|composite|caries/i, "filling"],
  // Ortho splits out of prosthetic: appliance work that moves teeth rather
  // than replaces them.
  [/aligner|attachment|retainer|\bortho\b|bracket|debond/i, "ortho"],
  [/denture|night\s*guard|occlusal\s*guard|flipper/i, "prosthetic"],
  [
    /scaling|root planing|\bsrp\b|deep cleaning|periodontal assessment/i,
    "srp",
  ],
  [
    /prophylaxis|prophy|fluoride|sealants|periodontal maintenance/i,
    "prophy",
  ],
];

/** Display names for the kinds, used by the schedule's treatment filter. */
export const APPOINTMENT_KIND_LABELS: Record<AppointmentKind, string> = {
  filling: "Fillings",
  onlay: "Onlays & inlays",
  crown: "Crowns, bridges & veneers",
  endo: "Root canals",
  extraction: "Extractions",
  prophy: "Prophylaxis & maintenance",
  srp: "Scaling & root planing",
  implant: "Implants",
  prosthetic: "Dentures & appliances",
  ortho: "Ortho & aligners",
  exam: "Exams & consults",
};

export const APPOINTMENT_FAMILY_LABELS: Record<AppointmentFamily, string> = {
  restorative: "Restorative",
  hygiene: "Hygiene",
  prosthetic: "Prosthetic",
  ortho: "Ortho",
  visit: "Visit",
};

/**
 * Kinds grouped by family, in the same order the color walk runs (lightest to
 * most definitive within restorative), so the filter list reads in the same
 * order as the board's color spectrum.
 */
export const APPOINTMENT_KIND_GROUPS: {
  family: AppointmentFamily;
  kinds: AppointmentKind[];
}[] = [
  { family: "restorative", kinds: ["filling", "onlay", "crown", "endo", "extraction"] },
  { family: "hygiene", kinds: ["prophy", "srp"] },
  { family: "prosthetic", kinds: ["implant", "prosthetic"] },
  { family: "ortho", kinds: ["ortho"] },
  { family: "visit", kinds: ["exam"] },
];

/** The swatch a kind shows in the filter, matching its card chrome. */
export function getKindColor(kind: AppointmentKind): ProviderColor {
  return BY_KIND[kind];
}

export function getAppointmentKind(procedure: string): AppointmentKind {
  return KIND_PATTERNS.find(([re]) => re.test(procedure))?.[1] ?? "exam";
}

export function getAppointmentFamily(procedure: string): AppointmentFamily {
  return FAMILY_BY_KIND[getAppointmentKind(procedure)];
}

export function getAppointmentColor(procedure: string): ProviderColor {
  return BY_KIND[getAppointmentKind(procedure)];
}

export function getCardTone(
  patient: Patient,
  mode: CardColorMode
): ProviderColor {
  if (mode === "appointment") return getAppointmentColor(patient.procedure);
  return getProviderColor(patient.provider?.id);
}

export function getProviderHoverName(provider: Provider): string {
  if (provider.role === "RDH") {
    return provider.name.endsWith("RDH")
      ? provider.name
      : `${provider.name} RDH`;
  }
  return provider.name;
}

export function formatTreatmentHeader(patient: Patient): {
  prefix: string;
  procedure: string;
} {
  const procedure = patient.procedure;
  const tooth = (patient.visitTags ?? [])
    .map((tag) => tag.match(/#\s*(\d{1,2})/)?.[1])
    .find(Boolean);

  // Hygiene carries no prefix. "Full mouth" ate the header on exactly the
  // procedures with the longest names — PERIODONTAL MAINTENANCE, SCALING &
  // ROOT PLANING — so the part that identified the appointment was the part
  // that got truncated.
  //
  // The branch stays rather than being deleted: sealants are hygiene but are
  // tagged with teeth ("sealants #3,14,19,30"), so falling through to the
  // tooth case below would label a four-tooth visit "#3".
  if (isHygieneProcedure(procedure)) {
    return { prefix: "", procedure };
  }
  if (tooth) return { prefix: `#${tooth}`, procedure };
  return { prefix: "", procedure };
}
