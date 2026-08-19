import CardVersionMenu from "@/components/CardVersionMenu";
import ChartVersionMenu from "@/components/ChartVersionMenu";
import SummaryVersionMenu from "@/components/SummaryVersionMenu";
import type { CardVersion } from "@/lib/cardVersions";
import type { SummaryVersion } from "@/lib/summaryVersions";
import { useAiView } from "@/context/AiViewContext";

interface L1HeaderProps {
  cardVersion: CardVersion;
  onCardVersionChange: (version: CardVersion) => void;
  summaryVersion: SummaryVersion;
  onSummaryVersionChange: (version: SummaryVersion) => void;
}

export default function L1Header({
  cardVersion,
  onCardVersionChange,
  summaryVersion,
  onSummaryVersionChange,
}: L1HeaderProps) {
  const { chartVersion, setChartVersion } = useAiView();

  return (
    <header className="h-14 shrink-0 bg-card border-b border-border flex items-center gap-4 px-4 overflow-hidden">
      <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
        Schedule
      </h1>

      <div className="flex-1 min-w-0" />

      <CardVersionMenu value={cardVersion} onChange={onCardVersionChange} />
      <ChartVersionMenu value={chartVersion} onChange={setChartVersion} />
      <SummaryVersionMenu
        value={summaryVersion}
        onChange={onSummaryVersionChange}
      />

      <button
        type="button"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary-hover transition-colors"
      >
        <i className="fa-regular fa-microphone text-base" aria-hidden />
        Start Recording
      </button>

      <button
        type="button"
        className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Notifications"
        title="Notifications"
      >
        <i className="fa-regular fa-bell text-base" aria-hidden />
      </button>
    </header>
  );
}
