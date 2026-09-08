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
import SingleImageFooter from "./SingleImageFooter";
import { INTRAORAL_PHOTOS } from "@/lib/fmxSeries";
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
  onStep,
}: SingleImageViewerProps) {
  const navigate = useNavigate();
  // Patient view is the default when AI is enabled. The selection is held in
  // shared context so it persists across the whole imaging experience —
  // toggling AI off then on, and navigating FMX ↔ single image ↔ back.
  const { view, setView, imagingPanelOpen, setImagingPanelOpen } = useAiView();
  const {
    adjustmentsFor,
    patchAdjustments,
    resetAdjustments,
    qualityFindings,
  } = useImagingToolbar();
  const toggleAi = useToggleAiOverlay(aiOn, onAiToggle);
  const [zoom, setZoom] = useState(95);
  // Footer thumbnail selection, keyed to the film it was made on so stepping to
  // another image drops back to that film's radiograph.
  const [photoSelection, setPhotoSelection] = useState<{
    slot: number;
    photoId: string | null;
  }>({ slot, photoId: null });
  const selectedPhotoId =
    photoSelection.slot === slot ? photoSelection.photoId : null;
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
  const filmSrc = !aiOn
    ? `/xrays/ai-off/${slot}.png`
    : view === "clinical" && CLINICAL_SET_AVAILABLE
      ? `/xrays/clinical/slot-${paddedSlot}.png`
      : patientSrc;

  // The footer's thumbnails select between the film on screen and the intraoral
  // photos of the same area. A photo takes the viewport until the user steps to
  // another film or picks the film thumbnail again; the AI overlays are film
  // only, so the toggles don't apply while a photo is up.
  const selectedPhoto =
    INTRAORAL_PHOTOS.find((photo) => photo.id === selectedPhotoId) ?? null;
  const src = selectedPhoto ? selectedPhoto.src : filmSrc;
  const alt = selectedPhoto ? selectedPhoto.alt : `Radiograph ${slot}`;

  const handleImgError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    // A not-yet-added clinical slot falls back to the patient image.
    const img = e.currentTarget;
    if (!selectedPhoto && aiOn && view === "clinical" && !img.src.endsWith(patientSrc)) {
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
          alt={alt}
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
        <WorkflowStudyBar
          patient={patient}
          activeTab="xray"
          rightPanelOpen={imagingPanelOpen}
          onToggleRightPanel={() => setImagingPanelOpen(!imagingPanelOpen)}
        />
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
              alt={alt}
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
          </div>
        </div>

        {/* Footer — spans full width, extending over the left toolbar rail */}
        <SingleImageFooter
          slot={slot}
          slots={slots}
          selectedPhotoId={selectedPhotoId}
          zoom={zoom}
          onZoomChange={setZoom}
          onStep={onStep}
          onSelectPhoto={(photoId) => setPhotoSelection({ slot, photoId })}
          onToggleExpand={onToggleExpand}
        />
      </div>

      <ImagingRightPanel
        patient={patient}
        subtitle="Below are the AI analysis results for all images from this visit:"
        open={imagingPanelOpen}
      />
    </div>
  );
}
