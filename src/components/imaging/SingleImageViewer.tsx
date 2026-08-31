import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAiView } from "@/context/AiViewContext";
import { useImagingToolbar, useToggleAiOverlay } from "@/context/ImagingToolbarContext";
import { imageFilter, imageTransform } from "@/lib/imagingToolbar";
import ImagingToolbar, { type ToolbarEntry } from "./ImagingToolbar";
import {
  FindingTypesMenu,
  DisplayThresholdMenu,
  QualityMenu,
  ToolsMenu,
} from "./submenus";
import ImagingRightPanel from "./ImagingRightPanel";
import ImageCarousel from "./ImageCarousel";
import { WorkflowStudyBar } from "@/components/workflow/WorkflowHeader";
import {
  PatientToothIcon,
  ClinicalToothIcon,
  ElementsIcon,
  aiTextColor,
} from "./toolbarIcons";

interface SingleImageViewerProps {
  patient: Patient;
  slot: number;
  slots: number[];
  aiOn: boolean;
  onAiToggle: (on: boolean) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onSelectSlot: (slot: number) => void;
  onStep: (delta: number) => void;
}

export default function SingleImageViewer({
  patient,
  slot,
  slots,
  aiOn,
  onAiToggle,
  expanded,
  onToggleExpand,
  onSelectSlot,
  onStep,
}: SingleImageViewerProps) {
  const navigate = useNavigate();
  // Patient view is the default when AI is enabled. The selection is held in
  // shared context so it persists across the whole imaging experience —
  // toggling AI off then on, and navigating FMX ↔ single image ↔ back.
  const { view, setView } = useAiView();
  const {
    adjustmentsFor,
    patchAdjustments,
    resetAdjustments,
    qualityFindings,
  } = useImagingToolbar();
  const toggleAi = useToggleAiOverlay(aiOn, onAiToggle);
  const [zoom, setZoom] = useState(95);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const adj = adjustmentsFor(slot);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const key = e.key;
      if (key === "d" || key === "D") {
        resetAdjustments(slot);
      } else if (key === "i" || key === "I") {
        patchAdjustments(slot, { invert: !adj.invert });
      } else if (key === "m" || key === "M") {
        patchAdjustments(slot, { magnify: !adj.magnify });
      } else if (key === ".") {
        patchAdjustments(slot, { rotation: (adj.rotation + 90) % 360 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    adj.invert,
    adj.magnify,
    adj.rotation,
    patchAdjustments,
    resetAdjustments,
    slot,
  ]);

  const index = slots.indexOf(slot);
  // Clinical assets live in /public/xrays/clinical/ as slot-01.png … slot-18.png,
  // each matching its patient-view counterpart's pixel dimensions so the crop
  // doesn't shift when swapping views. Missing files fall back to the patient
  // image via the <img> onError handler below.
  const CLINICAL_SET_AVAILABLE = true;
  const paddedSlot = String(slot).padStart(2, "0");
  const patientSrc = `/xrays/slot-${paddedSlot}.png`;
  const src = !aiOn
    ? `/xrays/ai-off/${slot}.png`
    : view === "clinical" && CLINICAL_SET_AVAILABLE
      ? `/xrays/clinical/slot-${paddedSlot}.png`
      : patientSrc;

  const handleImgError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    // A not-yet-added clinical slot falls back to the patient image.
    const img = e.currentTarget;
    if (aiOn && view === "clinical" && !img.src.endsWith(patientSrc)) {
      img.src = patientSrc;
    }
  };

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
    {
      key: "quality",
      label: "Quality",
      iconClass: "fa-regular fa-high-definition",
      iconSizePx: 16,
      hasSubmenu: true,
      submenuAlign: "end",
      submenu: <QualityMenu key={slot} slot={slot} />,
    },
    {
      key: "tools",
      label: "Tools",
      iconClass: "fa-regular fa-pen-ruler",
      iconSizePx: 16,
      hasSubmenu: true,
      submenuAlign: "end",
      submenu: (
        <ToolsMenu key={slot} slot={slot} onFullScreen={onToggleExpand} />
      ),
    },
  ];

  // Expanded (immersive) mode — only the image plus a floating collapse control.
  if (expanded) {
    return (
      <div className="dark imaging-surface flex-1 min-h-0 relative bg-background flex items-center justify-center overflow-hidden">
        <img
          src={src}
          alt={`Radiograph ${slot}`}
          className={cn(
            "h-full w-full object-contain transition-[transform,filter]",
            adj.magnify && "cursor-zoom-in"
          )}
          style={{
            transform: imageTransform(adj, zoom),
            filter: imageFilter(adj),
          }}
          draggable={false}
          onError={handleImgError}
        />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-black/60 border border-zinc-700 text-zinc-100 text-sm font-medium hover:bg-black/80 transition-colors cursor-pointer"
          >
            <i className="fa-regular fa-compress text-xs" aria-hidden />
            Exit full screen
          </button>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-black/60 border border-zinc-700 px-4 py-2">
          <button type="button" onClick={() => onStep(-1)} aria-label="Previous image" className="text-zinc-300 hover:text-white cursor-pointer">
            <i className="fa-regular fa-angle-left" aria-hidden />
          </button>
          <span className="text-xs text-zinc-300 tabular-nums">Image {index + 1}/{slots.length}</span>
          <button type="button" onClick={() => onStep(1)} aria-label="Next image" className="text-zinc-300 hover:text-white cursor-pointer">
            <i className="fa-regular fa-angle-right" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark imaging-surface flex-1 min-h-0 flex bg-background text-foreground">
      {/* Toolbar + viewport stacked above a full-width footer that extends over
          the toolbar rail to the left viewport edge (matches the FMX viewer). */}
      <div className="flex-1 min-w-0 flex flex-col">
        <WorkflowStudyBar patient={patient} activeTab="xray" />
        <div className="flex-1 min-h-0 flex">
          <ImagingToolbar items={toolbarItems} />

          {/* Viewport */}
          <div className="relative flex-1 min-w-0 min-h-0 overflow-hidden flex items-center justify-center p-4">
            {/* Floating back-to-FMX control over the radiograph */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/patient/${patient.id}/xray`)}
              className="absolute left-4 top-4 z-10 cursor-pointer"
            >
              <i className="fa-regular fa-arrow-left text-xs" aria-hidden />
              Back to FMX
            </Button>
            <img
              src={src}
              alt={`Radiograph ${slot}`}
              className={cn(
                "h-full w-full object-contain transition-[transform,filter]",
                adj.magnify && "cursor-zoom-in"
              )}
              style={{
                transform: imageTransform(adj, zoom),
                filter: imageFilter(adj),
              }}
              draggable={false}
              onError={handleImgError}
            />
            {qualityFindings && (
              <div
                className="pointer-events-none absolute inset-6 rounded-sm ring-2 ring-amber-400/70"
                aria-hidden
              >
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                  <i className="fa-solid fa-triangle-exclamation text-[9px]" />
                  Quality
                </span>
              </div>
            )}

            <ImageCarousel
              open={carouselOpen}
              slots={slots}
              currentSlot={slot}
              onSelect={(s) => {
                onSelectSlot(s);
              }}
              onClose={() => setCarouselOpen(false)}
            />
          </div>
        </div>

        {/* Footer — spans full width, extending over the left toolbar rail */}
        <div className="relative shrink-0 h-16 px-4 flex items-center gap-4 border-t border-border bg-card">
          {/* Findings note */}
          <div className="hidden xl:flex flex-col leading-tight">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              11 Findings · 5 Hidden
              <i className="fa-solid fa-circle-info text-[11px]" aria-hidden />
            </span>
            <span className="text-[11px] text-muted-foreground">
              Visualization is intended for patient education.
            </span>
          </div>

          {/* Image navigation — absolutely centered over the radiograph viewport.
              The band starts at left-[72px] to skip the toolbar rail (w-[72px]),
              keeping this group centered on the film regardless of the flanking
              findings note / zoom controls. The band is pointer-events-none so it
              doesn't intercept clicks on the controls it overlaps. */}
          <div className="pointer-events-none absolute inset-y-0 left-[72px] right-0 flex items-center justify-center">
            <div className="pointer-events-auto flex items-center gap-3">
              <button type="button" onClick={() => onStep(-1)} aria-label="Previous image" className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                <i className="fa-regular fa-angle-left" aria-hidden />
              </button>
              <span className="text-xs text-muted-foreground tabular-nums">
                Image {index + 1}/{slots.length}
              </span>
              <button type="button" onClick={() => onStep(1)} aria-label="Next image" className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                <i className="fa-regular fa-angle-right" aria-hidden />
              </button>
            </div>
          </div>

          {/* Zoom + view controls — grouped and pinned to the right */}
          <div className="ml-auto flex items-center gap-3">
            {/* Zoom slider */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={25}
                max={200}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Zoom"
                className="w-28 accent-deep-teal-400 cursor-pointer"
              />
              <span className="w-10 text-xs text-muted-foreground tabular-nums">{zoom}%</span>
            </div>

            {/* Expand */}
            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <i className="fa-regular fa-expand text-xs" aria-hidden />
              Expand
            </button>

            {/* Images (carousel) */}
            <button
              type="button"
              onClick={() => setCarouselOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md transition-colors cursor-pointer",
                carouselOpen ? "bg-muted text-foreground" : "text-foreground hover:bg-muted"
              )}
            >
              <i className="fa-regular fa-images text-xs" aria-hidden />
              Images
            </button>
          </div>
        </div>
      </div>

      <ImagingRightPanel
        patient={patient}
        subtitle="Below are the AI analysis results for all images from this visit:"
      />
    </div>
  );
}
