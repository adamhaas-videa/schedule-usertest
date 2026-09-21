import { useCallback, useState, type ReactNode } from "react";
import { AiViewContext, type AiView } from "./AiViewContext";
import { type CardColorMode, type CardVersion } from "@/lib/cardVersions";
import { DEFAULT_CHART_VERSION, type ChartVersion } from "@/lib/chartVersions";
import { type NavFooterMode, type NavVersion } from "@/lib/navVersions";
import { type SummaryVersion } from "@/lib/summaryVersions";
import { readDemoSelectionFromLocation } from "@/lib/demoUrl";

// User-test build: the six demo dimensions are seeded from the `/x/<tokens>`
// or `/t/<preset>` head of the URL that opened the app, so a participant's
// first paint is already the condition they were sent to. Read once at module
// load — DemoScope owns every change after that.
const INITIAL_DEMO = readDemoSelectionFromLocation();

/**
 * Holds AI view mode, privacy, and demo versions for the whole app.
 * Mounted above <Routes> so selections persist across navigation.
 */
export function AiViewProvider({ children }: { children: ReactNode }) {
  const [aiOn, setAiOn] = useState(true);
  const [view, setView] = useState<AiView>("patient");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [imagingPanelOpen, setImagingPanelOpen] = useState(true);
  const [chartVersion, setChartVersion] = useState<ChartVersion>(
    DEFAULT_CHART_VERSION
  );
  const [navVersion, setNavVersion] = useState<NavVersion>(
    INITIAL_DEMO.navVersion
  );
  const [navFooterMode, setNavFooterMode] = useState<NavFooterMode>(
    INITIAL_DEMO.navFooterMode
  );
  const [cardVersion, setCardVersion] = useState<CardVersion>(
    INITIAL_DEMO.cardVersion
  );
  const [cardColorMode, setCardColorMode] = useState<CardColorMode>(
    INITIAL_DEMO.cardColorMode
  );
  const [summaryVersion, setSummaryVersion] = useState<SummaryVersion>(
    INITIAL_DEMO.summaryVersion
  );
  const [cardSummaryOn, setCardSummaryOn] = useState(
    INITIAL_DEMO.cardSummaryOn
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
        imagingPanelOpen,
        setImagingPanelOpen,
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
        cardSummaryOn,
        setCardSummaryOn,
        reviewedIds,
        markReviewed,
      }}
    >
      {children}
    </AiViewContext.Provider>
  );
}
