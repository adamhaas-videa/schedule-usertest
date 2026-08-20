import { useCallback, useState, type ReactNode } from "react";
import { AiViewContext, type AiView } from "./AiViewContext";
import {
  DEFAULT_CARD_COLOR_MODE,
  DEFAULT_CARD_VERSION,
  type CardColorMode,
  type CardVersion,
} from "@/lib/cardVersions";
import { DEFAULT_CHART_VERSION, type ChartVersion } from "@/lib/chartVersions";
import {
  DEFAULT_NAV_FOOTER_MODE,
  DEFAULT_NAV_VERSION,
  type NavFooterMode,
  type NavVersion,
} from "@/lib/navVersions";
import {
  DEFAULT_SUMMARY_VERSION,
  type SummaryVersion,
} from "@/lib/summaryVersions";

/**
 * Holds AI view mode, privacy, and demo versions for the whole app.
 * Mounted above <Routes> so selections persist across navigation.
 */
export function AiViewProvider({ children }: { children: ReactNode }) {
  const [aiOn, setAiOn] = useState(true);
  const [view, setView] = useState<AiView>("patient");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [chartVersion, setChartVersion] = useState<ChartVersion>(
    DEFAULT_CHART_VERSION
  );
  const [navVersion, setNavVersion] = useState<NavVersion>(DEFAULT_NAV_VERSION);
  const [navFooterMode, setNavFooterMode] = useState<NavFooterMode>(
    DEFAULT_NAV_FOOTER_MODE
  );
  const [cardVersion, setCardVersion] = useState<CardVersion>(
    DEFAULT_CARD_VERSION
  );
  const [cardColorMode, setCardColorMode] = useState<CardColorMode>(
    DEFAULT_CARD_COLOR_MODE
  );
  const [summaryVersion, setSummaryVersion] = useState<SummaryVersion>(
    DEFAULT_SUMMARY_VERSION
  );
  const [reviewedIds, setReviewedIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const markReviewed = useCallback((patientId: string) => {
    setReviewedIds((prev) => {
      if (prev.has(patientId)) return prev;
      const next = new Set(prev);
      next.add(patientId);
      return next;
    });
  }, []);

  return (
    <AiViewContext.Provider
      value={{
        aiOn,
        setAiOn,
        view,
        setView,
        privacyMode,
        setPrivacyMode,
        chartVersion,
        setChartVersion,
        navVersion,
        setNavVersion,
        navFooterMode,
        setNavFooterMode,
        cardVersion,
        setCardVersion,
        cardColorMode,
        setCardColorMode,
        summaryVersion,
        setSummaryVersion,
        reviewedIds,
        markReviewed,
      }}
    >
      {children}
    </AiViewContext.Provider>
  );
}
