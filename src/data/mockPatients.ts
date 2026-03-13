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
  appointmentDate: string;
  durationMinutes: number;
}

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
  // ─── Operatory 1 ───────────────────────────────────────────
  // 8:00–9:30  Maria Garcia        | 9:30–10:00 OPEN
  // 10:00–11:30 James Wilson       | 11:30–12:30 Helen Foster
  // 12:30–1:00 OPEN                | 1:00–2:00 Sarah Chen
  // 2:00–3:00  Thomas Rivera       | 3:00–4:00 Diane Patel
  // 4:00–5:00  Raymond Scott
  {
    id: "p1",
    name: "Maria Garcia",
    dob: "05/14/1985",
    allergies: ["Penicillin", "Latex"],
    procedure: "Crown Prep",
    appointmentTime: "8:00 AM",
    operatory: 1,
    status: "in-chair",
    aiFindings: ["Restorative work needed", "Possible fracture line"],
    appointmentDate: "2026-03-12",
    durationMinutes: 90,
  },
  {
    id: "p2",
    name: "James Wilson",
    dob: "11/22/1972",
    procedure: "Root Canal",
    appointmentTime: "10:00 AM",
    operatory: 1,
    status: "upcoming",
    aiFindings: ["Bone loss detected", "Periapical radiolucency", "Restorative work needed", "Calculus buildup"],
    appointmentDate: "2026-03-12",
    durationMinutes: 90,
  },
  {
    id: "p13",
    name: "Helen Foster",
    dob: "09/02/1963",
    procedure: "Periodontal Maintenance",
    appointmentTime: "11:30 AM",
    operatory: 1,
    status: "upcoming",
    aiFindings: ["Calculus buildup", "Gingival recession noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p3",
    name: "Sarah Chen",
    dob: "03/08/1998",
    procedure: "Composite Filling",
    appointmentTime: "1:00 PM",
    operatory: 1,
    status: "upcoming",
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
    aiFindings: ["Bone density adequate", "Ridge augmentation recommended"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p15",
    name: "Diane Patel",
    dob: "12/19/1987",
    procedure: "Deep Cleaning",
    appointmentTime: "3:00 PM",
    operatory: 1,
    status: "upcoming",
    aiFindings: ["Candidate for perio treatment"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p16",
    name: "Raymond Scott",
    dob: "04/03/1955",
    procedure: "Prophylaxis",
    appointmentTime: "4:00 PM",
    operatory: 1,
    status: "upcoming",
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },

  // ─── Operatory 2 ───────────────────────────────────────────
  // 8:00–8:30 OPEN                 | 8:30–9:00 Robert Johnson
  // 9:00–9:30 OPEN                 | 9:30–10:30 Emily Thompson
  // 10:30–11:00 Angela Kim         | 11:00–12:00 Michael Brown
  // 12:00–1:00 Gregory Hall        | 1:00–2:00 Susan Taylor
  // 2:00–3:00  Lisa Park           | 3:00–3:30 OPEN
  // 3:30–4:30  Mark Anderson       | 4:30–5:00 Nicole White
  {
    id: "p4",
    name: "Robert Johnson",
    dob: "08/30/1960",
    allergies: ["Codeine"],
    procedure: "Periodic Exam",
    appointmentTime: "8:30 AM",
    operatory: 2,
    status: "completed",
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p5",
    name: "Emily Thompson",
    dob: "01/17/1990",
    procedure: "Scaling & Root Planing",
    appointmentTime: "9:30 AM",
    operatory: 2,
    status: "in-chair",
    aiFindings: ["Candidate for perio treatment", "Bone loss detected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p17",
    name: "Angela Kim",
    dob: "06/14/2003",
    procedure: "Fluoride Treatment",
    appointmentTime: "10:30 AM",
    operatory: 2,
    status: "upcoming",
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p6",
    name: "Michael Brown",
    dob: "06/25/1978",
    procedure: "Bridge Impression",
    appointmentTime: "11:00 AM",
    operatory: 2,
    status: "upcoming",
    aiFindings: ["Restorative work needed"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p18",
    name: "Gregory Hall",
    dob: "03/22/1965",
    procedure: "Inlay/Onlay Prep",
    appointmentTime: "12:00 PM",
    operatory: 2,
    status: "upcoming",
    aiFindings: ["Restorative work needed", "Caries detected #14"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p19",
    name: "Susan Taylor",
    dob: "10/09/1983",
    procedure: "Crown Delivery",
    appointmentTime: "1:00 PM",
    operatory: 2,
    status: "upcoming",
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
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p20",
    name: "Mark Anderson",
    dob: "11/28/1977",
    procedure: "Night Guard Impression",
    appointmentTime: "3:30 PM",
    operatory: 2,
    status: "upcoming",
    aiFindings: ["Bruxism wear patterns"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p21",
    name: "Nicole White",
    dob: "02/07/2000",
    procedure: "Post-Op Check",
    appointmentTime: "4:30 PM",
    operatory: 2,
    status: "upcoming",
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },

  // ─── Operatory 3 ───────────────────────────────────────────
  // 8:00–9:00  Frank Robinson      | 9:00–9:45 David Martinez
  // 9:45–10:30 OPEN                | 10:30–11:30 Amanda Wright
  // 11:30–12:30 Catherine Young    | 12:30–1:30 Joseph Harris
  // 1:30–2:00  Kevin Nguyen        | 2:00–3:00 Rachel Morgan
  // 3:00–3:30 OPEN                 | 3:30–4:30 Daniel Cooper
  // 4:30–5:00  Megan Bell
  {
    id: "p22",
    name: "Frank Robinson",
    dob: "05/16/1958",
    procedure: "Prophylaxis & Exam",
    appointmentTime: "8:00 AM",
    operatory: 3,
    status: "completed",
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p8",
    name: "David Martinez",
    dob: "09/12/1982",
    procedure: "Extraction",
    appointmentTime: "9:00 AM",
    operatory: 3,
    status: "in-chair",
    aiFindings: ["Possible fracture line"],
    appointmentDate: "2026-03-12",
    durationMinutes: 45,
  },
  {
    id: "p9",
    name: "Amanda Wright",
    dob: "04/28/1975",
    allergies: ["Sulfa drugs"],
    procedure: "Implant Consultation",
    appointmentTime: "10:30 AM",
    operatory: 3,
    status: "upcoming",
    aiFindings: ["Bone loss detected", "Candidate for perio treatment", "Ridge deficiency noted"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p23",
    name: "Catherine Young",
    dob: "08/04/1991",
    procedure: "Root Canal",
    appointmentTime: "11:30 AM",
    operatory: 3,
    status: "upcoming",
    aiFindings: ["Periapical radiolucency", "Pulpitis suspected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p24",
    name: "Joseph Harris",
    dob: "01/30/1969",
    allergies: ["Latex"],
    procedure: "Composite Filling",
    appointmentTime: "12:30 PM",
    operatory: 3,
    status: "upcoming",
    aiFindings: ["Caries detected #19"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p10",
    name: "Kevin Nguyen",
    dob: "07/19/2001",
    procedure: "Sealants",
    appointmentTime: "1:30 PM",
    operatory: 3,
    status: "upcoming",
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p25",
    name: "Rachel Morgan",
    dob: "11/12/1986",
    procedure: "Crown Prep",
    appointmentTime: "2:00 PM",
    operatory: 3,
    status: "upcoming",
    aiFindings: ["Restorative work needed", "Fracture line #30"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p26",
    name: "Daniel Cooper",
    dob: "03/25/1974",
    procedure: "Periodontal Assessment",
    appointmentTime: "3:30 PM",
    operatory: 3,
    status: "upcoming",
    aiFindings: ["Bone loss detected", "Pocket depths 5mm+"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p27",
    name: "Megan Bell",
    dob: "09/08/2005",
    procedure: "X-Rays & Consult",
    appointmentTime: "4:30 PM",
    operatory: 3,
    status: "upcoming",
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },

  // ─── Operatory 4 ───────────────────────────────────────────
  // 8:00–8:30  Patricia Davis      | 8:30–9:00 OPEN
  // 9:00–10:30 Christopher Lee     | 10:30–11:30 Brian Murphy
  // 11:30–12:00 Jennifer Reed      | 12:00–1:00 William Carter
  // 1:00–1:30 OPEN                 | 1:30–2:30 Stephanie Brooks
  // 2:30–3:30  Andrew Torres       | 3:30–4:00 OPEN
  // 4:00–5:00  Laura Evans
  {
    id: "p11",
    name: "Patricia Davis",
    dob: "02/14/1968",
    procedure: "Denture Adjustment",
    appointmentTime: "8:00 AM",
    operatory: 4,
    status: "completed",
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p12",
    name: "Christopher Lee",
    dob: "10/05/1988",
    allergies: ["Ibuprofen"],
    procedure: "Veneer Prep",
    appointmentTime: "9:00 AM",
    operatory: 4,
    status: "in-chair",
    aiFindings: ["Restorative work needed", "Enamel erosion detected"],
    appointmentDate: "2026-03-12",
    durationMinutes: 90,
  },
  {
    id: "p28",
    name: "Brian Murphy",
    dob: "07/21/1992",
    procedure: "Composite Filling",
    appointmentTime: "10:30 AM",
    operatory: 4,
    status: "upcoming",
    aiFindings: ["Caries detected #3"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p29",
    name: "Jennifer Reed",
    dob: "04/18/1980",
    procedure: "Bite Adjustment",
    appointmentTime: "11:30 AM",
    operatory: 4,
    status: "upcoming",
    appointmentDate: "2026-03-12",
    durationMinutes: 30,
  },
  {
    id: "p30",
    name: "William Carter",
    dob: "12/01/1956",
    allergies: ["Erythromycin"],
    procedure: "Scaling & Root Planing",
    appointmentTime: "12:00 PM",
    operatory: 4,
    status: "upcoming",
    aiFindings: ["Candidate for perio treatment", "Calculus buildup"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p31",
    name: "Stephanie Brooks",
    dob: "06/09/1993",
    procedure: "Dental Bridge Prep",
    appointmentTime: "1:30 PM",
    operatory: 4,
    status: "upcoming",
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
    appointmentTime: "2:30 PM",
    operatory: 4,
    status: "upcoming",
    aiFindings: ["Non-restorable #18", "Possible fracture line"],
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
  {
    id: "p33",
    name: "Laura Evans",
    dob: "10/27/1997",
    procedure: "Prophylaxis",
    appointmentTime: "4:00 PM",
    operatory: 4,
    status: "upcoming",
    appointmentDate: "2026-03-12",
    durationMinutes: 60,
  },
];
