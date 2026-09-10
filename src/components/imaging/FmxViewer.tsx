import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";
import { useAiView, type AiView } from "@/context/AiViewContext";
import { useAiOverlayControls } from "@/context/ImagingToolbarContext";
import ImagingToolbar, { type ToolbarEntry } from "./ImagingToolbar";
import { FindingTypesMenu, DisplayThresholdMenu } from "./submenus";
import ImagingRightPanel from "./ImagingRightPanel";
import FmxFooter from "./FmxFooter";
import { WorkflowStudyBar } from "@/components/workflow/WorkflowHeader";
import {
  DEFAULT_FMX_SERIES,
  FMX_BITEWINGS,
  FMX_BOTTOM_ROW,
  FMX_TALL_COLUMNS,
  FMX_TOP_ROW,
  VISIT_IMAGES,
  type FmxSeries,
} from "@/lib/fmxSeries";
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

/** One periapical row of the mount: seven films, the anterior three mounted tall. */
function PeriapicalRow({
  slots,
  aiOn,
  view,
  onOpen,
}: {
  slots: readonly number[];
  aiOn: boolean;
  view: "patient" | "clinical";
  onOpen: (slot: number) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-2.5">
      {slots.map((s, i) => (
        <FilmTile
          key={s}
          slot={s}
          aiOn={aiOn}
          view={view}
          tall={FMX_TALL_COLUMNS.has(i)}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

export default function FmxViewer({ patient, aiOn, onAiToggle }: FmxViewerProps) {
  const navigate = useNavigate();
  // Patient view is the default when AI is enabled. The selection is held in
  // shared context so it persists across the whole imaging experience —
  // toggling AI off then on, and navigating FMX ↔ single image ↔ back.
  const { view, setView, imagingPanelOpen, setImagingPanelOpen } = useAiView();
  const { toggle: toggleAi, enable: enableAi } = useAiOverlayControls(
    aiOn,
    onAiToggle
  );
  // Picking a view while AI is off turns it on, so both sets stay one click away.
  const selectView = (next: AiView) => {
    enableAi();
    setView(next);
  };
  // Footer toggle: the whole mount, the bitewing series, or the visit's other
  // captures. Only the full mount carries the periapical rows.
  const [series, setSeries] = useState<FmxSeries>(DEFAULT_FMX_SERIES);
  const showPeriapicals = series === "fmx";
  const showBitewings = series === "fmx" || series === "bw";
  const showOther = series === "other";

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
        onClick: () => selectView("patient"),      },
      clinical: {
        key: "clinical-view",
        label: "Clinical",
        renderIcon: (state) => <ClinicalToothIcon state={state} className="size-5" />,
        active: aiOn && view === "clinical",
        onClick: () => selectView("clinical"),      },
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
        <WorkflowStudyBar
          patient={patient}
          activeTab="xray"
          rightPanelOpen={imagingPanelOpen}
          onToggleRightPanel={() => setImagingPanelOpen(!imagingPanelOpen)}
        />
        <div className="flex-1 min-h-0 flex">
          <ImagingToolbar items={toolbarItems} />

          <div
            ref={fitRef}
            className="flex-1 min-w-0 min-h-0 overflow-hidden p-5 flex items-center justify-center"
          >
            <div
              ref={chartRef}
              className={cn(
                "shrink-0 space-y-10",
                // The bitewing-only row keeps each film at its mount width:
                // 4 of the 7 columns plus 3 gaps, so the fit scale enlarges the
                // films rather than stretching a 4-column grid across 1024px.
                series === "bw" ? "w-[581px]" : "w-[1024px]"
              )}
              style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
            >
              {showPeriapicals && (
                <PeriapicalRow
                  slots={FMX_TOP_ROW}
                  aiOn={aiOn}
                  view={view}
                  onOpen={openImage}
                />
              )}
              {showBitewings &&
                (series === "fmx" ? (
                  // In the full mount the bitewings flank an empty centre.
                  <div className="grid grid-cols-7 gap-2.5">
                    <FilmTile slot={8} aiOn={aiOn} view={view} onOpen={openImage} />
                    <FilmTile slot={9} aiOn={aiOn} view={view} onOpen={openImage} />
                    <div className="col-span-3 h-24 rounded-sm border border-dashed border-border" />
                    <FilmTile slot={10} aiOn={aiOn} view={view} onOpen={openImage} />
                    <FilmTile slot={11} aiOn={aiOn} view={view} onOpen={openImage} />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5">
                    {FMX_BITEWINGS.map((s) => (
                      <FilmTile
                        key={s}
                        slot={s}
                        aiOn={aiOn}
                        view={view}
                        onOpen={openImage}
                      />
                    ))}
                  </div>
                ))}
              {showPeriapicals && (
                <PeriapicalRow
                  slots={FMX_BOTTOM_ROW}
                  aiOn={aiOn}
                  view={view}
                  onOpen={openImage}
                />
              )}
              {showOther && (
                // Pano + intraoral photos. These aren't mount slots, so they
                // have no single-image route yet and render as plain tiles.
                <div className="grid grid-cols-3 gap-2.5">
                  {VISIT_IMAGES.map((img) => (
                    <div
                      key={img.id}
                      className="h-56 overflow-hidden rounded-sm bg-black"
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="size-full object-contain"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer — spans full width, extending over the left toolbar rail */}
        <FmxFooter patient={patient} series={series} onSeriesChange={setSeries} />
      </div>

      {/* Right AI panel */}
      <ImagingRightPanel patient={patient} open={imagingPanelOpen} />
    </div>
  );
}
