import type { Patient, Provider } from "@/data/mockPatients";
import { isHygieneProcedure } from "@/data/mockPatients";
import type { CardColorMode } from "@/lib/cardVersions";
import { getProviderColor, type ProviderColor } from "@/lib/providerColors";

// Procedure families for the appointment-color card mode. Status hues are
// reserved: red/green for clinical and insurance state, amber/orange/brown for
// warnings and periapical findings. Appointment chrome stays in the brand
// spectrum — teal, blue, periwinkle, violet — so a scan of the board reads
// *kind of work*, not *patient status*.
//
//   Restorative  periwinkle → violet, lightest to most definitive
//   Hygiene      deep teal (prophy lighter, SRP a step darker)
//   Prosthetic   ice cyan (implants, dentures, aligners, night guards)
//   Visit        slate lavender (exams, consults, post-op)
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
  | "exam";

export type AppointmentFamily =
  | "restorative"
  | "hygiene"
  | "prosthetic"
  | "visit";

const BY_KIND: Record<AppointmentKind, ProviderColor> = {
  // Restorative: one hue walk, so composites vs crowns vs extractions are
  // related at a glance and still separable from 3–4 ft.
  filling: { bg: "#DCE5F9", fg: "#2D4F98", border: "#BDCEF4" },
  onlay: { bg: "#D2D8F6", fg: "#343E86", border: "#B4BCEC" },
  crown: { bg: "#DCD4F4", fg: "#463C84", border: "#C2B8E6" },
  endo: { bg: "#E4D4F2", fg: "#553A7A", border: "#CDB4E0" },
  extraction: { bg: "#E6D2EC", fg: "#5A356E", border: "#D0B8DC" },
  // Hygiene
  prophy: { bg: "#D0E6EB", fg: "#124555", border: "#A3CCD5" },
  srp: { bg: "#BFD9E0", fg: "#0E3644", border: "#8FC0C9" },
  // Ortho / prosthetic / implant
  implant: { bg: "#C8E0F0", fg: "#1A4E68", border: "#9CCBDC" },
  prosthetic: { bg: "#D4E6F2", fg: "#215872", border: "#B0D4E4" },
  // Exams, consults, post-op
  exam: { bg: "#E3E1EC", fg: "#4A4763", border: "#C9C6D6" },
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
  [
    /denture|aligner|night\s*guard|attachment|\bortho\b/i,
    "prosthetic",
  ],
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
  exam: "Exams & consults",
};

export const APPOINTMENT_FAMILY_LABELS: Record<AppointmentFamily, string> = {
  restorative: "Restorative",
  hygiene: "Hygiene",
  prosthetic: "Prosthetic",
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

  if (isHygieneProcedure(procedure)) {
    return { prefix: "Full mouth", procedure };
  }
  if (tooth) return { prefix: `#${tooth}`, procedure };
  return { prefix: "", procedure };
}
