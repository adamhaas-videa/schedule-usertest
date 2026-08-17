export type ScheduleView = "list" | "calendar";
export type ClinicalTab = "xray" | "voice" | "perio" | "chart";

export interface ScheduleFilters {
  providers: string[];
  operatories: number[];
}

export const CLINICAL_TAB_PATH: Record<ClinicalTab, string> = {
  xray: "xray",
  voice: "voice-notes",
  perio: "perio",
  chart: "chart",
};
