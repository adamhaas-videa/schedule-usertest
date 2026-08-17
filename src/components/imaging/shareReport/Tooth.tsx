import { cn } from "@/lib/utils";

import { TOOTH_ASSETS } from "./teethAssets";
import { TOOTH_SVG_GEOMETRY } from "./toothSvgGeometry";
import type { Arch, ToothNumber, ToothState } from "./types";

interface ToothProps {
  number: ToothNumber;
  arch: Arch;
  state: ToothState;
  onClick: (tooth: ToothNumber) => void;
}

const stateClasses: Record<ToothState, string> = {
  normal: "border-transparent",
  saved: "border-2 border-solid border-[var(--color-deep-teal-500)]",
  selected:
    "border-2 border-solid border-[var(--color-periwinkle-400)] bg-[var(--color-periwinkle-950)]",
  unsaved:
    "border-2 border-dashed border-[var(--stone-400)]",
};

const numberStateClasses: Record<ToothState, string> = {
  normal: "text-[var(--base-muted-foreground)]",
  saved: "text-[var(--base-muted-foreground)]",
  selected: "text-[var(--accent-foreground)]",
  unsaved: "text-[var(--base-muted-foreground)]",
};

// Per-state fill/stroke colors applied to the inline tooth SVG.
// Saved teeth get the teal "added to report" treatment; everything else uses
// the neutral default and relies on the button border for state cues.
const svgColorsByState: Record<ToothState, { fill: string; stroke: string }> = {
  normal: { fill: "#94A3B8", stroke: "#475569" },
  saved: { fill: "#3D8A9B", stroke: "#124555" },
  selected: { fill: "#94A3B8", stroke: "#475569" },
  unsaved: { fill: "#94A3B8", stroke: "#475569" },
};

function getGeometryKey(src: string): string | null {
  const match = src.match(/\/([^/]+)\.svg$/);
  return match?.[1] ?? null;
}

export function Tooth({ number, arch, state, onClick }: ToothProps) {
  const isMaxillary = arch === "maxillary";
  const asset = TOOTH_ASSETS[number];
  const geometryKey = getGeometryKey(asset.src);
  const geometry = geometryKey ? TOOTH_SVG_GEOMETRY[geometryKey] : undefined;
  const colors = svgColorsByState[state];

  const transform = [asset.flipX ? "scaleX(-1)" : "", asset.flipY ? "scaleY(-1)" : ""]
    .filter(Boolean)
    .join(" ");

  const toothImage = (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{ width: asset.width, height: asset.height }}
    >
      {geometry ? (
        <svg
          viewBox={geometry.viewBox}
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{
            width: asset.width,
            height: asset.height,
            transform: transform || undefined,
            transformOrigin: "center",
            display: "block",
            overflow: "visible",
          }}
        >
          <path
            d={geometry.d}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={geometry.strokeWidth}
            strokeLinecap={geometry.strokeLinecap}
            strokeLinejoin={geometry.strokeLinejoin}
          />
        </svg>
      ) : null}
    </div>
  );

  const numberLabel = (
    <span
      className={cn(
        "text-[12px] font-medium leading-none",
        numberStateClasses[state],
      )}
    >
      {number}
    </span>
  );

  return (
    <button
      type="button"
      aria-pressed={state === "selected"}
      aria-label={`Tooth ${number}, ${state}`}
      className={cn(
        "flex h-20 w-8 shrink-0 cursor-pointer flex-col items-center justify-between rounded-md p-2 transition-colors hover:bg-[color-mix(in_oklab,var(--accent)_60%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-periwinkle-400)]",
        stateClasses[state],
      )}
      onClick={() => onClick(number)}
    >
      {isMaxillary ? (
        <>
          {numberLabel}
          {toothImage}
        </>
      ) : (
        <>
          {toothImage}
          {numberLabel}
        </>
      )}
    </button>
  );
}
