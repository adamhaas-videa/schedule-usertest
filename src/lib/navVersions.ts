import {
  labeledNav,
  plgNav,
  productNav,
  workflowNav,
  isNavItem,
  type ProductNavEntry,
  type ProductNavItem,
} from "@/components/navigation/products";

export type NavVersion = 1 | 2 | 3 | 4;

export interface NavVersionMeta {
  id: NavVersion;
  label: string;
  title: string;
  description: string;
}

export const NAV_VERSIONS: NavVersionMeta[] = [
  {
    id: 1,
    label: "V1",
    title: "Persona",
    description:
      "Three unlabeled groups: clinical work, back-office efficiency, then revenue. Default.",
  },
  {
    id: 2,
    label: "V2",
    title: "Workflow",
    description:
      "Schedule is home for every user. Remaining items follow visit-to-revenue order.",
  },
  {
    id: 3,
    label: "V3",
    title: "PLG",
    description:
      "Workflow order with unpurchased items locked. Locked items open an upsell landing.",
  },
  {
    id: 4,
    label: "V4",
    title: "Labeled",
    description:
      "Same products as persona, with Clinical, Efficiency, and Revenue labels when expanded.",
  },
];

export const DEFAULT_NAV_VERSION: NavVersion = 1;

export type NavFooterMode = "full" | "minimal";

export interface NavFooterModeMeta {
  id: NavFooterMode;
  label: string;
  title: string;
  description: string;
}

export const NAV_FOOTER_MODES: NavFooterModeMeta[] = [
  {
    id: "full",
    label: "Full",
    title: "Full",
    description:
      "Help, Learning Center, and Settings stay as their own rows above the practice switcher.",
  },
  {
    id: "minimal",
    label: "Min",
    title: "Minimal",
    description:
      "Those three items move into the practice menu. Only the avatar remains in the sidebar footer.",
  },
];

export const DEFAULT_NAV_FOOTER_MODE: NavFooterMode = "full";

const NAV_BY_VERSION: Record<NavVersion, ProductNavEntry[]> = {
  1: productNav,
  2: workflowNav,
  3: plgNav,
  4: labeledNav,
};

export function getNavEntries(version: NavVersion): ProductNavEntry[] {
  return NAV_BY_VERSION[version];
}

export function findNavItemByPath(
  version: NavVersion,
  path: string
): ProductNavItem | undefined {
  return getNavEntries(version).find(
    (entry): entry is ProductNavItem => isNavItem(entry) && entry.path === path
  );
}
