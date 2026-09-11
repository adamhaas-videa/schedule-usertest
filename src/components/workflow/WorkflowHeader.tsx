import { useNavigate } from "react-router-dom";
import videaBrandmark from "@/assets/icons/videa-brandmark.svg";
import PrivacyToggle from "@/components/PrivacyToggle";
import { Button } from "@/components/ui/button";
import VisitPicker from "./VisitPicker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { XL_UP, useMediaQuery } from "@/lib/useMediaQuery";
import { computeAge } from "@/data/mockPatients";
import type { Patient } from "@/data/mockPatients";
import { CLINICAL_TAB_NAV, type ClinicalTab } from "@/types/clinical";
import { cn } from "@/lib/utils";

interface WorkflowHeaderProps {
  patient: Patient;
  activeTab: ClinicalTab;
  /** Privacy mode. When on, the patient name and demographics are blurred. */
  privacyMode?: boolean;
  onPrivacyToggle?: (on: boolean) => void;
  /** When false, the L2 study bar is omitted so a sibling right rail can
   *  extend up to L1. Imaging surfaces render `WorkflowStudyBar` themselves. */
  showStudyBar?: boolean;
}

const TABS = CLINICAL_TAB_NAV;

const STUDY_LABEL: Record<ClinicalTab, string> = {
  xray: "Images from",
  voice: "Clinical notes from",
  perio: "Chart from",
  chart: "Summary from",
};

export function WorkflowStudyBar({
  patient,
  activeTab,
  rightPanelOpen,
  onToggleRightPanel,
}: {
  patient: Patient;
  activeTab: ClinicalTab;
  /** Whether the sibling right rail is expanded. Only read when a toggle
   *  handler is supplied. */
  rightPanelOpen?: boolean;
  /** Supplied by surfaces that own a collapsible right rail (the imaging
   *  viewers). When omitted the collapse control isn't rendered. */
  onToggleRightPanel?: () => void;
}) {
  const dark = activeTab === "xray";

  return (
    <div
      className={cn(
        "h-11 shrink-0 flex items-center px-4",
        dark
          ? "bg-zinc-800/50 backdrop-blur-[14px] border-t border-white/10 shadow-[0px_2px_14px_0px_rgba(0,0,0,0.34)]"
          : "bg-card border-b border-border"
      )}
    >
      <VisitPicker
        patient={patient}
        activeTab={activeTab}
        label={STUDY_LABEL[activeTab]}
        dark={dark}
      />

      {/* Right-rail collapse. While the rail is open, `-mr-4` cancels the
          bar's padding so the 20px disc sits flush against the rail's edge, as
          in the design; collapsed, it keeps the padding rather than kissing the
          window edge. The `before` box widens the hit target without moving
          the disc. */}
      {onToggleRightPanel && (
        <button
          type="button"
          onClick={onToggleRightPanel}
          aria-expanded={rightPanelOpen}
          aria-label={rightPanelOpen ? "Collapse AI panel" : "Expand AI panel"}
          title={rightPanelOpen ? "Collapse AI panel" : "Expand AI panel"}
          className={cn(
            "relative ml-auto flex size-5 shrink-0 items-center justify-center rounded-full",
            rightPanelOpen && "-mr-4",
            "before:absolute before:-inset-1.5 before:content-['']",
            // The margin animates alongside the rail so the disc travels with
            // the edge it belongs to instead of jumping ahead of it.
            "transition-[margin-right,background-color,color] duration-300 ease-out",
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dark
              ? "bg-zinc-950 text-zinc-50 hover:bg-zinc-800"
              : "bg-foreground text-background hover:opacity-80"
          )}
        >
          <i
            className={
              rightPanelOpen
                ? "fa-regular fa-arrow-right-to-line text-[10px]"
                : "fa-regular fa-arrow-left-to-line text-[10px]"
            }
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

export default function WorkflowHeader({
  patient,
  activeTab,
  privacyMode = false,
  onPrivacyToggle,
  showStudyBar = true,
}: WorkflowHeaderProps) {
  const navigate = useNavigate();
  const age = computeAge(patient.dob);
  const demographics = `Age ${age} • DOB ${patient.dob}`;
  // Below xl the header can't fit the demographics beside the name (the tab
  // strip and Start Recording alone take ~610px), so they move into a tooltip
  // on the name. At xl and up they stay inline and the tooltip is not mounted.
  const wide = useMediaQuery(XL_UP);
  const blurClass = privacyMode ? "blur-sm select-none" : "";
  const nameClass = cn(
    "min-w-0 truncate text-lg font-medium text-secondary-foreground whitespace-nowrap transition-[filter]",
    blurClass
  );

  return (
    <div className="shrink-0 flex flex-col">
      <header className="h-[51px] shrink-0 bg-[#fafaf9] border-b border-border flex items-center justify-between pr-4">
        <div className="flex flex-1 items-center gap-3 xl:gap-4 min-w-0">
          <div className="w-[72px] shrink-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => navigate("/schedule")}
              aria-label="Videa — back to home"
              title="Home"
              className="flex h-full items-center justify-center rounded-md py-2.5 cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={videaBrandmark}
                alt="Videa"
                className="h-8 w-auto shrink-0"
              />
            </button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/schedule")}
            aria-label="Back to Schedule"
            title="Back"
            className="cursor-pointer"
          >
            <i className="fa-regular fa-angle-left text-base" aria-hidden />
          </Button>

          <div className="flex items-center gap-3 xl:gap-4 min-w-0">
            {wide ? (
              <span className={nameClass}>{patient.name}</span>
            ) : (
              <TooltipProvider delay={150}>
                <Tooltip>
                  <TooltipTrigger
                    render={<span tabIndex={0} className={nameClass} />}
                  >
                    {patient.name}
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start">
                    <span className={blurClass}>{demographics}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span
              className={cn(
                "hidden xl:inline text-sm text-muted-foreground whitespace-nowrap leading-none transition-[filter]",
                blurClass
              )}
            >
              {demographics}
            </span>
          </div>

          <PrivacyToggle
            enabled={privacyMode}
            onToggle={(on) => onPrivacyToggle?.(on)}
          />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div
            role="tablist"
            aria-label="Patient workflow"
            className="flex h-8 items-center overflow-hidden rounded-xl bg-muted p-1"
          >
            {TABS.map((t) => {
              const active = t.id === activeTab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => navigate(`/patient/${patient.id}/${t.path}`)}
                  className={cn(
                    // Below xl the strip tightens (14px, 8px padding) so a long
                    // patient name keeps its room; xl and up is the Figma spec.
                    "h-7 px-2 text-sm xl:px-2.5 xl:text-[15px] rounded-[9px] font-medium whitespace-nowrap transition-colors cursor-pointer",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <Button variant="secondary" className="cursor-pointer">
            <i className="fa-regular fa-microphone text-base" aria-hidden />
            Start Recording
          </Button>
        </div>
      </header>

      {showStudyBar && (
        <WorkflowStudyBar patient={patient} activeTab={activeTab} />
      )}
    </div>
  );
}
