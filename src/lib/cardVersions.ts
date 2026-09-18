// Demo-only concept switcher for the schedule patient card. Lets us showcase
// several iterative interaction models on the same mock data during a video.
// This is a prototype affordance, not a product setting.
export type CardVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
    title: "Summary actions",
    description:
      "Treatment header, two-line summary, condition chips. Card opens the summary slideout. Review goes to Images; Voice notes goes to Clinical Notes. Actions stay on for the in-chair patient and reveal on hover everywhere else.",
  },
  {
    id: 2,
    label: "V2",
    title: "Always-on actions",
    description:
      "Review is the primary button, with Voice and Perio as icons. Always visible on the in-chair patient; every other card reveals them on hover.",
  },
  {
    id: 3,
    label: "V3",
    title: "Actions on hover",
    description:
      "Action buttons stay hidden until you hover a card. The patient name still opens the summary slideout.",
  },
  {
    id: 4,
    label: "V4",
    title: "Whole card \u2192 Images",
    description:
      "No buttons on the card. Clicking anywhere opens that patient's Images tab.",
  },
  {
    id: 5,
    label: "V5",
    title: "Card \u2192 Images, name \u2192 Summary",
    description:
      "No buttons on the card. Clicking the card opens the Images tab; clicking the name opens the summary slideout.",
  },
  {
    id: 6,
    label: "V6",
    title: "Enhanced with Daily Dashboard",
    description:
      "V1 plus the Daily Dashboard odontogram inline: on a 60-minute or longer appointment it fills the space under the insurance row, scaled to the column and still hoverable per tooth. Dropped on 30-minute cards, which have no room for it.",
  },
  {
    id: 7,
    label: "V7",
    title: "Enhanced with Daily Dashboard \u2014 flyout",
    description:
      "V1 plus a teeth icon beside the perio chip. Hovering it floats the odontogram out beside the column \u2014 AI opportunity counts over the full chart \u2014 so every card carries it, 30-minute ones included.",
  },
];

export const DEFAULT_CARD_VERSION: CardVersion = 1;

export type CardColorMode = "provider" | "appointment";

export interface CardColorModeMeta {
  id: CardColorMode;
  label: string;
  title: string;
  description: string;
}

export const CARD_COLOR_MODES: CardColorModeMeta[] = [
  {
    id: "appointment",
    label: "Tx",
    title: "Appointment colors",
    description:
      "Header fill and card outline follow the procedure family: restorative (composite \u2192 onlay \u2192 crown \u2192 endo \u2192 extraction), hygiene (prophy / SRP), and prosthetic (implants, dentures, aligners). Avatar stays on the provider.",
  },
  {
    id: "provider",
    label: "P",
    title: "Provider colors",
    description:
      "Header fill and card outline use the provider avatar palette. Same dentist, same color, regardless of procedure.",
  },
];

export const DEFAULT_CARD_COLOR_MODE: CardColorMode = "appointment";
