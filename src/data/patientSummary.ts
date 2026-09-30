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
import {
  formatShortDate,
  getVisitDate,
  getVisitMenu,
  type VisitMenu,
} from "@/lib/visitHistory";

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
function formatPastVisit(visitDate: Date, monthsAgo: number): string {
  const date = new Date(visitDate);
  date.setMonth(date.getMonth() - monthsAgo);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

/** One chiclet per mark type present, counted off the chart itself. */
export function countOpportunities(
  findings: ToothFinding[]
): SummaryOpportunity[] {
  const counts = new Map<ToothMark, number>();
  for (const { mark } of findings) {
    counts.set(mark, (counts.get(mark) ?? 0) + 1);
  }
  return OPPORTUNITY_ORDER.filter((mark) => counts.has(mark)).map((mark) => ({
    label: OPPORTUNITY_LABEL[mark],
    count: counts.get(mark)!,
  }));
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

  const opportunities = countOpportunities(findings);

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
      date: formatPastVisit(getVisitDate(patient), monthsAgo),
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

// ---------------------------------------------------------------------------
// Past visits
//
// What actually happened at an earlier appointment, for the summary drawer's
// visit picker. The point of the section is the gap between the two: what the
// visit was *booked* as, and what was *done* once the patient was in the chair.
// Anything done that the booking didn't cover is unscheduled work, and that is
// what the front desk and the provider both want to see.
// ---------------------------------------------------------------------------

export interface VisitWorkItem {
  /** Universal tooth number, where the work was tooth-specific. */
  tooth?: number;
  label: string;
  /**
   * False when the work wasn't part of what the visit was booked for — added
   * chairside. These are the rows the section calls out as same-day work.
   */
  planned: boolean;
}

export interface PastVisit {
  date: Date;
  /** What the appointment was on the books as. */
  plannedProcedure: string;
  providerName: string;
  /** Restorative and surgical work. */
  clinical: VisitWorkItem[];
  /** Hygiene and preventive tasks. */
  hygiene: VisitWorkItem[];
  /** Chart and front-desk tasks closed out at the visit — the past-tense
   *  mirror of the drawer's outstanding Tasks list. */
  completedTasks: string[];
  /** The provider's recap for this visit, two sentences like the design. */
  voiceNote: string;
}

const HYGIENE_BOOKINGS = [
  "Prophylaxis & Exam",
  "Periodontal Maintenance",
  "Bitewings + Prophy",
  "Recall Exam & Cleaning",
] as const;

const CLINICAL_BOOKINGS = [
  "Composite Filling",
  "Crown Prep",
  "Crown Delivery",
  "Limited Exam",
  "Endodontic Therapy",
] as const;

// Hygiene work is charted per visit, not per tooth, so these carry no number.
const HYGIENE_CORE: Record<string, string> = {
  "Periodontal Maintenance": "Periodontal maintenance D4910",
  "Recall Exam & Cleaning": "Adult prophylaxis D1110",
  "Prophylaxis & Exam": "Adult prophylaxis D1110",
  "Bitewings + Prophy": "Adult prophylaxis D1110",
};

const HYGIENE_EXTRAS = [
  "Fluoride varnish D1206",
  "Four bitewings D0274",
  "Oral hygiene instruction D1330",
  "Periodic oral evaluation D0120",
] as const;

// The add-on that turns up once the patient is in the chair. Hygiene visits
// escalate into perio or a small restoration; restorative visits pick up a
// second tooth or the build-up the prep turned out to need.
const COMPLETED_RESTORATIVE = [
  "Resin composite, 2 surface D2392",
  "Amalgam, 2 surface D2150",
  "Crown seat & cementation D2920",
  "Sealant, per tooth D1351",
] as const;

const HYGIENE_ADDONS = [
  "Scaling & root planing, UR quadrant D4341",
  "Scaling & root planing, LR quadrant D4341",
  "Full mouth debridement D4355",
  "Arestin, per tooth D4381",
] as const;

/**
 * Past visits, newest first, sharing the date spine the Patient Summary tab's
 * own picker uses so the two never disagree. The first entry in that spine is
 * today's visit, which isn't past, so it is dropped.
 *
 * Completed work is drawn from the patient's own chart findings rather than
 * invented, so a crown listed as seated here is a crown you can see on the
 * odontogram. Kept out of `buildPatientSummary` deliberately: it calls that
 * function, and folding it in would recurse.
 */
export function buildPastVisits(patient: Patient): PastVisit[] {
  const summary = buildPatientSummary(patient);
  const dates = getVisitMenu(patient, "chart")
    .groups[0].visits.slice(1)
    .map((visit) => visit.date);

  // Existing restorations, oldest work assigned to the oldest visit, so the
  // chart reads as something that accumulated over these appointments.
  //
  // Teeth carrying unscheduled treatment are held back: that list is work
  // diagnosed and NOT yet booked, so the same tooth cannot also appear here as
  // already completed. Without this the panel contradicts itself in two
  // sections a few inches apart.
  const pending = new Set(summary.unscheduledTx.map((tx) => tx.tooth));
  // Deduped by tooth: `findings` can name the same tooth more than once (a
  // range and a bare number in the same phrase, say), and a tooth restored
  // twice across the history reads as a charting error.
  const usedTeeth = new Set<number>();
  const restorations = summary.findings.filter((finding) => {
    if (finding.mark === "incipient" || pending.has(finding.tooth)) return false;
    if (usedTeeth.has(finding.tooth)) return false;
    usedTeeth.add(finding.tooth);
    return true;
  });
  let nextRestoration = 0;

  // Some charts are all pending work, leaving nothing completed to draw on.
  // Fall back to restorations on teeth the chart says nothing about.
  const spare = ALL_TEETH.filter(
    (tooth) => !pending.has(tooth) && !taken(summary, tooth)
  );
  let nextSpare = 0;
  const takeWork = (): VisitWorkItem | null => {
    const finding = restorations[nextRestoration];
    if (finding) {
      nextRestoration++;
      return {
        tooth: finding.tooth,
        label: TX_BY_MARK[finding.mark],
        planned: true,
      };
    }
    const tooth = spare[nextSpare];
    if (tooth === undefined) return null;
    nextSpare++;
    return {
      tooth,
      label: COMPLETED_RESTORATIVE[nextSpare % COMPLETED_RESTORATIVE.length],
      planned: true,
    };
  };

  return dates.map((date, index) => {
    const rand = mulberry32(hashStringToSeed(`${patient.id}-visit-${index}`));
    const isHygiene = rand() < 0.6;
    const plannedProcedure = isHygiene
      ? pick(rand, HYGIENE_BOOKINGS)
      : pick(rand, CLINICAL_BOOKINGS);

    const hygiene: VisitWorkItem[] = [];
    const clinical: VisitWorkItem[] = [];

    if (isHygiene) {
      hygiene.push({
        label: HYGIENE_CORE[plannedProcedure] ?? "Adult prophylaxis D1110",
        planned: true,
      });
      hygiene.push({ label: pick(rand, HYGIENE_EXTRAS), planned: true });
      if (rand() < 0.4) {
        hygiene.push({ label: pick(rand, HYGIENE_EXTRAS), planned: true });
      }
      // Hygiene visit that turned into perio therapy — booked for a cleaning,
      // left having had quadrant SRP.
      if (rand() < 0.45) {
        hygiene.push({ label: pick(rand, HYGIENE_ADDONS), planned: false });
      }
    } else {
      const booked = takeWork();
      if (booked) clinical.push(booked);
      hygiene.push({ label: "Periodic oral evaluation D0120", planned: true });
      // A second tooth treated the same day — diagnosed and completed in the
      // chair rather than rebooked.
      if (rand() < 0.5) {
        const extra = takeWork();
        if (extra && extra.tooth !== booked?.tooth) {
          clinical.push({ ...extra, planned: false });
        }
      }
    }

    const providerName = patient.provider?.name ?? "Unassigned";
    const allWork = [...clinical, ...hygiene];
    const has = (re: RegExp) => allWork.some((item) => re.test(item.label));

    // Seeded after the work above so adding these left every earlier visit's
    // procedures exactly as they were.
    const completedTasks = ["Medical history reviewed"];
    if (has(/bitewing/i)) completedTasks.push("Bitewings taken");
    if (has(/periodontal|scaling|debridement|arestin/i)) {
      completedTasks.push("Perio charting updated");
    }
    if (clinical.length > 0) completedTasks.push("Post-op instructions given");
    if (!isHygiene && rand() < 0.5) completedTasks.push("Treatment plan presented");
    if (isHygiene) completedTasks.push("Next recall booked");

    return {
      date,
      plannedProcedure,
      providerName,
      clinical,
      hygiene,
      completedTasks,
      voiceNote: buildVisitNote(providerName, plannedProcedure, allWork, rand),
    };
  });
}

const NOTE_WATCH = [
  "Monitoring was flagged on the upper arch and the patient was advised to keep the existing hygiene interval.",
  "Monitoring was flagged on the lower arch; home care was reviewed with the patient.",
  "No new symptoms reported; the patient was advised to keep the existing hygiene interval.",
  "Localized bleeding on probing noted; the patient was coached on interproximal cleaning.",
] as const;

/** "Resin composite, 2 surface D2392" → "resin composite, 2 surface". */
function spokenLabel(label: string): string {
  const plain = label.replace(/\s+D\d{4}$/, "");
  return plain.charAt(0).toLowerCase() + plain.slice(1);
}

// What was captured, then what to watch — the same two-sentence shape as the
// voice-note recap everywhere else. Same-day work leads, because it is the
// part of the visit nobody reading the booking would expect.
function buildVisitNote(
  providerName: string,
  plannedProcedure: string,
  work: VisitWorkItem[],
  rand: () => number
): string {
  const sameDay = work.find((item) => !item.planned);
  const toothWork = work.find((item) => item.planned && item.tooth);
  const first = sameDay
    ? `${providerName} recorded a ${plannedProcedure.toLowerCase()} visit that added ${spokenLabel(sameDay.label)}${sameDay.tooth ? ` on #${sameDay.tooth}` : ""} chairside.`
    : toothWork
      ? `${providerName} recorded ${spokenLabel(toothWork.label)} on #${toothWork.tooth} completed as planned.`
      : `${providerName} recorded a routine ${plannedProcedure.toLowerCase()} visit completed as planned.`;
  return `${first} ${pick(rand, NOTE_WATCH)}`;
}

function taken(summary: PatientSummary, tooth: number): boolean {
  return summary.findings.some((finding) => finding.tooth === tooth);
}

/**
 * Work done at the visit that the booking didn't cover — diagnosed and treated
 * in the chair. Called "same-day" rather than "unscheduled" throughout: the
 * panel's Unscheduled Tx list means the opposite thing (diagnosed, still not
 * booked), and the two sit a few inches apart.
 */
export function countSameDay(visit: PastVisit): number {
  return [...visit.clinical, ...visit.hygiene].filter((item) => !item.planned)
    .length;
}

/**
 * The picker menu for those visits. Chips summarise each one so same-day work
 * is visible in the list itself, not only after you open a visit — the
 * accented chip is the whole point of the section.
 */
export function buildPastVisitMenu(visits: PastVisit[]): VisitMenu {
  return {
    header: `Past visits · ${visits.length}`,
    groups: [
      {
        visits: visits.map((visit) => {
          const chips: { label: string; accent?: boolean }[] = [];
          if (visit.clinical.length > 0) {
            chips.push({
              label: `${visit.clinical.length} restorative`,
            });
          }
          if (visit.hygiene.length > 0) {
            chips.push({ label: `${visit.hygiene.length} hygiene` });
          }
          const sameDay = countSameDay(visit);
          if (sameDay > 0) {
            chips.push({ label: `${sameDay} same-day`, accent: true });
          }
          return { date: visit.date, chips };
        }),
      },
    ],
  };
}

/** "03/12/26 · Prophylaxis & Exam" — the one-line form used in collapsed copy. */
export function formatPastVisitLine(visit: PastVisit): string {
  return `${formatShortDate(visit.date)} · ${visit.plannedProcedure}`;
}

// ---------------------------------------------------------------------------
// Treatment history
//
// The Patient Summary tab's odontogram draws completed work as its own layer,
// under the AI opportunities. Only tooth-specific clinical work is charted:
// hygiene and perio are per-visit, so they stay in the visit read-out.
// ---------------------------------------------------------------------------

export interface CompletedTreatment {
  tooth: number;
  mark: ToothMark;
  /** The CDT line as the visit read-out prints it. */
  label: string;
  date: Date;
}

/** Chart mark for a completed CDT line — the tooth's shape once it's done. */
function markForWork(label: string): ToothMark {
  if (/extract/i.test(label)) return "extraction";
  if (/implant/i.test(label)) return "implant";
  if (/buildup|post and core|root canal|endo/i.test(label)) return "root-canal";
  if (/crown|onlay|inlay|veneer/i.test(label)) return "crown";
  return "filling";
}

/** Every tooth-specific procedure across the patient's past visits, oldest
 *  first, so the chart can be replayed up to any visit date. */
export function buildTreatmentHistory(visits: PastVisit[]): CompletedTreatment[] {
  return visits
    .flatMap((visit) =>
      visit.clinical
        .filter((item) => item.tooth !== undefined)
        .map((item) => ({
          tooth: item.tooth!,
          mark: markForWork(item.label),
          label: item.label,
          date: visit.date,
        }))
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
