import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useImagingToolbar } from "@/context/ImagingToolbarContext";
import { useAiView } from "@/context/AiViewContext";
import {
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  CONTRAST_MAX,
  CONTRAST_MIN,
  allFindingsOff,
  isAdjusted,
  type DisplayThreshold,
  type FindingKey,
  type HdMode,
} from "@/lib/imagingToolbar";
import { Hd1Icon, Hd2Icon, PeriodontalMarkIcon } from "./toolbarIcons";

function L2Shell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={200}>
      <div className="flex flex-col items-center gap-1.5">{children}</div>
    </TooltipProvider>
  );
}

// Pressed-in well from the original L2, plus the L1 cyan hairline so selected
// chips still read on the #212734 panel (the old teal fill sat too close to it).
const L2_ON_FILL = "#0A0A0A";
const L2_ON_RING = "inset 0 0 0 1px rgba(78,206,234,0.55)";

function L2Button({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  const on = active && !disabled;
  return (
    <Tooltip>
      <TooltipTrigger
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "flex size-8 items-center justify-center rounded transition-[background-color,box-shadow,opacity] duration-150",
          disabled ? "cursor-not-allowed text-zinc-500" : "cursor-pointer",
          on
            ? "text-zinc-100 hover:opacity-90"
            : !disabled && "bg-transparent text-slate-200 hover:bg-[#2c3344]"
        )}
        style={
          on
            ? { backgroundColor: L2_ON_FILL, boxShadow: L2_ON_RING }
            : undefined
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function ThresholdBars({ count }: { count: 1 | 2 | 3 | 4 }) {
  return (
    <span
      aria-hidden
      className="flex flex-col items-center justify-center gap-[2px]"
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="block h-[2px] w-4 rounded-full bg-slate-200" />
      ))}
    </span>
  );
}

