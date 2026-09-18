// The odontogram's coordinate system: which silhouette each tooth uses, how big
// its box is, and the two densities the chart can be laid out at. Separated from
// the renderer so a call site can ask for a density's natural size (to scale the
// chart into a box) without pulling the component in.

// Tooth silhouettes exported from the odontogram component in Figma (file
// E2QYvtQcNIpQNI9AubstEf). Each silhouette is shared by the two teeth of the
// same type in an arch — the file name records which universal numbers use it.
// Do not hand-edit these: re-export from Figma instead.
import tooth0116 from "@/assets/odontogram/tooth-01-16.svg";
import tooth0215 from "@/assets/odontogram/tooth-02-15.svg";
import tooth0314 from "@/assets/odontogram/tooth-03-14.svg";
import tooth0413 from "@/assets/odontogram/tooth-04-13.svg";
import tooth0512 from "@/assets/odontogram/tooth-05-12.svg";
import tooth0611 from "@/assets/odontogram/tooth-06-11.svg";
import tooth0710 from "@/assets/odontogram/tooth-07-10.svg";
import tooth0809 from "@/assets/odontogram/tooth-08-09.svg";
import tooth17 from "@/assets/odontogram/tooth-17.svg";
import tooth1831 from "@/assets/odontogram/tooth-18-31.svg";
import tooth1930 from "@/assets/odontogram/tooth-19-30.svg";
import tooth2029 from "@/assets/odontogram/tooth-20-29.svg";
import tooth2128 from "@/assets/odontogram/tooth-21-28.svg";
import tooth2227 from "@/assets/odontogram/tooth-22-27.svg";
import tooth2326 from "@/assets/odontogram/tooth-23-26.svg";
import tooth2425 from "@/assets/odontogram/tooth-24-25.svg";
import tooth32 from "@/assets/odontogram/tooth-32.svg";
export type Arch = "upper" | "lower";

export interface ToothSpec {
  n: number;
  w: number;
  h: number;
  src: string;
}

// Box sizes come straight from the Figma odontogram so the arches keep their
// crown-height silhouette (molars short and wide, canines tall and narrow).
export const Q1: ToothSpec[] = [
  { n: 1, w: 21.014, h: 31.521, src: tooth0116 },
  { n: 2, w: 22.515, h: 34.523, src: tooth0215 },
  { n: 3, w: 22.529, h: 35.307, src: tooth0314 },
  { n: 4, w: 14.37, h: 41.882, src: tooth0413 },
  { n: 5, w: 14.581, h: 45.517, src: tooth0512 },
  { n: 6, w: 12.775, h: 50.743, src: tooth0611 },
  { n: 7, w: 11.835, h: 46.185, src: tooth0710 },
  { n: 8, w: 13.558, h: 49.097, src: tooth0809 },
];

export const Q2: ToothSpec[] = [
  { n: 9, w: 13.558, h: 49.097, src: tooth0809 },
  { n: 10, w: 11.835, h: 46.185, src: tooth0710 },
  { n: 11, w: 12.775, h: 50.743, src: tooth0611 },
  { n: 12, w: 14.581, h: 45.517, src: tooth0512 },
  { n: 13, w: 14.37, h: 41.882, src: tooth0413 },
  { n: 14, w: 22.529, h: 35.307, src: tooth0314 },
  { n: 15, w: 22.515, h: 34.523, src: tooth0215 },
  { n: 16, w: 21.014, h: 31.521, src: tooth0116 },
];

export const Q4: ToothSpec[] = [
  { n: 32, w: 23.363, h: 37.126, src: tooth32 },
  { n: 31, w: 22.581, h: 39.352, src: tooth1831 },
  { n: 30, w: 22.874, h: 41.036, src: tooth1930 },
  { n: 29, w: 14.932, h: 45.729, src: tooth2029 },
  { n: 28, w: 13.965, h: 44.364, src: tooth2128 },
  { n: 27, w: 12.329, h: 46.378, src: tooth2227 },
  { n: 26, w: 9.693, h: 43.175, src: tooth2326 },
  { n: 25, w: 9.728, h: 42.509, src: tooth2425 },
];

export const Q3: ToothSpec[] = [
  { n: 24, w: 9.728, h: 42.509, src: tooth2425 },
  { n: 23, w: 9.693, h: 43.175, src: tooth2326 },
  { n: 22, w: 12.329, h: 46.378, src: tooth2227 },
  { n: 21, w: 13.965, h: 44.364, src: tooth2128 },
  { n: 20, w: 14.932, h: 45.729, src: tooth2029 },
  { n: 19, w: 22.874, h: 41.036, src: tooth1930 },
  { n: 18, w: 22.581, h: 39.352, src: tooth1831 },
  { n: 17, w: 23.363, h: 37.126, src: tooth17 },
];

// Two geometries for the same chart. `default` is the Figma odontogram as it
// ships in the summary slideout; `compact` keeps the tooth silhouettes but
// pulls the gaps, padding and quadrant gutters in tight so the chart survives
// being scaled down onto a schedule card. Nothing here scales the teeth — the
// call site does that with a transform, so the SVGs stay crisp.
export type OdontogramDensity = "default" | "compact";

export interface OdontogramMetrics {
  toothGap: number;
  pad: number;
  quadGap: number;
  border: number;
  radius: number;
  upperRow: number;
  lowerRow: number;
  /**
   * Distribute slack between the teeth when a quadrant is laid out wider than
   * its natural width, instead of leaving it at the end of the row. Lets the
   * card fill its width with the teeth sized by the height it has to spare.
   */
  spread: boolean;
  /** Natural size of the whole chart, for a fit-to-box transform. */
  width: number;
  height: number;
}

const QUADRANT_WIDTH = Q1.reduce((sum, t) => sum + t.w, 0);
const UPPER_TOOTH_HEIGHT = Math.max(...Q1.map((t) => t.h));
const LOWER_TOOTH_HEIGHT = Math.max(...Q3.map((t) => t.h));

function chartWidth(toothGap: number, pad: number, quadGap: number): number {
  return 2 * (QUADRANT_WIDTH + 7 * toothGap + 2 * pad) + quadGap;
}

export const DENSITY: Record<OdontogramDensity, OdontogramMetrics> = {
  default: {
    toothGap: 11.257,
    pad: 10.507,
    quadGap: 3,
    border: 1.5,
    radius: 2,
    // Row heights are the Figma values rather than a computation: the upper
    // arch box is 3px taller than its row and overflows it evenly, which is
    // what the slideout has always rendered.
    upperRow: 71.757,
    lowerRow: 69.796,
    spread: false,
    width: chartWidth(11.257, 10.507, 3),
    height: 71.757 + 3 + 69.796 + 3,
  },
  compact: {
    toothGap: 2,
    pad: 3.5,
    quadGap: 2.5,
    border: 1.5,
    radius: 3,
    upperRow: UPPER_TOOTH_HEIGHT + 2 * 3.5 + 2 * 1.5,
    lowerRow: LOWER_TOOTH_HEIGHT + 2 * 3.5 + 2 * 1.5,
    spread: true,
    width: chartWidth(2, 3.5, 2.5),
    height:
      UPPER_TOOTH_HEIGHT +
      LOWER_TOOTH_HEIGHT +
      4 * 3.5 +
      4 * 1.5 +
      2.5,
  },
};

export function getOdontogramMetrics(
  density: OdontogramDensity = "default"
): OdontogramMetrics {
  return DENSITY[density];
}
