// Per-provider avatar colors. Muted, low-saturation tones drawn from / around
// the brand ramps (deep teal + periwinkle) so providers stay distinguishable
// without loud colors. Each id maps deterministically to a palette entry.

export interface ProviderColor {
  bg: string;
  fg: string;
  border: string;
}

const PALETTE: ProviderColor[] = [
  { bg: "#DCE5F9", fg: "#2D4F98", border: "#BDCEF4" }, // periwinkle
  { bg: "#D0E6EB", fg: "#124555", border: "#A3CCD5" }, // deep teal
  { bg: "#DEE9DC", fg: "#3C6B45", border: "#C0D4BC" }, // sage
  { bg: "#F1E6CC", fg: "#7C5712", border: "#E4D0A8" }, // sand
  { bg: "#F1DEDB", fg: "#8A423C", border: "#E4C5C0" }, // dusty rose
  { bg: "#E3E1EC", fg: "#4A4763", border: "#C9C6D6" }, // slate lavender
  { bg: "#D6E8E5", fg: "#285B54", border: "#B3D4CF" }, // muted cyan
  { bg: "#E9E1D6", fg: "#6B5333", border: "#D4C9B8" }, // taupe
];

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Hash parks `at` on sand and `lc` on taupe – two warm neutrals that read as
// the same 24px chip. Pin Lina Castillo to the unused dusty rose slot.
const OVERRIDES: Record<string, number> = {
  lc: 4,
};

export function getProviderColor(id: string | undefined): ProviderColor {
  if (!id) return PALETTE[0];
  const pinned = OVERRIDES[id];
  if (pinned !== undefined) return PALETTE[pinned];
  return PALETTE[hashId(id) % PALETTE.length];
}
