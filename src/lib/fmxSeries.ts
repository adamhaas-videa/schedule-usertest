// The 18-film full-mouth mount, by row. Slot numbers match the assets in
// /public/xrays (slot-01 … slot-18): the top and bottom rows are periapicals,
// with the three anterior films mounted tall; the middle row is the four
// bitewings flanking the empty centre of the mount.
export const FMX_TOP_ROW: readonly number[] = [1, 2, 3, 4, 5, 6, 7];
export const FMX_BITEWINGS: readonly number[] = [8, 9, 10, 11];
export const FMX_BOTTOM_ROW: readonly number[] = [12, 13, 14, 15, 16, 17, 18];

/** Column indexes within a periapical row that hold a tall anterior film. */
export const FMX_TALL_COLUMNS: ReadonlySet<number> = new Set([2, 3, 4]);

/** Which films the FMX viewer shows: the whole mount, or one film type. */
export type FmxSeries = "fmx" | "bw" | "pa";

export interface FmxSeriesMeta {
  id: FmxSeries;
  label: string;
  /** Long name, surfaced as the toggle's tooltip. */
  title: string;
  slots: readonly number[];
}

export const FMX_SERIES: readonly FmxSeriesMeta[] = [
  {
    id: "fmx",
    label: "FMX",
    title: "Full mouth series",
    slots: [...FMX_TOP_ROW, ...FMX_BITEWINGS, ...FMX_BOTTOM_ROW],
  },
  { id: "bw", label: "BW", title: "Bitewings", slots: FMX_BITEWINGS },
  {
    id: "pa",
    label: "PA",
    title: "Periapicals",
    slots: [...FMX_TOP_ROW, ...FMX_BOTTOM_ROW],
  },
];

export const DEFAULT_FMX_SERIES: FmxSeries = "fmx";

/** Non-FMX captures from the same visit, shown as a strip in the viewer footer. */
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
