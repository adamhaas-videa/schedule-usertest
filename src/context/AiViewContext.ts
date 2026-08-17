import { createContext, useContext } from "react";
import type { ChartVersion } from "@/lib/chartVersions";

export type AiView = "patient" | "clinical";

export interface AiViewState {
  /** Whether AI overlays are enabled. */
  aiOn: boolean;
  setAiOn: (on: boolean) => void;
  /** Which AI view is selected when AI is on: patient-facing or clinical. */
  view: AiView;
  setView: (view: AiView) => void;
  /**
   * Privacy mode. When on, patient-identifying info (e.g. the name in the
   * workflow header) is blurred. Independent of the AI overlays above.
   */
  privacyMode: boolean;
  setPrivacyMode: (on: boolean) => void;
  /**
   * Which patient-chart demo version is selected. Shared so the schedule
   * header dropdown and the /patient/:id/chart tab stay in sync.
   */
  chartVersion: ChartVersion;
  setChartVersion: (version: ChartVersion) => void;
  /**
   * Patient ids whose V1 "Review" CTA has been used this session. Lives above
   * the router so the card flips to "Reviewed" when the user comes back.
   */
  reviewedIds: ReadonlySet<string>;
  markReviewed: (patientId: string) => void;
}

export const AiViewContext = createContext<AiViewState | null>(null);

export function useAiView() {
  const ctx = useContext(AiViewContext);
  if (!ctx) {
    throw new Error("useAiView must be used within an AiViewProvider");
  }
  return ctx;
}
