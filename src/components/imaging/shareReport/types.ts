export type ToothNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32;

export type ToothState =
  | "normal"
  | "selected"
  | "saved"
  | "unsaved";

export type Treatment =
  | "crown"
  | "implant"
  | "filling"
  | "srp"
  | "rootCanal"
  | "periodontalMaintenance"
  | "toothRemineralization"
  | "extraction";

export type QuadTreatment = "aligners" | "dentures" | "implants" | "srp";

export type QuadrantId = "UR" | "UL" | "LR" | "LL";

export type QuadrantState = ToothState;

export type ChartMode = "adult" | "pediatric";

export type PreviewTab = "qr" | "print";

export type Arch = "maxillary" | "mandibular";

export interface ToothData {
  number: ToothNumber;
  state: ToothState;
  treatments: Treatment[];
  imageIds: string[];
}

export interface Quadrant {
  id: QuadrantId;
  arch: Arch;
  teeth: ToothNumber[];
}

export interface QuadrantData {
  id: QuadrantId;
  state: QuadrantState;
  treatments: QuadTreatment[];
}

export interface TreatmentOption {
  value: Treatment;
  label: string;
}

export interface QuadTreatmentOption {
  value: QuadTreatment;
  label: string;
}
