export type ProviderRole = "DDS" | "DMD" | "RDH";

export interface Provider {
  id: string;
  initials: string;
  name: string;
  role: ProviderRole;
}

export interface Insurance {
  carrier: string;
  remainingBenefit: number;
  status: "Active" | "Pending" | "Inactive";
}

export type ConditionAlertSeverity = "success" | "accent" | "warning" | "error";

export interface ConditionAlert {
  label: string;
  severity: ConditionAlertSeverity;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  allergies?: string[];
  procedure: string;
  appointmentTime: string;
  operatory: number;
  status: "in-chair" | "upcoming" | "completed";
  aiFindings?: string[];
  visitTags?: string[];
  appointmentDate: string;
  durationMinutes: number;
  /**
   * Further procedures booked into this same chair time, beyond `procedure`.
   * The card header names the lead treatment and counts these as "+N".
   */
  additionalProcedures?: string[];
  readyForChair?: boolean;
  provider?: Provider;
  hygienist?: Provider;
  insurance?: Insurance;
  conditionAlert?: ConditionAlert;
}

/** Operatories shown on every card-demo schedule screen. */
export const ALL_OPERATORIES: number[] = [1, 2, 3, 4, 5, 6];

// Non-appointment time blocks (e.g. lunch) rendered on the operatory timeline.
export interface ScheduleBlock {
  id: string;
  operatory: number;
  startTime: string;
  durationMinutes: number;
  label: string;
}

export const mockBlocks: ScheduleBlock[] = [
  // Hygiene breaks at noon so the dentist chairs can keep running, and the
  // dentists go an hour later. The board is never entirely dark.
  { id: "lunch-op1", operatory: 1, startTime: "1:00 PM", durationMinutes: 60, label: "Lunch" },
  { id: "lunch-op2", operatory: 2, startTime: "1:00 PM", durationMinutes: 60, label: "Lunch" },
  { id: "lunch-op3", operatory: 3, startTime: "1:00 PM", durationMinutes: 60, label: "Lunch" },
  { id: "lunch-op4", operatory: 4, startTime: "12:00 PM", durationMinutes: 60, label: "Lunch" },
  { id: "lunch-op5", operatory: 5, startTime: "12:00 PM", durationMinutes: 60, label: "Lunch" },
  { id: "lunch-op6", operatory: 6, startTime: "12:00 PM", durationMinutes: 60, label: "Lunch" },
];

