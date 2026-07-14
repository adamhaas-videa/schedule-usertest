// Per-provider avatar colors. Muted, low-saturation tones drawn from / around
// the brand ramps (deep teal + periwinkle) so providers stay distinguishable
// without loud colors. Each id maps deterministically to a palette entry.

export interface ProviderColor {
  bg: string;
  fg: string;
}

const PALETTE: ProviderColor[] = [
  { bg: "#DCE5F9", fg: "#2D4F98" }, // periwinkle
  { bg: "#D0E6EB", fg: "#124555" }, // deep teal
  { bg: "#DEE9DC", fg: "#3C6B45" }, // sage
  { bg: "#F1E6CC", fg: "#7C5712" }, // sand
  { bg: "#F1DEDB", fg: "#8A423C" }, // dusty rose
  { bg: "#E3E1EC", fg: "#4A4763" }, // slate lavender
  { bg: "#D6E8E5", fg: "#285B54" }, // muted cyan
  { bg: "#E9E1D6", fg: "#6B5333" }, // taupe
];

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getProviderColor(id: string | undefined): ProviderColor {
  if (!id) return PALETTE[0];
  return PALETTE[hashId(id) % PALETTE.length];
}
