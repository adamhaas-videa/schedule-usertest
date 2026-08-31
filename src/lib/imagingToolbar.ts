/** Sticky L2 ids. Only one submenu is pinned at a time. */
export type ToolbarMenuId = "elements" | "threshold" | "quality" | "tools";

export type FindingKey =
  | "restorative"
  | "incipient"
  | "periodontal"
  | "endodontic"
  | "anatomy";

export type FindingTypes = Record<FindingKey, boolean>;

export type DisplayThreshold = "all" | "more" | "balanced" | "less";

export type HdMode = "HD1" | "HD2" | false;

export interface ImageAdjustments {
  /** CSS brightness percent. 100 is identity. */
  brightness: number;
  /** CSS contrast percent. 100 is identity. */
  contrast: number;
  invert: boolean;
  /** Clockwise rotation in 90° steps. */
  rotation: number;
  mirrored: boolean;
  hd: HdMode;
  magnify: boolean;
}

export const DEFAULT_FINDING_TYPES: FindingTypes = {
  restorative: true,
  incipient: true,
  periodontal: true,
  endodontic: true,
  anatomy: false,
};

export const DEFAULT_THRESHOLD: DisplayThreshold = "balanced";

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  invert: false,
  rotation: 0,
  mirrored: false,
  hd: "HD1",
  magnify: false,
};

export const BRIGHTNESS_MIN = 50;
export const BRIGHTNESS_MAX = 200;
export const CONTRAST_MIN = 50;
export const CONTRAST_MAX = 200;

export function isAdjusted(a: ImageAdjustments): boolean {
  return (
    a.brightness !== DEFAULT_ADJUSTMENTS.brightness ||
    a.contrast !== DEFAULT_ADJUSTMENTS.contrast ||
    a.invert ||
    a.rotation !== 0 ||
    a.mirrored ||
    a.hd !== DEFAULT_ADJUSTMENTS.hd ||
    a.magnify
  );
}

export function imageFilter(a: ImageAdjustments): string {
  const hdBoost = a.hd === "HD2" ? 1.18 : a.hd === "HD1" ? 1.08 : 1;
  return [
    `brightness(${a.brightness / 100})`,
    `contrast(${(a.contrast / 100) * hdBoost})`,
    a.invert ? "invert(1)" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function imageTransform(a: ImageAdjustments, zoomPercent: number): string {
  const mag = a.magnify ? 1.4 : 1;
  return [
    `scale(${(zoomPercent / 100) * mag})`,
    `rotate(${a.rotation}deg)`,
    `scaleX(${a.mirrored ? -1 : 1})`,
  ].join(" ");
}
