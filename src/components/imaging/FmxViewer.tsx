import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";
import { useAiView } from "@/context/AiViewContext";
import { useToggleAiOverlay } from "@/context/ImagingToolbarContext";
import ImagingToolbar, { type ToolbarEntry } from "./ImagingToolbar";
import { FindingTypesMenu, DisplayThresholdMenu } from "./submenus";
import ImagingRightPanel from "./ImagingRightPanel";
import { WorkflowStudyBar } from "@/components/workflow/WorkflowHeader";
import {
  PatientToothIcon,
  ClinicalToothIcon,
  ElementsIcon,
  aiTextColor,
} from "./toolbarIcons";

interface FmxViewerProps {
  patient: Patient;
  aiOn: boolean;
  onAiToggle: (on: boolean) => void;
}

// Clinical assets live in /public/xrays/clinical/ as slot-01.png … slot-18.png,
// each matching its patient-view counterpart's pixel dimensions so the crop
// doesn't shift when swapping views. Missing files fall back to the patient
// image via the <img> onError handler below.
const CLINICAL_SET_AVAILABLE = true;

function patientSrc(slot: number) {
  return `/xrays/slot-${String(slot).padStart(2, "0")}.png`;
}

function slotSrc(slot: number, aiOn: boolean, view: "patient" | "clinical") {
  if (!aiOn) return `/xrays/ai-off/${slot}.png`;
  const name = `slot-${String(slot).padStart(2, "0")}.png`;
  if (view === "clinical" && CLINICAL_SET_AVAILABLE) return `/xrays/clinical/${name}`;
  return `/xrays/${name}`;
}

function FilmTile({
  slot,
  aiOn,
  view,
  tall = false,
  onOpen,
}: {
  slot: number;
  aiOn: boolean;
  view: "patient" | "clinical";
  tall?: boolean;
  onOpen: (slot: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(slot)}
      className={cn(
        "group relative overflow-hidden rounded-sm bg-black hover:ring-2 hover:ring-deep-teal-400 transition-all cursor-pointer",
        tall ? "h-32" : "h-24"
      )}
    >
      <img
        src={slotSrc(slot, aiOn, view)}
        alt={`Radiograph ${slot}`}
        className="size-full object-contain"
        draggable={false}
        onError={(e) => {
          // A not-yet-added clinical slot falls back to the patient image
          // rather than rendering a broken tile.
          const img = e.currentTarget;
          const fallback = patientSrc(slot);
          if (aiOn && view === "clinical" && !img.src.endsWith(fallback)) {
            img.src = fallback;
          }
        }}
      />
    </button>
  );
}

