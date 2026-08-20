// Derived view model for the patient summary slideout.
//
// Nothing here is stored: the panel needs a lot more per-patient detail than
// `mockPatients` carries (phone, chart findings, tasks, unscheduled treatment,
// a voice-note recap), so we derive it. Two rules keep the demo coherent:
//
//   1. Everything is seeded off `patient.id`, so a patient's summary is stable
//      across renders, reloads and version switches — same as the provider /
//      insurance enrichment in `mockPatients.ts`.
//   2. Where the mock record already says something clinical, we read it rather
//      than invent: tooth numbers and procedures are parsed out of `visitTags`
//      and `aiFindings`, so the odontogram, the AI opportunity chiclets and the
//      unscheduled treatment list all agree with the card text.
import {
  computeAge,
  hashStringToSeed,
  isHygieneProcedure,
  mulberry32,
  type Patient,
} from "@/data/mockPatients";

export type ToothMark =
  | "crown"
  | "filling"
  | "incipient"
  | "extraction"
  | "implant"
  | "root-canal";

export interface ToothFinding {
  tooth: number;
  mark: ToothMark;
}

export type AlertTone = "error" | "warning" | "success";

export interface SummaryAlert {
  label: string;
  tone: AlertTone;
}

export interface SummaryOpportunity {
  label: string;
  count: number;
}

export interface SummaryTask {
  id: string;
  label: string;
}

export interface UnscheduledTx {
  tooth: number;
  label: string;
}

export interface LastAppointment {
  date: string;
  procedure: string;
  providerName: string;
}

export interface PatientSummary {
  identity: string;
  phone: string;
  alerts: SummaryAlert[];
  voiceNoteSummary: string;
  lastAppointment: LastAppointment;
  opportunities: SummaryOpportunity[];
  findings: ToothFinding[];
  tasks: SummaryTask[];
  unscheduledTx: UnscheduledTx[];
}

// Medical alerts sit alongside allergies in the header row. Real charts pull
// these from the medical history; here they are seeded per patient.
const MEDICAL_ALERTS = [
  "Diabetes",
  "Hypertension",
  "Anticoagulant",
  "Pregnancy",
  "Latex sensitivity",
  "Pacemaker",
] as const;

const PAST_PROCEDURES = [
  "Prophylaxis & Exam",
  "Bitewings + Prophy",
  "Composite Filling",
  "Periodontal Maintenance",
  "Crown Delivery",
  "Limited Exam",
] as const;

// Universal numbering: 1–16 upper (right to left), 17–32 lower (left to right).
const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1);
const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => i + 17);
const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH];

// Procedure vocabulary → chart mark. Order matters: the first pattern that
// matches a phrase wins, so "non-restorable #18" reads as an extraction rather
// than a restoration.
const MARK_PATTERNS: [RegExp, ToothMark][] = [
  [/non-restorable|extract/i, "extraction"],
  [/implant/i, "implant"],
  [/root canal|periapical|pulpitis|endo/i, "root-canal"],
  [/crown|onlay|inlay|bridge|veneer|fracture/i, "crown"],
  [/caries|composite|filling|restorative/i, "filling"],
  [/erosion|incipient|demineral|watch/i, "incipient"],
];

// CDT-coded treatment that was diagnosed but never booked — the "unscheduled
// tx" column. Keyed by the mark that produced it so the two lists agree.
const TX_BY_MARK: Record<ToothMark, string> = {
  crown: "Crown Porcelain D2740",
  filling: "Resin Composite D2392",
  "root-canal": "Buildup/Post and Core D2950",
  extraction: "Extraction Erupted D7140",
  implant: "Implant Endosteal D6010",
  incipient: "Caries Arresting D1354",
};

const OPPORTUNITY_LABEL: Record<ToothMark, string> = {
  incipient: "Curodont",
  filling: "Filling",
  crown: "Crown",
  "root-canal": "Root Canal",
  extraction: "Extraction",
  implant: "Implant",
};

// Huddle odontogram hover copy (videa-ai-ui defaultRecommendationNames).
export const HOVER_RECOMMENDATION: Record<ToothMark, string> = {
  crown: "Crown",
  filling: "Filling",
  incipient: "Incipient Tx",
  extraction: "Extraction",
  implant: "Implant",
  "root-canal": "Root Canal",
};

// AI opportunity chiclets read in escalating-cost order in the design.
const OPPORTUNITY_ORDER: ToothMark[] = [
  "incipient",
  "filling",
  "crown",
  "root-canal",
  "extraction",
  "implant",
];