function VerticalSlider({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const setFromClientY = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = 1 - (clientY - rect.top) / rect.height;
    const next = min + Math.round(ratio * (max - min));
    onChange(Math.min(max, Math.max(min, next)));
  };

  return (
    <div className="absolute left-full top-1/2 z-50 ml-2 flex h-48 -translate-y-1/2 items-center rounded-md bg-black px-3 py-4 shadow-lg">
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        className="relative h-40 w-2 cursor-pointer rounded-full bg-zinc-600"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientY(e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            setFromClientY(e.clientY);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            onChange(Math.min(max, value + 5));
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            onChange(Math.max(min, value - 5));
          }
        }}
      >
        <span
          className="absolute inset-x-0 bottom-0 rounded-full bg-white/80"
          style={{ height: `${((value - min) / (max - min)) * 100}%` }}
        />
        <span
          className="absolute left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
          style={{ top: `${(1 - (value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );
}

const FINDINGS: {
  key: FindingKey;
  label: string;
  swatch?: string;
  icon?: "perio" | "anatomy";
}[] = [
  { key: "restorative", label: "Restorative", swatch: "#DD174C" },
  { key: "incipient", label: "Incipient", swatch: "#D4A700" },
  { key: "periodontal", label: "Periodontal", icon: "perio" },
  { key: "endodontic", label: "Endodontic", swatch: "#992D5B" },
  { key: "anatomy", label: "Tooth Anatomy", icon: "anatomy" },
];

/** Elements L2 — finding-type toggles. Stays pinned while flipping images. */
export function FindingTypesMenu() {
  const { findingTypes, setFindingTypes } = useImagingToolbar();
  const { setAiOn } = useAiView();

  return (
    <L2Shell>
      {FINDINGS.map((f) => {
        const on = findingTypes[f.key];
        return (
          <L2Button
            key={f.key}
            label={f.label}
            active={on}
            onClick={() => {
              const next = {
                ...findingTypes,
                [f.key]: !findingTypes[f.key],
              };
              setFindingTypes(next);
              setAiOn(!allFindingsOff(next));
            }}
          >
            <span className={cn("flex items-center justify-center", !on && "opacity-40")}>
              {f.icon === "perio" ? (
                <PeriodontalMarkIcon className="size-4" />
              ) : f.icon === "anatomy" ? (
                <i className="fa-regular fa-tooth text-sm" aria-hidden />
              ) : (
                <span
                  className="size-3.5 rounded-[2px]"
                  style={{ backgroundColor: f.swatch }}
                />
              )}
            </span>
          </L2Button>
        );
      })}
    </L2Shell>
  );
}

const THRESHOLDS: {
  id: DisplayThreshold;
  label: string;
  bars: 1 | 2 | 3 | 4;
}[] = [
  { id: "all", label: "Show All", bars: 4 },
  { id: "more", label: "More", bars: 3 },
  { id: "balanced", label: "Balanced", bars: 2 },
  { id: "less", label: "Less", bars: 1 },
];

/** Threshold L2 — single-select sensitivity. */
export function DisplayThresholdMenu() {
  const { threshold, setThreshold } = useImagingToolbar();

  return (
    <L2Shell>
      <L2Button label="Display Threshold Settings">
        <i className="fa-regular fa-gear text-base" aria-hidden />
      </L2Button>
      {THRESHOLDS.map((t) => (
        <L2Button
          key={t.id}
          label={t.label}
          active={threshold === t.id}
          onClick={() => setThreshold(t.id)}
        >
          <ThresholdBars count={t.bars} />
        </L2Button>
      ))}
    </L2Shell>
  );
}

/** Quality L2 — mutually exclusive HD1/HD2 plus image-quality findings. */
export function QualityMenu({ slot }: { slot: number }) {
  const {
    adjustmentsFor,
    patchAdjustments,
    qualityFindings,
    setQualityFindings,
  } = useImagingToolbar();
  const adj = adjustmentsFor(slot);

  const selectHd = (value: Exclude<HdMode, false>) => {
    patchAdjustments(slot, { hd: adj.hd === value ? false : value });
  };

  return (
    <L2Shell>
      <L2Button
        label={
          adj.hd === "HD1" ? "Show original image" : "Show HD1 sharpened image"
        }
        active={adj.hd === "HD1"}
        onClick={() => selectHd("HD1")}
      >
        <Hd1Icon />
      </L2Button>
      <L2Button
        label={
          adj.hd === "HD2" ? "Show original image" : "Show HD2 sharpened image"
        }
        active={adj.hd === "HD2"}
        onClick={() => selectHd("HD2")}
      >
        <Hd2Icon />
      </L2Button>
      <L2Button
        label={
          qualityFindings
            ? "Hide Image Quality Findings"
            : "Show Image Quality Findings"
        }
        active={qualityFindings}
        onClick={() => setQualityFindings(!qualityFindings)}
      >
        <span className="relative flex size-4 items-center justify-center">
          <i
            className={cn(
              "fa-regular fa-browser text-sm",
              qualityFindings ? "text-sky-300" : "text-slate-200"
            )}
            aria-hidden
          />
          <i
            className="fa-solid fa-triangle-exclamation absolute -right-1 -top-1 text-[8px] text-amber-400"
            aria-hidden
          />
        </span>
      </L2Button>
    </L2Shell>
  );
}

/** Tools L2 — per-image adjustments. Brightness/contrast open an L3 slider. */
export function ToolsMenu({
  slot,
  onFullScreen,
}: {
  slot: number;
  onFullScreen?: () => void;
}) {
  const { adjustmentsFor, patchAdjustments, resetAdjustments } =
    useImagingToolbar();
  const adj = adjustmentsFor(slot);
  const dirty = isAdjusted(adj);
  const [openSlider, setOpenSlider] = useState<"brightness" | "contrast" | null>(
    null
  );
  const brightnessRef = useRef<HTMLDivElement>(null);
  const contrastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openSlider === null) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (brightnessRef.current?.contains(target)) return;
      if (contrastRef.current?.contains(target)) return;
      setOpenSlider(null);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [openSlider]);

  return (
    <L2Shell>
      <L2Button
        label="Reset all settings (D)"
        disabled={!dirty}
        onClick={() => dirty && resetAdjustments(slot)}
      >
        <i className="fa-solid fa-clock-rotate-left text-sm" aria-hidden />
      </L2Button>

      <div ref={brightnessRef} className="relative">
        <L2Button
          label="Adjust brightness (1-6)"
          active={openSlider === "brightness"}
          onClick={() =>
            setOpenSlider(openSlider === "brightness" ? null : "brightness")
          }
        >
          <i className="fa-regular fa-sun-bright text-sm" aria-hidden />
        </L2Button>
        {openSlider === "brightness" && (
          <VerticalSlider
            label="Brightness"
            min={BRIGHTNESS_MIN}
            max={BRIGHTNESS_MAX}
            value={adj.brightness}
            onChange={(brightness) => patchAdjustments(slot, { brightness })}
          />
        )}
      </div>

      <div ref={contrastRef} className="relative">
        <L2Button
          label="Adjust contrast"
          active={openSlider === "contrast"}
          onClick={() =>
            setOpenSlider(openSlider === "contrast" ? null : "contrast")
          }
        >
          <i className="fa-regular fa-circle-half-stroke text-sm" aria-hidden />
        </L2Button>
        {openSlider === "contrast" && (
          <VerticalSlider
            label="Contrast"
            min={CONTRAST_MIN}
            max={CONTRAST_MAX}
            value={adj.contrast}
            onChange={(contrast) => patchAdjustments(slot, { contrast })}
          />
        )}
      </div>

      <L2Button
        label="Invert colors (I)"
        active={adj.invert}
        onClick={() => patchAdjustments(slot, { invert: !adj.invert })}
      >
        <i className="fa-regular fa-droplet-slash text-sm" aria-hidden />
      </L2Button>

      <L2Button
        label="Toggle magnify mode (M)"
        active={adj.magnify}
        onClick={() => patchAdjustments(slot, { magnify: !adj.magnify })}
      >
        <i className="fa-regular fa-magnifying-glass text-sm" aria-hidden />
      </L2Button>

      <L2Button
        label="Rotate image (.)"
        onClick={() =>
          patchAdjustments(slot, { rotation: (adj.rotation + 90) % 360 })
        }
      >
        <i className="fa-regular fa-arrow-rotate-right text-sm" aria-hidden />
      </L2Button>

      <L2Button
        label="Mirror image"
        active={adj.mirrored}
        onClick={() => patchAdjustments(slot, { mirrored: !adj.mirrored })}
      >
        <i className="fa-regular fa-reflect-horizontal text-sm" aria-hidden />
      </L2Button>

      <L2Button label="View in full screen" onClick={onFullScreen}>
        <i className="fa-solid fa-expand text-sm" aria-hidden />
      </L2Button>
    </L2Shell>
  );
}
