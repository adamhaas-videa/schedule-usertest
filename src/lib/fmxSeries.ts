// The 18-film full-mouth mount, by row. Slot numbers match the assets in
// /public/xrays (slot-01 … slot-18): the top and bottom rows are periapicals,
// with the three anterior films mounted tall; the middle row is the four
// bitewings flanking the empty centre of the mount.
export const FMX_TOP_ROW: readonly number[] = [1, 2, 3, 4, 5, 6, 7];
export const FMX_BITEWINGS: readonly number[] = [8, 9, 10, 11];
export const FMX_BOTTOM_ROW: readonly number[] = [12, 13, 14, 15, 16, 17, 18];

/** Column indexes within a periapical row that hold a tall anterior film. */
export const FMX_TALL_COLUMNS: ReadonlySet<number> = new Set([2, 3, 4]);

/** Non-FMX captures from the same visit: the pano and intraoral photos. */
export interface VisitImage {
  id: string;
  src: string;
  alt: string;
}

export const VISIT_IMAGES: readonly VisitImage[] = [
  { id: "pano", src: "/xrays/visit/pano.png", alt: "Panoramic radiograph" },
  {
    id: "photo-01",
    src: "/xrays/visit/photo-01.png",
    alt: "Intraoral photo, upper arch",
  },
  {
    id: "photo-02",
    src: "/xrays/visit/photo-02.png",
    alt: "Intraoral photo, anterior teeth",
  },
];

/** Which images the FMX viewer shows: the whole mount, one film type, or the
 *  visit's other captures. */
export type FmxSeries = "fmx" | "bw" | "pa" | "other";

export interface FmxSeriesMeta {
  id: FmxSeries;
  label: string;
  /** Long name, surfaced as the toggle's tooltip. */
  title: string;
  /** Image count shown in the toggle's badge. */
  count: number;
}

export const FMX_SERIES: readonly FmxSeriesMeta[] = [
  {
    id: "fmx",
    label: "FMX",
    title: "Full mouth series",
    count: FMX_TOP_ROW.length + FMX_BITEWINGS.length + FMX_BOTTOM_ROW.length,
  },
  { id: "bw", label: "BW", title: "Bitewings", count: FMX_BITEWINGS.length },
  {
    id: "pa",
    label: "PA",
    title: "Periapicals",
    count: FMX_TOP_ROW.length + FMX_BOTTOM_ROW.length,
  },
  {
    id: "other",
    label: "Other",
    title: "Other captures from this visit",
    count: VISIT_IMAGES.length,
  },
];

export const DEFAULT_FMX_SERIES: FmxSeries = "fmx";
