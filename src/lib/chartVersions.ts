// Demo-only concept switcher for the patient chart surface. Lets us showcase
// three product-tier placeholders on the same mock patient during a video.
export type ChartVersion = 1 | 2 | 3;

export interface ChartVersionMeta {
  id: ChartVersion;
  label: string;
  title: string;
  description: string;
}

export const CHART_VERSIONS: ChartVersionMeta[] = [
  {
    id: 1,
    label: "V1",
    title: "Core",
    description:
      "Core charting: odontogram, existing conditions, and planned treatment. Placeholder content.",
  },
  {
    id: 2,
    label: "V2",
    title: "Essentials with DD",
    description:
      "Essentials plus differential diagnosis support. Placeholder content.",
  },
  {
    id: 3,
    label: "V3",
    title: "Full suite",
    description:
      "Full charting suite: perio, restorative, surgical, and AI findings in one surface. Placeholder content.",
  },
];

export const DEFAULT_CHART_VERSION: ChartVersion = 1;
