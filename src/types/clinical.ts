export type ScheduleView = "list" | "calendar";
export type ClinicalTab = "xray" | "voice" | "perio" | "chart";

import type { AppointmentKind } from "@/lib/appointmentColors";

export interface ScheduleFilters {
  providers: string[];
  operatories: number[];
  /** Procedure kinds to keep. Empty means every kind, like the other two. */
  treatments: AppointmentKind[];
}

export const CLINICAL_TAB_PATH: Record<ClinicalTab, string> = {
  xray: "xray",
  voice: "voice-notes",
  perio: "perio",
  chart: "chart",
};

/** Patient workflow header tabs. Order is the nav order. Paths stay stable. */
export const CLINICAL_TAB_NAV: {
  id: ClinicalTab;
  label: string;
  path: string;
}[] = [
  { id: "xray", label: "Images", path: CLINICAL_TAB_PATH.xray },
  { id: "voice", label: "Clinical Notes", path: CLINICAL_TAB_PATH.voice },
  { id: "perio", label: "Perio Chart", path: CLINICAL_TAB_PATH.perio },
  { id: "chart", label: "Patient Summary", path: CLINICAL_TAB_PATH.chart },
];
