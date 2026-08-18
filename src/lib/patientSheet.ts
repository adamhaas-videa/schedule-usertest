import type { Patient } from "@/data/mockPatients";

export interface Opportunity {
  count: number;
  label: string;
}

export interface UnscheduledTx {
  tooth: number;
  label: string;
}

/** Labels the static sheet odontogram (Figma 4679:6551). */
export const ODONTOGRAM_OPPORTUNITIES: Opportunity[] = [
  { count: 2, label: "Curodont" },
  { count: 2, label: "Filling" },
  { count: 1, label: "Crown" },
  { count: 1, label: "Root Canal" },
  { count: 1, label: "Extraction" },
];

export const FALLBACK_UNSCHEDULED: UnscheduledTx[] = [
  { tooth: 3, label: "Buildup/Post and Core D2950" },
  { tooth: 15, label: "Buildup/Post and Core D2950" },
];

function hash32(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function patientPhone(id: string): string {
  const n = hash32(id);
  const mid = String(200 + (n % 800)).padStart(3, "0");
  const last = String(1000 + ((n >>> 8) % 9000)).slice(-4);
  return `(555) ${mid}-${last}`;
}

export function allergyLabel(allergy: string): string {
  return allergy.replace(/\s+drugs$/i, "");
}

function parseToothTag(
  tag: string
): { tooth: number; rest: string } | null {
  const match = tag.match(/^#(\d{1,2})\s+(.+)$/);
  if (!match) return null;
  return { tooth: Number(match[1]), rest: match[2] };
}

export function procedureTooth(patient: Patient): number | null {
  for (const tag of patient.visitTags ?? []) {
    const parsed = parseToothTag(tag);
    if (parsed) return parsed.tooth;
  }
  return null;
}

export function tasksFor(patient: Patient): string[] {
  const tasks = ["Bitewings Due"];
  const perio =
    /perio|periodontal|scaling|root planing|\bsrp\b/i.test(
      [patient.procedure, ...(patient.visitTags ?? [])].join(" ")
    ) || /perio/i.test(patient.conditionAlert?.label ?? "");
  if (perio) tasks.push("Perio Maintenance Due");
  return tasks;
}

export function unscheduledTxFor(patient: Patient): UnscheduledTx[] {
  const today = procedureTooth(patient);
  const fromTags: UnscheduledTx[] = [];
  for (const tag of patient.visitTags ?? []) {
    const parsed = parseToothTag(tag);
    if (!parsed || parsed.tooth === today) continue;
    fromTags.push({
      tooth: parsed.tooth,
      label: titleCase(parsed.rest),
    });
  }
  if (fromTags.length > 0) return fromTags;

  const restorative = /restorative|crown|buildup|caries/i.test(
    (patient.aiFindings ?? []).join(" ")
  );
  if (!restorative) return [];

  const n = hash32(patient.id);
  const first = 2 + (n % 13);
  const second = 14 + ((n >>> 4) % 15);
  return [
    { tooth: first, label: "Buildup/Post and Core D2950" },
    { tooth: second, label: "Buildup/Post and Core D2950" },
  ];
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (ch) => ch.toUpperCase());
}
