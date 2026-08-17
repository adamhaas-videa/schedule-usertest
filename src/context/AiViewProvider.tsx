import { useCallback, useState, type ReactNode } from "react";
import { AiViewContext, type AiView } from "./AiViewContext";
import { DEFAULT_CHART_VERSION, type ChartVersion } from "@/lib/chartVersions";

/**
 * Holds AI view mode, privacy, and chart-demo version for the whole app.
 * Mounted above <Routes> so selections persist across navigation.
 */
export function AiViewProvider({ children }: { children: ReactNode }) {
  const [aiOn, setAiOn] = useState(true);
  const [view, setView] = useState<AiView>("patient");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [chartVersion, setChartVersion] = useState<ChartVersion>(
    DEFAULT_CHART_VERSION
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
        reviewedIds,
        markReviewed,
      }}
    >
      {children}
    </AiViewContext.Provider>
  );
}
