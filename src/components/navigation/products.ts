import type { ComponentType } from "react";

export interface ProductNavItem {
  type?: "item";
  key: string;
  label: string;
  path: string;
  /** Font Awesome class (rendered as <i className="fa-regular fa-..."/>). */
  iconClass?: string;
  /** Custom inline-SVG icon component (for glyphs not in FA Pro). */
  IconComponent?: ComponentType<{ className?: string }>;
}

export interface ProductNavDivider {
  type: "divider";
  key: string;
}

export type ProductNavEntry = ProductNavItem | ProductNavDivider;

/**
 * Product suite navigation. First item is the schedule surface (relabeled from
 * ux-vision's Clinical Assist). Remaining items are placeholders.
 */
export const productNav: ProductNavEntry[] = [
  {
    key: "schedule",
    label: "Schedule",
    path: "/schedule",
    iconClass: "fa-regular fa-calendar",
  },
  {
    key: "voice-notes",
    label: "Voice Notes",
    path: "/voice-notes",
    iconClass: "fa-regular fa-microphone",
  },
  { type: "divider", key: "divider-1" },
  {
    key: "autoverify",
    label: "AutoVerify",
    path: "/autoverify",
    iconClass: "fa-regular fa-shield-check",
  },
  {
    key: "clean-claims",
    label: "Clean Claims",
    path: "/clean-claims",
    iconClass: "fa-regular fa-file-lines",
  },
  {
    key: "recall",
    label: "Recall",
    path: "/recall",
    iconClass: "fa-regular fa-comment-arrow-up-right",
  },
  {
    key: "referrals",
    label: "Referrals",
    path: "/referrals",
    iconClass: "fa-regular fa-share-nodes",
  },
  { type: "divider", key: "divider-2" },
  {
    key: "ambient-intel",
    label: "Ambient Intel",
    path: "/ambient-intel",
    iconClass: "fa-regular fa-signal-stream",
  },
  {
    key: "insights",
    label: "Insights",
    path: "/insights",
    iconClass: "fa-regular fa-chart-mixed",
  },
  {
    key: "engagement",
    label: "Engagement",
    path: "/engagement",
    iconClass: "fa-regular fa-gauge-high",
  },
];
