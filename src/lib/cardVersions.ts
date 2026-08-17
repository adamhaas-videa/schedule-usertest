// Demo-only concept switcher for the schedule patient card. Lets us showcase
// several iterative interaction models on the same mock data during a video.
// This is a prototype affordance, not a product setting.
export type CardVersion = 1 | 2 | 3 | 4;

export interface CardVersionMeta {
  id: CardVersion;
  label: string;
  title: string;
  description: string;
}

export const CARD_VERSIONS: CardVersionMeta[] = [
  {
    id: 1,
    label: "V1",
    title: "Always-on actions",
    description:
      "Review / Voice / Perio. Review is the primary CTA (right); Voice and Perio are tertiary icon buttons. Always visible only on the in-chair patient; every other card reveals them on hover. Name opens the summary drawer.",
  },
  {
    id: 2,
    label: "V2",
    title: "Actions on hover",
    description:
      "The primary action buttons are hidden and only appear when you hover a patient card. Name still opens the summary drawer.",
  },
  {
    id: 3,
    label: "V3",
    title: "Whole card → Images",
    description:
      "No individual buttons. Clicking anywhere on the card navigates to the Images tab in the patient workflow.",
  },
  {
    id: 4,
    label: "V4",
    title: "Card → Images, name → Summary",
    description:
      "No individual buttons. Clicking the card opens the Images tab; clicking the patient name opens the patient summary drawer.",
  },
];

export const DEFAULT_CARD_VERSION: CardVersion = 1;