function pick<T>(rand: () => number, pool: readonly T[]): T {
  return pool[Math.floor(rand() * pool.length)];
}

// Pull tooth numbers out of a clinical phrase and classify what was done to
// them: "#4–6 bridge impression" → 4, 5, 6 crowned; "sealants #3,14,19,30" →
// four incipient watches.
function parseFindings(phrases: string[]): ToothFinding[] {
  const out: ToothFinding[] = [];

  for (const phrase of phrases) {
    const mark = MARK_PATTERNS.find(([re]) => re.test(phrase))?.[1];
    if (!mark) continue;

    // Ranges first (#4–6 / #19-21), then bare numbers and comma lists.
    const ranges = [...phrase.matchAll(/#?(\d{1,2})\s*[–-]\s*#?(\d{1,2})/g)];
    const consumed = new Set<string>();
    for (const [full, from, to] of ranges) {
      consumed.add(full);
      const start = Number(from);
      const end = Number(to);
      if (start < 1 || end > 32 || end < start || end - start > 5) continue;
      for (let t = start; t <= end; t++) out.push({ tooth: t, mark });
    }

    let rest = phrase;
    for (const full of consumed) rest = rest.replace(full, " ");
    for (const [, num] of rest.matchAll(/#\s*(\d{1,2}(?:\s*,\s*\d{1,2})*)/g)) {
      for (const part of num.split(",")) {
        const tooth = Number(part.trim());
        if (tooth >= 1 && tooth <= 32) out.push({ tooth, mark });
      }
    }
  }

  return out;
}

// Chart history the mock text does not mention: a couple of incipient lesions
// and an existing restoration or two, so no patient shows a blank odontogram.
function seedBackgroundFindings(
  rand: () => number,
  taken: Set<number>
): ToothFinding[] {
  const out: ToothFinding[] = [];
  const incipientCount = 1 + Math.floor(rand() * 3);
  const restorationCount = 1 + Math.floor(rand() * 2);

  const add = (mark: ToothMark) => {
    for (let attempt = 0; attempt < 12; attempt++) {
      const tooth = pick(rand, ALL_TEETH);
      if (taken.has(tooth)) continue;
      taken.add(tooth);
      out.push({ tooth, mark });
      return;
    }
  };

  for (let i = 0; i < incipientCount; i++) add("incipient");
  for (let i = 0; i < restorationCount; i++)
    add(rand() < 0.6 ? "filling" : "crown");

  return out;
}

function formatPhone(rand: () => number): string {
  const exchange = 200 + Math.floor(rand() * 700);
  const line = Math.floor(rand() * 10000)
    .toString()
    .padStart(4, "0");
  return `(555) ${exchange}-${line}`;
}

// A visit N months before today's appointment, formatted like the DOB strings
// already in the mock data (MM/DD/YYYY).
function formatPastVisit(appointmentDate: string, monthsAgo: number): string {
  const [year, month, day] = appointmentDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() - monthsAgo);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

export function buildPatientSummary(patient: Patient): PatientSummary {
  const rand = mulberry32(hashStringToSeed(`${patient.id}-summary`));
  const age = computeAge(patient.dob);

  const alerts: SummaryAlert[] = [
    // Allergies are the hard stop, so they lead and carry the error tone.
    ...(patient.allergies ?? []).map((label) => ({
      label,
      tone: "error" as const,
    })),
  ];
  if (rand() < 0.55) {
    alerts.push({ label: pick(rand, MEDICAL_ALERTS), tone: "warning" });
  }
  if (patient.conditionAlert) {
    const severity = patient.conditionAlert.severity;
    alerts.push({
      label: patient.conditionAlert.label,
      tone:
        severity === "error"
          ? "error"
          : severity === "success"
            ? "success"
            : "warning",
    });
  }

  // Parsed first so explicit clinical text wins the tooth; background findings
  // fill in around it.
  const parsed = parseFindings([
    ...(patient.visitTags ?? []),
    ...(patient.aiFindings ?? []),
    patient.procedure,
  ]);
  const taken = new Set(parsed.map((f) => f.tooth));
  const findings = [...parsed, ...seedBackgroundFindings(rand, taken)];

  // One chiclet per mark type present, counted off the chart itself.
  const counts = new Map<ToothMark, number>();
  for (const { mark } of findings) {
    counts.set(mark, (counts.get(mark) ?? 0) + 1);
  }
  const opportunities = OPPORTUNITY_ORDER.filter((mark) => counts.has(mark)).map(
    (mark) => ({ label: OPPORTUNITY_LABEL[mark], count: counts.get(mark)! })
  );

  // Treatment diagnosed but not booked: the heavier findings, which is what a
  // front desk would chase.
  const unscheduledTx = findings
    .filter((f) => f.mark === "root-canal" || f.mark === "crown")
    .slice(0, 3)
    .map((f) => ({ tooth: f.tooth, label: TX_BY_MARK[f.mark] }));

  const tasks: SummaryTask[] = [];
  if (rand() < 0.8) tasks.push({ id: "bitewings", label: "Bitewings Due" });
  if (patient.conditionAlert?.label.includes("Perio")) {
    tasks.push({ id: "perio", label: "Perio Maintenance Due" });
  } else if (rand() < 0.5) {
    tasks.push({ id: "fmx", label: "FMX Due" });
  }

  const monthsAgo = 3 + Math.floor(rand() * 7);
  const firstFinding = findings[0];
  const quadrant = firstFinding
    ? firstFinding.tooth <= 16
      ? "upper"
      : "lower"
    : "upper";

  return {
    identity: `Age ${age} • DOB ${patient.dob}`,
    phone: formatPhone(rand),
    alerts,
    // Two sentences, per the design: what was captured, then what to watch.
    voiceNoteSummary: `${patient.provider?.name ?? "Provider"} recorded a ${monthsAgo}-month recall exam with no new symptoms reported. Monitoring was flagged on the ${quadrant} arch and the patient was advised to keep the existing hygiene interval.`,
    lastAppointment: {
      date: formatPastVisit(patient.appointmentDate, monthsAgo),
      procedure: pick(rand, PAST_PROCEDURES),
      providerName: patient.provider?.name ?? "Unassigned",
    },
    opportunities,
    findings,
    tasks,
    unscheduledTx,
  };
}

const PERIO_ALERT = /perio|bone loss/i;

export function getCardMedicalAlerts(patient: Patient): string[] {
  return buildPatientSummary(patient)
    .alerts.filter((alert) => !PERIO_ALERT.test(alert.label))
    .map((alert) => alert.label);
}

const QUADRANT_LABEL: Record<string, string> = {
  UL: "UL quadrant",
  UR: "UR quadrant",
  LL: "LL quadrant",
  LR: "LR quadrant",
};

function toothQuadrant(tooth: number): string {
  if (tooth >= 1 && tooth <= 8) return "UR";
  if (tooth >= 9 && tooth <= 16) return "UL";
  if (tooth >= 17 && tooth <= 24) return "LL";
  return "LR";
}

// Two sentences, two lines on the schedule card. Hygiene visits lean perio;
// restorative visits lean findings. Seeded off the same patient id as the
// slideout so the card and the panel don't contradict each other.
export function buildCardSummary(patient: Patient): string {
  const summary = buildPatientSummary(patient);
  const hygiene = isHygieneProcedure(patient.procedure);
  const marked = summary.findings.filter((f) => f.mark !== "incipient");
  const lead = marked[0] ?? summary.findings[0];
  const caries = summary.findings.filter((f) => f.mark === "filling");
  const crowns = summary.findings.filter((f) => f.mark === "crown");
  const quad = lead ? QUADRANT_LABEL[toothQuadrant(lead.tooth)] : "UL quadrant";
  const perio = patient.conditionAlert?.label ?? "No bone loss detected";

  if (hygiene) {
    const second =
      perio === "No bone loss detected"
        ? "Periodontal tissues stable; recare interval unchanged."
        : `${perio} with localized bleeding on probing.`;
    if (caries.length >= 2) {
      const nums = caries
        .slice(0, 2)
        .map((f) => `#${f.tooth}`)
        .join(", ");
      return `Watch caries ${nums}. ${second}`;
    }
    return `Gingival recession noted, ${quad}. ${second}`;
  }

  if (caries.length >= 2) {
    const nums = caries
      .slice(0, 2)
      .map((f) => `#${f.tooth}`)
      .join(", ");
    return `Caries detected ${nums}. Gingival recession noted, ${quad}.`;
  }
  if (crowns.length > 0) {
    return `Crown recommended #${crowns[0].tooth}. Gingival recession noted, ${quad}.`;
  }
  if (lead) {
    return `${OPPORTUNITY_LABEL[lead.mark]} noted #${lead.tooth}. Monitoring flagged on the ${quad}.`;
  }
  return `No new findings this visit. ${perio}.`;
}