export default function FmxViewer({ patient, aiOn, onAiToggle }: FmxViewerProps) {
  const navigate = useNavigate();
  // Patient view is the default when AI is enabled. The selection is held in
  // shared context so it persists across the whole imaging experience —
  // toggling AI off then on, and navigating FMX ↔ single image ↔ back.
  const { view, setView } = useAiView();
  const toggleAi = useToggleAiOverlay(aiOn, onAiToggle);
  const [series, setSeries] = useState<"fmx" | "bw">("fmx");

  const openImage = (slot: number) =>
    navigate(`/patient/${patient.id}/image/${slot}`);

  // Proportionally fit the fixed-layout FMX chart to the available viewport,
  // preserving its aspect ratio, keeping the container's 20px padding as a hard
  // minimum margin, and always centered. Scaling up past 1x is allowed. offset*
  // sizes are read from the chart because CSS transforms don't affect them, so
  // measurement stays stable regardless of the current scale.
  const fitRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = fitRef.current;
    const chart = chartRef.current;
    if (!container || !chart) return;

    let raf = 0;
    const compute = () => {
      const style = getComputedStyle(container);
      const padX =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const availW = container.clientWidth - padX;
      const availH = container.clientHeight - padY;
      const natW = chart.offsetWidth;
      const natH = chart.offsetHeight;
      if (natW <= 0 || natH <= 0 || availW <= 0 || availH <= 0) {
        // Layout not settled yet — try again next frame.
        raf = requestAnimationFrame(compute);
        return;
      }
      setScale(Math.min(availW / natW, availH / natH));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(container);
    ro.observe(chart);
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, []);

  const toolbarItems: ToolbarEntry[] = [
    {
      key: "compare",
      label: "Compare",
      iconClass: "fa-regular fa-window-restore",
      iconSizePx: 20,
    },
    {
      kind: "ai-cluster",
      toggleEnabled: aiOn,
      ai: {
        key: "ai",
        label: aiOn ? "AI On" : "AI Off",
        renderIcon: (state) => (
          <span
            className="text-[20px] font-semibold leading-none"
            style={{ color: aiTextColor(state) }}
          >
            AI
          </span>
        ),
        active: aiOn,
        onClick: toggleAi,      },
      patient: {
        key: "patient-view",
        label: "Patient",
        renderIcon: (state) => <PatientToothIcon state={state} className="size-5" />,
        active: aiOn && view === "patient",
        onClick: () => setView("patient"),      },
      clinical: {
        key: "clinical-view",
        label: "Clinical",
        renderIcon: (state) => <ClinicalToothIcon state={state} className="size-5" />,
        active: aiOn && view === "clinical",
        onClick: () => setView("clinical"),      },
    },
    {
      key: "elements",
      label: "Elements",
      renderIcon: (state) => <ElementsIcon state={state} />,
      hasSubmenu: true,
      submenu: <FindingTypesMenu />,
    },
    {
      key: "threshold",
      label: "Threshold",
      iconClass: "fa-regular fa-sliders-simple",
      iconSizePx: 16,
      hasSubmenu: true,
      submenu: <DisplayThresholdMenu />,
    },
  ];

  return (
    <div className="dark imaging-surface flex-1 min-h-0 flex bg-background text-foreground">
      {/* Left column: study bar + viewer. Right panel is a sibling so it
          extends up to the L1 header. */}
      <div className="flex-1 min-w-0 flex flex-col">
        <WorkflowStudyBar patient={patient} activeTab="xray" />
        <div className="flex-1 min-h-0 flex">
          <ImagingToolbar items={toolbarItems} />

          <div
            ref={fitRef}
            className="flex-1 min-w-0 min-h-0 overflow-hidden p-5 flex items-center justify-center"
          >
            <div
              ref={chartRef}
              className="w-[1024px] shrink-0 space-y-10"
              style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
            >
              {/* Row 1 */}
              <div className="grid grid-cols-7 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7].map((s, i) => (
                  <FilmTile
                    key={s}
                    slot={s}
                    aiOn={aiOn}
                    view={view}
                    tall={i === 2 || i === 3 || i === 4}
                    onOpen={openImage}
                  />
                ))}
              </div>
              {/* Row 2 — bitewings with empty center */}
              <div className="grid grid-cols-7 gap-2.5">
                <FilmTile slot={8} aiOn={aiOn} view={view} onOpen={openImage} />
                <FilmTile slot={9} aiOn={aiOn} view={view} onOpen={openImage} />
                <div className="col-span-3 h-24 rounded-sm border border-dashed border-border" />
                <FilmTile slot={10} aiOn={aiOn} view={view} onOpen={openImage} />
                <FilmTile slot={11} aiOn={aiOn} view={view} onOpen={openImage} />
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-7 gap-2.5">
                {[12, 13, 14, 15, 16, 17, 18].map((s, i) => (
                  <FilmTile
                    key={s}
                    slot={s}
                    aiOn={aiOn}
                    view={view}
                    tall={i === 2 || i === 3 || i === 4}
                    onOpen={openImage}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer — spans full width, extending over the left toolbar rail */}
        <div className="shrink-0 h-16 px-3 flex items-center gap-4 border-t border-border bg-card">
          {/* Sort */}
          <button
            type="button"
            className="inline-flex items-center gap-2 h-10 px-3 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:text-foreground transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-down-wide-short text-xs" aria-hidden />
            Sort
          </button>

          {/* FMX / BW */}
          <div className="inline-flex items-center h-10 p-1 rounded-md bg-muted">
            {(
              [
                { id: "fmx", label: "FMX", count: 18 },
                { id: "bw", label: "BW", count: 4 },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeries(s.id)}
                className={cn(
                  "inline-flex items-center gap-2 h-full px-3 rounded-[2px] text-sm font-medium transition-colors cursor-pointer",
                  series === s.id
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold",
                    series === s.id ? "bg-muted text-foreground" : "bg-background text-muted-foreground"
                  )}
                >
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right AI panel */}
      <ImagingRightPanel patient={patient} />
    </div>
  );
}
