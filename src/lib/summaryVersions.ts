// Demo-only concept switcher for the patient summary slideout. Each version is
// a feature tier we can walk through on a video: the same mock patient, more of
// the chart surfaced as you step up. This is a prototype affordance, not a
// product setting.
export type SummaryVersion = 1 | 2 | 3;

// Which sections the slideout renders. Every version shows the identity block,
// health/allergy alerts, today's treatment (provider + operatory) and the last
// appointment — the tiers differ in what is layered on top.
export interface SummarySections {
  shortcuts: boolean;
  insurance: boolean;
  voiceNoteSummary: boolean;
  aiOpportunities: boolean;
  recommendations: boolean;
  odontogram: boolean;
  tasks: boolean;
  unscheduledTx: boolean;
}

export interface SummaryVersionMeta {
  id: SummaryVersion;
  label: string;
  title: string;
  description: string;
  sections: SummarySections;
}

const ESSENTIALS: SummarySections = {
  shortcuts: false,
  insurance: false,
  voiceNoteSummary: false,
  aiOpportunities: false,
  recommendations: false,
  odontogram: false,
  tasks: false,
  unscheduledTx: false,
};

const CORE: SummarySections = {
  shortcuts: true,
  insurance: false,
  voiceNoteSummary: true,
  aiOpportunities: true,
  recommendations: true,
  odontogram: true,
  tasks: true,
  unscheduledTx: true,
};

const FULL: SummarySections = { ...CORE, insurance: true };

export const SUMMARY_VERSIONS: SummaryVersionMeta[] = [
  {
    id: 1,
    label: "V1",
    title: "Essentials",
    description: "Basic experience of the patient summary chart.",
    sections: ESSENTIALS,
  },
  {
    id: 2,
    label: "V2",
    title: "Core with Daily Dashboard",
    description: "Core chart experience with daily dashboard details.",
    sections: CORE,
  },
  {
    id: 3,
    label: "V3",
    title: "Full suite",
    description:
      "Everything in Core plus eligibility and benefits, so the chart covers both the clinical and the financial picture in one pass.",
    sections: FULL,
  },
];

export const DEFAULT_SUMMARY_VERSION: SummaryVersion = 3;

export function getSummaryVersion(version: SummaryVersion): SummaryVersionMeta {
  return SUMMARY_VERSIONS.find((v) => v.id === version) ?? SUMMARY_VERSIONS[0];
}
