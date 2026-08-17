import type { ToothNumber } from "./types";

export interface ToothAsset {
  src: string;
  width: number;
  height: number;
  /**
   * Horizontal mirror. Used to flip a single SVG asset between the patient's
   * left and right side (many quadrants share the same source SVG).
   */
  flipX?: boolean;
  /**
   * Vertical mirror. DO NOT add this to teeth in the table below without an
   * explicit instruction from a clinician/designer — see the orientation
   * lock note above the asset map.
   */
  flipY?: boolean;
}

// ─── ANATOMICAL ORIENTATION LOCK ───────────────────────────────────────────
// The current `flipX` / `flipY` configuration below has been visually verified
// against the chart and signed off as anatomically correct (occlusal surfaces
// of all four quadrants face the chart midline, roots face away). DO NOT
// modify the `flipX` / `flipY` values for any tooth without an explicit
// instruction from the user. This includes:
//   • UR (1–8):    flipX only on 4–8; no Y flip anywhere
//   • UL (9–16):   flipX only; no Y flip
//   • LL (17–24):  flipX only on 18–24; no Y flip anywhere
//   • LR (25–32):  flipX only; no Y flip
// If you think a tooth is mis-oriented, ASK before changing.
// ───────────────────────────────────────────────────────────────────────────
export const TOOTH_ASSETS: Record<ToothNumber, ToothAsset> = {
  1: { src: "/assets/teeth/tooth-1.svg", width: 17.25, height: 26.45 },
  2: { src: "/assets/teeth/tooth-2.svg", width: 19.55, height: 29.9 },
  3: { src: "/assets/teeth/tooth-3.svg", width: 19.55, height: 31.05 },
  4: { src: "/assets/teeth/normal-0.svg", width: 12.65, height: 36.8, flipX: true },
  5: { src: "/assets/teeth/normal-1.svg", width: 12.65, height: 39.1, flipX: true },
  6: { src: "/assets/teeth/normal-2.svg", width: 10.35, height: 41.4, flipX: true },
  7: { src: "/assets/teeth/normal-3.svg", width: 9.2, height: 35.65, flipX: true },
  8: { src: "/assets/teeth/normal-4.svg", width: 11.5, height: 41.4, flipX: true },
  9: { src: "/assets/teeth/tooth-9.svg", width: 10, height: 36, flipX: true },
  10: { src: "/assets/teeth/normal-5.svg", width: 9, height: 35, flipX: true },
  11: { src: "/assets/teeth/normal-6.svg", width: 9, height: 36, flipX: true },
  12: { src: "/assets/teeth/normal-7.svg", width: 11, height: 34, flipX: true },
  13: { src: "/assets/teeth/normal-8.svg", width: 11, height: 32, flipX: true },
  14: { src: "/assets/teeth/tooth-14.svg", width: 17, height: 27, flipX: true },
  15: { src: "/assets/teeth/tooth-15.svg", width: 17, height: 26, flipX: true },
  16: { src: "/assets/teeth/tooth-16.svg", width: 15, height: 23, flipX: true },
  17: { src: "/assets/teeth/tooth-17.svg", width: 17, height: 27 },
  18: { src: "/assets/teeth/normal-17.svg", width: 17, height: 30, flipX: true },
  19: { src: "/assets/teeth/normal-10.svg", width: 17, height: 30, flipX: true },
  20: { src: "/assets/teeth/normal-16.svg", width: 11, height: 34, flipX: true },
  21: { src: "/assets/teeth/normal-12.svg", width: 10, height: 32, flipX: true },
  22: { src: "/assets/teeth/normal-13.svg", width: 9, height: 34, flipX: true },
  23: { src: "/assets/teeth/normal-14.svg", width: 7, height: 31, flipX: true },
  24: { src: "/assets/teeth/normal-15.svg", width: 7, height: 31, flipX: true },
  25: { src: "/assets/teeth/normal-15.svg", width: 7, height: 31, flipX: true },
  26: { src: "/assets/teeth/normal-14.svg", width: 7, height: 31, flipX: true },
  27: { src: "/assets/teeth/normal-13.svg", width: 9, height: 34, flipX: true },
  28: { src: "/assets/teeth/normal-12.svg", width: 10, height: 32, flipX: true },
  29: { src: "/assets/teeth/normal-11.svg", width: 11, height: 34, flipX: true },
  30: { src: "/assets/teeth/normal-10.svg", width: 17, height: 30, flipX: true },
  31: { src: "/assets/teeth/normal-9.svg", width: 17, height: 30, flipX: true },
  32: { src: "/assets/teeth/tooth-32.svg", width: 17, height: 27, flipX: true },
};
