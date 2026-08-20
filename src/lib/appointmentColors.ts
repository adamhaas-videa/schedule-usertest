import type { Patient, Provider } from "@/data/mockPatients";
import { isHygieneProcedure } from "@/data/mockPatients";
import type { CardColorMode } from "@/lib/cardVersions";
import { getProviderColor, type ProviderColor } from "@/lib/providerColors";

export type AppointmentKind =
  | "crown"
  | "filling"
  | "srp"
  | "prophy"
  | "endo"
  | "implant"
  | "extraction"
  | "exam";

// Same shape as provider colors so the card chrome can swap palettes without
// a second code path. Kept muted so appointment-coloring doesn't shout louder
// than the provider scheme it replaces.
const BY_KIND: Record<AppointmentKind, ProviderColor> = {
  crown: { bg: "#F1E6CC", fg: "#7C5712", border: "#E4D0A8" },
  filling: { bg: "#DCE5F9", fg: "#2D4F98", border: "#BDCEF4" },
  srp: { bg: "#F1DEDB", fg: "#8A423C", border: "#E4C5C0" },
  prophy: { bg: "#D6E8E5", fg: "#285B54", border: "#B3D4CF" },
  endo: { bg: "#E3E1EC", fg: "#4A4763", border: "#C9C6D6" },
  implant: { bg: "#D0E6EB", fg: "#124555", border: "#A3CCD5" },
  extraction: { bg: "#F1DEDB", fg: "#8A423C", border: "#E4C5C0" },
  exam: { bg: "#DEE9DC", fg: "#3C6B45", border: "#C0D4BC" },
};

const KIND_PATTERNS: [RegExp, AppointmentKind][] = [
  [/extract/i, "extraction"],
  [/implant/i, "implant"],
  [/root canal|endo/i, "endo"],
  [/crown|onlay|inlay|bridge|veneer/i, "crown"],
  [/filling|composite|caries/i, "filling"],
  [/scaling|root planing|\bsrp\b|deep cleaning|periodontal assessment/i, "srp"],
  [
    /prophylaxis|prophy|fluoride|sealants|whitening|periodontal maintenance/i,
    "prophy",
  ],
];

export function getAppointmentKind(procedure: string): AppointmentKind {
  return KIND_PATTERNS.find(([re]) => re.test(procedure))?.[1] ?? "exam";
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
