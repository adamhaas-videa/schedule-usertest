import { createContext, useContext } from "react";
import type { CardColorMode, CardVersion } from "@/lib/cardVersions";
import type { ChartVersion } from "@/lib/chartVersions";
import type { NavFooterMode, NavVersion } from "@/lib/navVersions";
import type { SummaryVersion } from "@/lib/summaryVersions";

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
   * Demo-only switchers. Nav version changes the product-suite sidebar;
   * footer mode only changes Help / Learning / Settings vs the practice menu.
   * Card and summary versions stay on the schedule surface.
   */
  navVersion: NavVersion;
  setNavVersion: (version: NavVersion) => void;
  navFooterMode: NavFooterMode;
  setNavFooterMode: (mode: NavFooterMode) => void;
  cardVersion: CardVersion;
  setCardVersion: (version: CardVersion) => void;
  summaryVersion: SummaryVersion;
  setSummaryVersion: (version: SummaryVersion) => void;
  /**
   * Demo-only: color the Summary actions card chrome from the provider
   * palette or from the appointment/procedure family.
   */
  cardColorMode: CardColorMode;
  setCardColorMode: (mode: CardColorMode) => void;
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