export function timeToMinutes(time: string): number {
  const [timePart, meridiem] = time.split(" ");
  const [hoursStr, minutesStr] = timePart.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${meridiem}`;
}

export function derivePatientStatus(
  patient: Patient,
  nowMinutes: number
): Patient["status"] {
  const start = timeToMinutes(patient.appointmentTime);
  const end = start + patient.durationMinutes;
  if (nowMinutes >= end) return "completed";
  if (nowMinutes >= start) return "in-chair";
  return "upcoming";
}

export function deriveReadyForChair(
  patient: Patient,
  nowMinutes: number,
  windowMinutes: number
): boolean {
  const start = timeToMinutes(patient.appointmentTime);
  const delta = start - nowMinutes;
  return delta > 0 && delta <= windowMinutes;
}

export function hashStringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, pool: readonly T[]): T {
  return pool[Math.floor(rand() * pool.length)];
}

export const DENTISTS: readonly Provider[] = [
  { id: "mg", initials: "MG", name: "Dr. Mira Gupta", role: "DDS" },
  { id: "jr", initials: "JR", name: "Dr. Jonas Reyes", role: "DMD" },
  { id: "at", initials: "AT", name: "Dr. Aisha Tan", role: "DDS" },
  { id: "ek", initials: "EK", name: "Dr. Elias Kovac", role: "DMD" },
];

export const HYGIENISTS: readonly Provider[] = [
  { id: "lc", initials: "LC", name: "Lina Castillo", role: "RDH" },
  { id: "bp", initials: "BP", name: "Beth Park", role: "RDH" },
  { id: "ng", initials: "NG", name: "Noah Greene", role: "RDH" },
];

/**
 * Chairs the hygiene schedule runs out of, one hygienist to a room for the
 * whole day. Dentists float between the remaining chairs by procedure, which
 * is the layout most offices actually run: hygiene is booked against a room,
 * restorative against a person.
 *
 * Index-aligned with HYGIENISTS, so Op 4 is Lina Castillo's room all day.
 */
export const HYGIENE_OPERATORIES: readonly number[] = [4, 5, 6];

export function hygienistForOperatory(operatory: number): Provider | undefined {
  const i = HYGIENE_OPERATORIES.indexOf(operatory);
  return i >= 0 ? HYGIENISTS[i] : undefined;
}

const INSURANCE_CARRIERS = [
  "Delta Dental",
  "MetLife",
  "Cigna",
  "Aetna",
  "Guardian",
  "UnitedHealthcare",
  "BlueCross",
] as const;

const INSURANCE_STATUS: readonly Insurance["status"][] = [
  "Active",
  "Active",
  "Active",
  "Active",
  "Pending",
  "Inactive",
];

const CONDITION_ALERTS: readonly ConditionAlert[] = [
  { label: "No bone loss detected", severity: "success" },
  { label: "Stage 1 Perio", severity: "accent" },
  { label: "Stage 2 Perio", severity: "warning" },
  { label: "Stage 3 Perio", severity: "error" },
];

const HYGIENE_PROCEDURE_PATTERNS = [
  /prophylaxis/i,
  /periodontal maintenance/i,
  /scaling/i,
  /root planing/i,
  /\bsrp\b/i,
  /fluoride/i,
  /sealants/i,
  /deep cleaning/i,
  /periodontal assessment/i,
];

export function isHygieneProcedure(procedure: string): boolean {
  return HYGIENE_PROCEDURE_PATTERNS.some((re) => re.test(procedure));
}

function buildInsurance(rand: () => number): Insurance {
  return {
    carrier: pick(rand, INSURANCE_CARRIERS),
    remainingBenefit: Math.floor(rand() * 76) * 20,
    status: pick(rand, INSURANCE_STATUS),
  };
}

export function enrichPatient(patient: Patient): Patient {
  if (
    patient.provider &&
    patient.insurance &&
    "conditionAlert" in patient &&
    "hygienist" in patient
  ) {
    return patient;
  }

  const rand = mulberry32(hashStringToSeed(patient.id));

  const hygieneLed = isHygieneProcedure(patient.procedure);
  const dentist = pick(rand, DENTISTS);
  const hygienist = pick(rand, HYGIENISTS);

  const provider: Provider = hygieneLed
    ? hygienistForOperatory(patient.operatory) ?? hygienist
    : dentist;
  const secondaryHygienist: Provider | undefined = hygieneLed
    ? undefined
    : rand() < 0.55
      ? hygienist
      : undefined;

  const insurance = patient.insurance ?? buildInsurance(rand);
  const alert = pick(rand, CONDITION_ALERTS);

  return {
    ...patient,
    provider: patient.provider ?? provider,
    hygienist: patient.hygienist ?? secondaryHygienist,
    insurance,
    conditionAlert: patient.conditionAlert ?? alert,
  };
}

export function applySimulatedTime(
  patient: Patient,
  nowMinutes: number,
  readyWindowMinutes: number
): Patient {
  const status = derivePatientStatus(patient, nowMinutes);
  const enriched = enrichPatient(patient);
  return {
    ...enriched,
    status,
    readyForChair:
      status === "upcoming"
        ? deriveReadyForChair(patient, nowMinutes, readyWindowMinutes)
        : false,
  };
}

export function computeAge(dob: string): number {
  const [month, day, year] = dob.split("/").map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export const mockPatients: Patient[] = [
  // ─── Operatory 1 — dentist chair · providers float by procedure ───
  //  8:00 AM   30m  Denture Adjustment  ·  Patricia Davis
  //  8:30 AM   60m  Crown Prep  ·  Victor Nguyen
  //  9:30 AM   60m  Composite Filling  ·  Brian Murphy
  // 10:30 AM   60m  Composite Filling  ·  Isabella Ross
  // 11:30 AM   30m  Bite Adjustment  ·  Jennifer Reed
  // 12:00 PM   60m  Inlay/Onlay Prep  ·  Gregory Hall
  //  2:00 PM   60m  Implant Placement  ·  Thomas Rivera
  //  3:00 PM   60m  Crown Delivery  ·  Derek Shaw
  //  4:00 PM   60m  Night Guard Impression  ·  Mark Anderson
  {
    id: "p11",
    name: "Patricia Davis",
    dob: "02/14/1968",
    procedure: "Denture Adjustment",
    appointmentTime: "8:00 AM",
    operatory: 1,
    status: "completed",
    visitTags: ["denture adjustment"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p35",
    name: "Victor Nguyen",
    dob: "07/14/1971",
    allergies: ["Penicillin"],
    procedure: "Crown Prep",
    appointmentTime: "8:30 AM",
    operatory: 1,
    status: "completed",
    visitTags: ["#19 crown prep"],
    aiFindings: ["Restorative work needed", "Fracture line #19"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Buildup/Post and Core D2950"],
  },
  {
    id: "p28",
    name: "Brian Murphy",
    dob: "07/21/1992",
    procedure: "Composite Filling",
    appointmentTime: "9:30 AM",
    operatory: 1,
    status: "upcoming",
    visitTags: ["#3 & 4 fillings"],
    aiFindings: ["Caries detected #3"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p37",
    name: "Isabella Ross",
    dob: "05/23/1998",
    procedure: "Composite Filling",
    appointmentTime: "10:30 AM",
    operatory: 1,
    status: "upcoming",
    readyForChair: true,
    visitTags: ["#12 composite"],
    aiFindings: ["Caries detected #12"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p29",
    name: "Jennifer Reed",
    dob: "04/18/1980",
    procedure: "Bite Adjustment",
    appointmentTime: "11:30 AM",
    operatory: 1,
    status: "upcoming",
    visitTags: ["occlusal adjustment"],
    aiFindings: ["TMJ irregularity noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p18",
    name: "Gregory Hall",
    dob: "03/22/1965",
    procedure: "Inlay/Onlay Prep",
    appointmentTime: "12:00 PM",
    operatory: 1,
    status: "upcoming",
    visitTags: ["#14 onlay prep"],
    aiFindings: ["Restorative work needed", "Caries detected #14"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p14",
    name: "Thomas Rivera",
    dob: "07/11/1970",
    allergies: ["Aspirin"],
    procedure: "Implant Placement",
    appointmentTime: "2:00 PM",
    operatory: 1,
    status: "upcoming",
    visitTags: ["#30 implant placement"],
    aiFindings: ["Bone density adequate", "Ridge augmentation recommended"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Bone graft, site preservation D7953"],
  },
  {
    id: "p46",
    name: "Derek Shaw",
    dob: "07/03/1967",
    allergies: ["Codeine"],
    procedure: "Crown Delivery",
    appointmentTime: "3:00 PM",
    operatory: 1,
    status: "upcoming",
    visitTags: ["#30 crown seat"],
    aiFindings: ["Marginal fit verified"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p20",
    name: "Mark Anderson",
    dob: "11/28/1977",
    procedure: "Night Guard Impression",
    appointmentTime: "4:00 PM",
    operatory: 1,
    status: "upcoming",
    visitTags: ["night guard impression"],
    aiFindings: ["Bruxism wear patterns"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  // ─── Operatory 2 — dentist chair · providers float by procedure ───
  //  8:00 AM   30m  Periodic Exam  ·  Robert Johnson
  //  8:30 AM   30m  Aligner Check  ·  Nadia Okafor
  //  9:00 AM   60m  Root Canal  ·  Marcus Bell
  // 10:00 AM   60m  Implant Placement  ·  Henry Foster
  // 11:00 AM   30m  Attachment Placement  ·  Theo Lindqvist
  // 11:30 AM   30m  Post-Op Check  ·  Oscar Reed
  // 12:00 PM   60m  Teeth Whitening  ·  Vanessa Cole
  //  2:00 PM   60m  Teeth Whitening  ·  Lisa Park
  //  3:00 PM   60m  Ortho Consultation  ·  Marcus Adeyemi
  //  4:00 PM   60m  Denture Reline  ·  Leo Barnes
  {
    id: "p4",
    name: "Robert Johnson",
    dob: "08/30/1960",
    allergies: ["Codeine"],
    procedure: "Periodic Exam",
    appointmentTime: "8:00 AM",
    operatory: 2,
    status: "completed",
    visitTags: ["limited exam"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p62",
    name: "Nadia Okafor",
    dob: "06/14/2008",
    procedure: "Aligner Check",
    appointmentTime: "8:30 AM",
    operatory: 2,
    status: "upcoming",
    visitTags: ["aligner tray 7 of 20"],
    aiFindings: ["Crowding, lower anterior"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p42",
    name: "Marcus Bell",
    dob: "08/08/1985",
    procedure: "Root Canal",
    appointmentTime: "9:00 AM",
    operatory: 2,
    status: "completed",
    visitTags: ["#4 root canal"],
    aiFindings: ["Periapical radiolucency", "Pulpitis suspected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p36",
    name: "Henry Foster",
    dob: "11/02/1963",
    procedure: "Implant Placement",
    appointmentTime: "10:00 AM",
    operatory: 2,
    status: "in-chair",
    visitTags: ["#14 implant placement"],
    aiFindings: ["Bone density adequate", "Sinus proximity noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p63",
    name: "Theo Lindqvist",
    dob: "09/02/2006",
    procedure: "Attachment Placement",
    appointmentTime: "11:00 AM",
    operatory: 2,
    status: "upcoming",
    visitTags: ["attachments, upper anterior"],
    aiFindings: ["Rotation, upper right lateral"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p44",
    name: "Oscar Reed",
    dob: "01/05/2004",
    procedure: "Post-Op Check",
    appointmentTime: "11:30 AM",
    operatory: 2,
    status: "upcoming",
    visitTags: ["post-op check"],
    aiFindings: ["Healing within normal limits"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p45",
    name: "Vanessa Cole",
    dob: "10/21/1990",
    procedure: "Teeth Whitening",
    appointmentTime: "12:00 PM",
    operatory: 2,
    status: "upcoming",
    visitTags: ["in-office whitening"],
    aiFindings: ["Enamel erosion detected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p7",
    name: "Lisa Park",
    dob: "12/03/1995",
    procedure: "Teeth Whitening",
    appointmentTime: "2:00 PM",
    operatory: 2,
    status: "upcoming",
    visitTags: ["in-office whitening"],
    aiFindings: ["Enamel erosion detected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p65",
    name: "Marcus Adeyemi",
    dob: "04/19/2011",
    procedure: "Ortho Consultation",
    appointmentTime: "3:00 PM",
    operatory: 2,
    status: "upcoming",
    visitTags: ["ortho consult"],
    aiFindings: ["Crossbite, posterior right", "Crowding, lower anterior"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p40",
    name: "Leo Barnes",
    dob: "06/12/1954",
    allergies: ["Aspirin"],
    procedure: "Denture Reline",
    appointmentTime: "4:00 PM",
    operatory: 2,
    status: "upcoming",
    visitTags: ["upper denture reline"],
    aiFindings: ["Ridge resorption noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  // ─── Operatory 3 — dentist chair · providers float by procedure ───
  //  8:00 AM   60m  Extraction  ·  David Martinez
  //  9:00 AM   60m  Root Canal  ·  James Wilson
  // 10:00 AM   60m  Extraction  ·  Grace Palmer
  // 11:00 AM   60m  Root Canal  ·  Catherine Young
  // 12:00 PM   30m  Retainer Delivery  ·  Priya Raghunathan
  //  2:00 PM   60m  Dental Bridge Prep  ·  Stephanie Brooks
  //  3:00 PM   60m  Extraction  ·  Andrew Torres
  //  4:00 PM   30m  Post-Op Check  ·  Nicole White
  //  4:30 PM   30m  X-Rays & Consult  ·  Megan Bell
  {
    id: "p8",
    name: "David Martinez",
    dob: "09/12/1982",
    procedure: "Extraction",
    appointmentTime: "8:00 AM",
    operatory: 3,
    status: "in-chair",
    visitTags: ["#30 extraction", "implant prep"],
    aiFindings: ["Chipped tooth"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Bone graft, site preservation D7953"],
  },
  {
    id: "p2",
    name: "James Wilson",
    dob: "11/22/1972",
    procedure: "Root Canal",
    appointmentTime: "9:00 AM",
    operatory: 3,
    status: "upcoming",
    visitTags: ["#19 root canal"],
    aiFindings: ["Bone loss detected", "Periapical radiolucency", "Restorative work needed", "Calculus buildup"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Buildup/Post and Core D2950", "Periapical radiograph D0220"],
  },
  {
    id: "p43",
    name: "Grace Palmer",
    dob: "04/19/1979",
    allergies: ["Latex"],
    procedure: "Extraction",
    appointmentTime: "10:00 AM",
    operatory: 3,
    status: "in-chair",
    visitTags: ["#17 extraction"],
    aiFindings: ["Impacted third molar", "Non-restorable #17"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Bone graft, site preservation D7953"],
  },
  {
    id: "p23",
    name: "Catherine Young",
    dob: "08/04/1991",
    procedure: "Root Canal",
    appointmentTime: "11:00 AM",
    operatory: 3,
    status: "upcoming",
    visitTags: ["#30 root canal"],
    aiFindings: ["Periapical radiolucency", "Pulpitis suspected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Buildup/Post and Core D2950"],
  },
  {
    id: "p64",
    name: "Priya Raghunathan",
    dob: "01/27/1999",
    procedure: "Retainer Delivery",
    appointmentTime: "12:00 PM",
    operatory: 3,
    status: "upcoming",
    visitTags: ["fixed retainer delivery"],
    aiFindings: ["Alignment stable since debond"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p31",
    name: "Stephanie Brooks",
    dob: "06/09/1993",
    procedure: "Dental Bridge Prep",
    appointmentTime: "2:00 PM",
    operatory: 3,
    status: "upcoming",
    visitTags: ["#19–21 bridge prep"],
    aiFindings: ["Restorative work needed"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p32",
    name: "Andrew Torres",
    dob: "08/15/1981",
    allergies: ["Penicillin"],
    procedure: "Extraction",
    appointmentTime: "3:00 PM",
    operatory: 3,
    status: "upcoming",
    visitTags: ["#18 extraction", "bone graft"],
    aiFindings: ["Non-restorable #18", "Chipped tooth"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Bone graft, site preservation D7953"],
  },
  {
    id: "p21",
    name: "Nicole White",
    dob: "02/07/2000",
    procedure: "Post-Op Check",
    appointmentTime: "4:00 PM",
    operatory: 3,
    status: "upcoming",
    visitTags: ["post-op check"],
    aiFindings: ["Healing within normal limits"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p27",
    name: "Megan Bell",
    dob: "09/08/2005",
    procedure: "X-Rays & Consult",
    appointmentTime: "4:30 PM",
    operatory: 3,
    status: "upcoming",
    visitTags: ["FMX", "new patient consult"],
    aiFindings: ["Impacted third molars", "Caries detected #14"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  // ─── Operatory 4 — hygiene · Lina Castillo RDH all day ───────────
  //  8:00 AM   60m  Scaling & Root Planing  ·  Elena Vargas
  //  9:00 AM   60m  Periodontal Maintenance  ·  Ruth Coleman
  // 10:00 AM   60m  Sealants  ·  Amanda Wright
  // 11:00 AM   60m  Periodontal Maintenance  ·  Christina Mendoza
  //  1:00 PM   60m  Prophylaxis  ·  Naomi Webb
  //  2:00 PM   30m  Sealants  ·  Maya Flynn
  //  2:30 PM   60m  Sealants  ·  Sophia Ward
  //  3:30 PM   60m  Periodontal Assessment  ·  Alicia Grant
  {
    id: "p48",
    name: "Elena Vargas",
    dob: "05/07/1982",
    procedure: "Scaling & Root Planing",
    appointmentTime: "8:00 AM",
    operatory: 4,
    status: "completed",
    visitTags: ["SRP LR/LL", "perio"],
    aiFindings: ["Calculus buildup", "Candidate for perio treatment"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p41",
    name: "Ruth Coleman",
    dob: "12/30/1949",
    procedure: "Periodontal Maintenance",
    appointmentTime: "9:00 AM",
    operatory: 4,
    status: "completed",
    visitTags: ["perio maintenance"],
    aiFindings: ["Gingival recession noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Four bitewings D0274"],
  },
  {
    id: "p9",
    name: "Amanda Wright",
    dob: "04/28/1975",
    allergies: ["Sulfa drugs"],
    procedure: "Sealants",
    appointmentTime: "10:00 AM",
    operatory: 4,
    status: "upcoming",
    visitTags: ["sealants, lower molars"],
    aiFindings: ["Incipient occlusal decay"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p13",
    name: "Christina Mendoza",
    dob: "09/02/1963",
    procedure: "Periodontal Maintenance",
    appointmentTime: "11:00 AM",
    operatory: 4,
    status: "upcoming",
    readyForChair: true,
    visitTags: ["perio maintenance"],
    aiFindings: ["Calculus buildup", "Gingival recession noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Four bitewings D0274"],
  },
  {
    id: "p59",
    name: "Naomi Webb",
    dob: "05/04/1997",
    procedure: "Prophylaxis",
    appointmentTime: "1:00 PM",
    operatory: 4,
    status: "upcoming",
    visitTags: ["prophy"],
    aiFindings: ["Mild gingivitis noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Fluoride varnish D1206"],
  },
  {
    id: "p52",
    name: "Maya Flynn",
    dob: "08/23/2007",
    procedure: "Sealants",
    appointmentTime: "2:00 PM",
    operatory: 4,
    status: "upcoming",
    visitTags: ["sealants #18,19,30,31"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
    additionalProcedures: ["Fluoride varnish D1206"],
  },
  {
    id: "p39",
    name: "Sophia Ward",
    dob: "02/28/2002",
    procedure: "Sealants",
    appointmentTime: "2:30 PM",
    operatory: 4,
    status: "upcoming",
    visitTags: ["sealants #3,14,19,30"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p47",
    name: "Alicia Grant",
    dob: "09/26/1994",
    procedure: "Periodontal Assessment",
    appointmentTime: "3:30 PM",
    operatory: 4,
    status: "upcoming",
    visitTags: ["perio eval", "FMX"],
    aiFindings: ["Pocket depths 5mm+", "Bleeding on probing"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  // ─── Operatory 5 — hygiene · Beth Park RDH all day ───────────────
  //  8:00 AM   60m  Prophylaxis & Exam  ·  Frank Robinson
  //  9:00 AM   60m  Scaling & Root Planing  ·  Christopher Lee
  // 10:00 AM   60m  Scaling & Root Planing  ·  Bianca Lowe
  // 11:00 AM   60m  Scaling & Root Planing  ·  William Carter
  //  1:00 PM   60m  Prophylaxis  ·  Susan Taylor
  //  2:00 PM   30m  Sealants  ·  Kevin Nguyen
  //  2:30 PM   60m  Deep Cleaning  ·  Diane Patel
  //  3:30 PM   60m  Prophylaxis  ·  Raymond Scott
  {
    id: "p22",
    name: "Frank Robinson",
    dob: "05/16/1958",
    procedure: "Prophylaxis & Exam",
    appointmentTime: "8:00 AM",
    operatory: 5,
    status: "completed",
    visitTags: ["prophy", "periodic exam"],
    aiFindings: ["Calculus buildup"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Fluoride varnish D1206", "Four bitewings D0274"],
  },
  {
    id: "p12",
    name: "Christopher Lee",
    dob: "10/05/1988",
    allergies: ["Ibuprofen"],
    procedure: "Scaling & Root Planing",
    appointmentTime: "9:00 AM",
    operatory: 5,
    status: "in-chair",
    visitTags: ["SRP upper right", "localized bleeding"],
    aiFindings: ["Bone loss detected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p57",
    name: "Bianca Lowe",
    dob: "07/27/1969",
    procedure: "Scaling & Root Planing",
    appointmentTime: "10:00 AM",
    operatory: 5,
    status: "in-chair",
    visitTags: ["SRP 4Q", "perio"],
    aiFindings: ["Bone loss detected", "Pocket depths 6mm+"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p30",
    name: "William Carter",
    dob: "12/01/1956",
    allergies: ["Erythromycin"],
    procedure: "Scaling & Root Planing",
    appointmentTime: "11:00 AM",
    operatory: 5,
    status: "upcoming",
    visitTags: ["SRP LR/LL", "perio"],
    aiFindings: ["Candidate for perio treatment", "Calculus buildup"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p19",
    name: "Susan Taylor",
    dob: "10/09/1983",
    procedure: "Prophylaxis",
    appointmentTime: "1:00 PM",
    operatory: 5,
    status: "upcoming",
    visitTags: ["adult prophylaxis"],
    aiFindings: ["Calculus buildup"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Fluoride varnish D1206"],
  },
  {
    id: "p10",
    name: "Kevin Nguyen",
    dob: "07/19/2001",
    procedure: "Sealants",
    appointmentTime: "2:00 PM",
    operatory: 5,
    status: "upcoming",
    visitTags: ["sealants #3,14,19,30"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
    additionalProcedures: ["Fluoride varnish D1206"],
  },
  {
    id: "p15",
    name: "Diane Patel",
    dob: "12/19/1987",
    procedure: "Deep Cleaning",
    appointmentTime: "2:30 PM",
    operatory: 5,
    status: "upcoming",
    visitTags: ["SRP UR/UL"],
    aiFindings: ["Candidate for perio treatment"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p16",
    name: "Raymond Scott",
    dob: "04/03/1955",
    procedure: "Prophylaxis",
    appointmentTime: "3:30 PM",
    operatory: 5,
    status: "upcoming",
    visitTags: ["prophy", "perio"],
    aiFindings: ["Calculus buildup", "Gingival inflammation"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Fluoride varnish D1206"],
  },
  // ─── Operatory 6 — hygiene · Noah Greene RDH all day ─────────────
  //  8:00 AM   60m  Prophylaxis & Exam  ·  Grace Kim
  //  9:00 AM   60m  Scaling & Root Planing  ·  Emily Thompson
  // 10:00 AM   60m  Deep Cleaning  ·  Michael Brown
  // 11:00 AM   60m  Prophylaxis & Exam  ·  Joseph Harris
  //  1:00 PM   60m  Scaling & Root Planing  ·  Nathan Price
  //  2:00 PM   60m  Periodontal Maintenance  ·  Rachel Morgan
  //  3:00 PM   60m  Periodontal Assessment  ·  Daniel Cooper
  //  4:00 PM   60m  Prophylaxis  ·  Laura Evans
  {
    id: "p34",
    name: "Grace Kim",
    dob: "03/09/1989",
    procedure: "Prophylaxis & Exam",
    appointmentTime: "8:00 AM",
    operatory: 6,
    status: "completed",
    visitTags: ["prophy", "periodic exam"],
    aiFindings: ["Calculus buildup"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Fluoride varnish D1206", "Four bitewings D0274"],
  },
  {
    id: "p5",
    name: "Emily Thompson",
    dob: "01/17/1990",
    procedure: "Scaling & Root Planing",
    appointmentTime: "9:00 AM",
    operatory: 6,
    status: "in-chair",
    visitTags: ["SRP 4Q", "perio"],
    aiFindings: ["Candidate for perio treatment", "Bone loss detected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Arestin, per tooth D4381"],
  },
  {
    id: "p6",
    name: "Michael Brown",
    dob: "06/25/1978",
    procedure: "Deep Cleaning",
    appointmentTime: "10:00 AM",
    operatory: 6,
    status: "upcoming",
    visitTags: ["full mouth debridement"],
    aiFindings: ["Calculus buildup", "Bone loss detected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p24",
    name: "Joseph Harris",
    dob: "01/30/1969",
    allergies: ["Latex"],
    procedure: "Prophylaxis & Exam",
    appointmentTime: "11:00 AM",
    operatory: 6,
    status: "upcoming",
    visitTags: ["adult prophylaxis", "periodic exam"],
    aiFindings: ["Calculus buildup"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p38",
    name: "Nathan Price",
    dob: "09/17/1976",
    procedure: "Scaling & Root Planing",
    appointmentTime: "1:00 PM",
    operatory: 6,
    status: "upcoming",
    visitTags: ["SRP UR/UL", "perio"],
    aiFindings: ["Candidate for perio treatment", "Bone loss detected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Arestin, per tooth D4381", "Periodic oral evaluation D0120"],
  },
  {
    id: "p25",
    name: "Rachel Morgan",
    dob: "11/12/1986",
    procedure: "Periodontal Maintenance",
    appointmentTime: "2:00 PM",
    operatory: 6,
    status: "upcoming",
    visitTags: ["perio maintenance", "4-6mm pocketing"],
    aiFindings: ["Bone loss detected", "Calculus buildup"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
    additionalProcedures: ["Four bitewings D0274"],
  },
  {
    id: "p26",
    name: "Daniel Cooper",
    dob: "03/25/1974",
    procedure: "Periodontal Assessment",
    appointmentTime: "3:00 PM",
    operatory: 6,
    status: "upcoming",
    visitTags: ["perio eval", "FMX"],
    aiFindings: ["Bone loss detected", "Pocket depths 5mm+"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p33",
    name: "Laura Evans",
    dob: "10/27/1997",
    procedure: "Prophylaxis",
    appointmentTime: "4:00 PM",
    operatory: 6,
    status: "upcoming",
    visitTags: ["prophy"],
    aiFindings: ["Mild gingivitis noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  // ─── Overflow chairs — outside ALL_OPERATORIES, so off the board ───
  {
    id: "p49",
    name: "Tyler Brooks",
    dob: "03/16/1996",
    procedure: "Composite Filling",
    appointmentTime: "9:00 AM",
    operatory: 7,
    status: "completed",
    visitTags: ["#8 & 9 composite"],
    aiFindings: ["Caries detected #8"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p50",
    name: "Priya Nair",
    dob: "11/29/1973",
    allergies: ["Sulfa drugs"],
    procedure: "Bridge Prep",
    appointmentTime: "10:15 AM",
    operatory: 7,
    status: "in-chair",
    visitTags: ["#19–21 bridge prep"],
    aiFindings: ["Restorative work needed", "Abutment evaluation"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p51",
    name: "George Hunt",
    dob: "02/11/1951",
    procedure: "Denture Adjustment",
    appointmentTime: "11:30 AM",
    operatory: 7,
    status: "upcoming",
    visitTags: ["lower denture adjustment"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p53",
    name: "Caleb Ford",
    dob: "06/30/1988",
    procedure: "Implant Consultation",
    appointmentTime: "2:00 PM",
    operatory: 7,
    status: "upcoming",
    visitTags: ["implant consult"],
    aiFindings: ["Bone loss detected", "Ridge deficiency noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p54",
    name: "Hannah Boyd",
    dob: "12/15/1992",
    procedure: "Crown Prep",
    appointmentTime: "3:00 PM",
    operatory: 7,
    status: "upcoming",
    visitTags: ["#14 crown prep"],
    aiFindings: ["Fracture line #14", "Restorative work needed"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p55",
    name: "Rosa Mendez",
    dob: "04/02/1959",
    procedure: "Periodic Exam",
    appointmentTime: "8:00 AM",
    operatory: 8,
    status: "completed",
    visitTags: ["limited exam"],
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p56",
    name: "Simon Clarke",
    dob: "10/13/1984",
    allergies: ["Ibuprofen"],
    procedure: "Veneer Prep",
    appointmentTime: "8:30 AM",
    operatory: 8,
    status: "completed",
    visitTags: ["#7–10 veneer prep"],
    aiFindings: ["Enamel erosion detected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p58",
    name: "Trevor Dunn",
    dob: "01/19/2000",
    procedure: "Composite Filling",
    appointmentTime: "11:00 AM",
    operatory: 8,
    status: "upcoming",
    readyForChair: true,
    visitTags: ["#29 composite"],
    aiFindings: ["Caries detected #29"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p60",
    name: "Felix Hardy",
    dob: "09/11/1966",
    allergies: ["Erythromycin"],
    procedure: "Night Guard Impression",
    appointmentTime: "1:30 PM",
    operatory: 8,
    status: "upcoming",
    visitTags: ["night guard impression"],
    aiFindings: ["Bruxism wear patterns"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p61",
    name: "Julia Reyes",
    dob: "03/08/1991",
    procedure: "Root Canal",
    appointmentTime: "3:00 PM",
    operatory: 8,
    status: "upcoming",
    visitTags: ["#30 root canal"],
    aiFindings: ["Periapical radiolucency"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
];
