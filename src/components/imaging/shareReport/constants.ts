import type {
  Quadrant,
  QuadrantData,
  QuadrantId,
  QuadTreatmentOption,
  ToothData,
  ToothNumber,
  TreatmentOption,
} from "./types";

// Odontogram quadrant layout (Universal Numbering, clinician's view).
// The chart is rendered as a 2x2 grid that mirrors the patient's mouth, so the
// patient's right side appears on the viewer's left:
//
//   ┌───────────────────────────────┬───────────────────────────────┐
//   │ UR (upper right) — maxillary  │ UL (upper left) — maxillary   │
//   │ teeth 1  2  3  4  5  6  7  8  │ teeth 9 10 11 12 13 14 15 16  │
//   ├───────────────────────────────┼───────────────────────────────┤
//   │ LR (lower right) — mandibular │ LL (lower left) — mandibular  │
//   │ teeth 32 31 30 29 28 27 26 25 │ teeth 24 23 22 21 20 19 18 17 │
//   └───────────────────────────────┴───────────────────────────────┘
//
// Tooth order within each quadrant runs from the distal (third molar) toward
// the midline, so adjacent quadrants meet at the central incisors (8|9, 25|24).
export const QUADRANTS: Quadrant[] = [
  { id: "UR", arch: "maxillary", teeth: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: "UL", arch: "maxillary", teeth: [9, 10, 11, 12, 13, 14, 15, 16] },
  { id: "LR", arch: "mandibular", teeth: [32, 31, 30, 29, 28, 27, 26, 25] },
  { id: "LL", arch: "mandibular", teeth: [24, 23, 22, 21, 20, 19, 18, 17] },
];

export const TREATMENT_COLUMNS: TreatmentOption[][] = [
  [
    { value: "crown", label: "Crown" },
    { value: "implant", label: "Implant" },
  ],
  [
    { value: "filling", label: "Filling" },
    { value: "srp", label: "SRP" },
  ],
  [
    { value: "rootCanal", label: "Root Canal" },
    { value: "periodontalMaintenance", label: "Periodontal Maintenance" },
  ],
  [
    { value: "toothRemineralization", label: "Tooth Remineralization" },
    { value: "extraction", label: "Extraction" },
  ],
];

export const QUAD_TREATMENT_OPTIONS: QuadTreatmentOption[] = [
  { value: "aligners", label: "Aligners" },
  { value: "dentures", label: "Dentures" },
  { value: "implants", label: "Implants" },
  { value: "srp", label: "SRP" },
];

export const QUADRANT_LABELS: Record<QuadrantId, string> = {
  UR: "Upper Right",
  UL: "Upper Left",
  LR: "Lower Right",
  LL: "Lower Left",
};

export const QUADRANT_SHORT_LABELS: Record<QuadrantId, string> = {
  UR: "UR",
  UL: "UL",
  LR: "LR",
  LL: "LL",
};

export const DEFAULT_CLINICAL_NOTE =
  "Your lower left molar (tooth #18) will require a root canal and crown to restore. You will also need a filling on lower left tooth #19 to fill cavity decay. Please continue daily flossing and brushing to keep improving your oral health.";

export const XRAY_IMAGES = [
  "/assets/xrays/xray-1.png",
  "/assets/xrays/xray-2.png",
  "/assets/xrays/xray-3.png",
  "/assets/xrays/xray-4.png",
];

export const ALL_TOOTH_NUMBERS = Array.from(
  { length: 32 },
  (_, index) => (index + 1) as ToothNumber,
);

export const QUADRANT_IDS: QuadrantId[] = ["UR", "UL", "LR", "LL"];

export function createInitialQuadrants(): Map<QuadrantId, QuadrantData> {
  const map = new Map<QuadrantId, QuadrantData>();

  for (const id of QUADRANT_IDS) {
    map.set(id, { id, state: "normal", treatments: [] });
  }

  return map;
}

export function createInitialTeeth(): Map<ToothNumber, ToothData> {
  const map = new Map<ToothNumber, ToothData>();

  for (const number of ALL_TOOTH_NUMBERS) {
    map.set(number, {
      number,
      state: "normal",
      treatments: [],
      imageIds: [],
    });
  }

  map.set(18, {
    number: 18,
    state: "saved",
    treatments: ["rootCanal", "crown"],
    imageIds: XRAY_IMAGES,
  });
  map.set(19, {
    number: 19,
    state: "saved",
    treatments: ["filling"],
    imageIds: [XRAY_IMAGES[1]],
  });
  map.set(30, {
    number: 30,
    state: "saved",
    treatments: ["crown"],
    imageIds: [XRAY_IMAGES[0]],
  });
  map.set(32, {
    number: 32,
    state: "saved",
    treatments: ["extraction"],
    imageIds: [XRAY_IMAGES[2]],
  });
  map.set(17, {
    number: 17,
    state: "unsaved",
    treatments: ["periodontalMaintenance"],
    imageIds: [],
  });
  map.set(20, {
    number: 20,
    state: "normal",
    treatments: ["crown", "rootCanal"],
    imageIds: XRAY_IMAGES,
  });

  return map;
}
