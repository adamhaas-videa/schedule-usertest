export interface UpsellStat {
  value: string;
  label: string;
}

export interface UpsellStep {
  title: string;
  body: string;
}

export interface UpsellCopy {
  key: string;
  product: string;
  headline: string;
  lede: string;
  bullets: string[];
  stats: UpsellStat[];
  howItWorksTitle: string;
  howItWorksLede: string;
  steps: UpsellStep[];
  demoTitle: string;
  demoLede: string;
  meetingName: string;
  meetingBlurb: string;
}

const DEFAULT_UPSELL: UpsellCopy = {
  key: "default",
  product: "Videa",
  headline: "Add this to the day you already run",
  lede: "See how this product sits on the same schedule your team already uses.",
  bullets: [
    "Lives in the same sidebar as Schedule",
    "No second login, no separate workflow",
    "Talk to us to turn it on for this practice",
  ],
  stats: [],
  howItWorksTitle: "Built to layer over the visit, not replace it",
  howItWorksLede:
    "Videa reads from and writes to the practice’s existing system of record.",
  steps: [
    {
      title: "It sits on the schedule you already use",
      body: "The product is a guest on the practice’s data — not a second system of record.",
    },
    {
      title: "Work shows up before it is asked for",
      body: "Findings, checks, and follow-ups surface ahead of the hunt, on the same day board.",
    },
    {
      title: "The visit still owns the record",
      body: "Nothing here replaces Dentrix, Open Dental, or Curve. We write back to it.",
    },
    {
      title: "Turn it on when the practice is ready",
      body: "A short walkthrough on your own workflow is enough to see it land.",
    },
  ],
  demoTitle: "See it on your own schedule",
  demoLede: "Pick a time. We’ll walk the product on a real day’s board.",
  meetingName: "Videa product demo",
  meetingBlurb:
    "A 30-minute walkthrough on your own workflow. We’ll show the product on a live board and how it writes back to your PMS.",
};

export const UPSELL_BY_KEY: Record<string, UpsellCopy> = {
  autoverify: {
    key: "autoverify",
    product: "AutoVerify",
    headline: "Eligibility checks you don’t have to double-check",
    lede: "The fastest, easiest way to verify coverage before the visit.",
    bullets: [
      "Checks run when the appointment is booked",
      "Code-level benefits, not just eligible or not",
      "Direct integration with 95% of payors",
    ],
    stats: [
      { value: "40%", label: "Less time on manual eligibility checks" },
      { value: "50%", label: "Fewer claim denials" },
    ],
    howItWorksTitle: "Direct integration with the national payor network",
    howItWorksLede:
      "Verification starts when the appointment is booked, so the front desk sees who is covered before the patient sits down.",
    steps: [
      {
        title: "The appointment is booked",
        body: "The check queues the moment the visit lands on the schedule — no separate batch to run.",
      },
      {
        title: "Coverage is read at the code level",
        body: "Benefits, remaining maximum, and deductible come back as numbers, not a yes/no flag.",
      },
      {
        title: "Exceptions surface on the day board",
        body: "Confirm details, no coverage, and contact-payer cases sit next to the appointment, not in a side list.",
      },
      {
        title: "The visit starts with the answer already there",
        body: "Front desk knows who to call and who is cleared, before chair time starts.",
      },
    ],
    demoTitle: "See eligibility land on the schedule",
    demoLede:
      "Pick a time that works. We’ll run AutoVerify against a real day’s board and show code-level benefits before the first patient sits.",
    meetingName: "AutoVerify demo",
    meetingBlurb:
      "A 30-minute walkthrough on your own schedule. We’ll verify a day’s appointments, open a benefits panel, and show what the front desk sees before chair time.",
  },
  "clean-claims": {
    key: "clean-claims",
    product: "Clean Claims",
    headline: "Claims that leave the office ready to pay",
    lede: "Catch missing attachments, coding gaps, and eligibility holds before the claim goes out.",
    bullets: [
      "Flags issues while the visit is still on the board",
      "Attachments and narratives sit with the claim, not in a side pile",
      "The same day board the front desk already runs",
    ],
    stats: [],
    howItWorksTitle: "The claim is reviewed before it leaves the building",
    howItWorksLede:
      "Clean Claims reads the visit you just finished and tells you what would bounce — while the chart is still open.",
    steps: [
      {
        title: "The visit closes",
        body: "Coding, attachments, and eligibility are read together, not in three later passes.",
      },
      {
        title: "Gaps surface on the claim itself",
        body: "Missing x-rays, narratives, and eligibility holds appear as work on that claim, not a report.",
      },
      {
        title: "Fix it while the patient is still in the book",
        body: "The same people who ran the day can clear the hold before the claim is submitted.",
      },
      {
        title: "Submit from the board you already use",
        body: "Nothing here replaces the PMS claim workflow. It makes that workflow leave cleaner.",
      },
    ],
    demoTitle: "See a claim cleaned on a live visit",
    demoLede:
      "Pick a time. We’ll take a finished appointment and show what would have bounced, and what we attach before submit.",
    meetingName: "Clean Claims demo",
    meetingBlurb:
      "A 30-minute walkthrough on a real visit. We’ll open a claim, show the holds, and walk the attachments through to submit.",
  },
  referrals: {
    key: "referrals",
    product: "Referrals",
    headline: "Referrals that don’t die in the inbox",
    lede: "Specialist handoffs, tracked from the chair to the appointment that comes back.",
    bullets: [
      "Started from the visit, not a later phone pile",
      "Status lives on the patient, visible on the day board",
      "The referring office sees what came back",
    ],
    stats: [],
    howItWorksTitle: "The handoff is part of the visit, not after-hours catch-up",
    howItWorksLede:
      "Referrals writes the specialist path while the finding is still on the screen, then tracks whether the patient actually went.",
    steps: [
      {
        title: "The finding is on the chart",
        body: "A referral starts from the same visit the clinician is already in — not a later call list.",
      },
      {
        title: "The specialist is chosen and sent",
        body: "Packet, notes, and imaging go with the referral. The front desk is not rebuilding it from memory.",
      },
      {
        title: "Status comes back to the board",
        body: "Scheduled, completed, or stalled — the originating office sees it on the patient, not in email.",
      },
      {
        title: "The return visit is on your schedule",
        body: "When the specialist is done, the follow-up is a chair on your board, not a lost thread.",
      },
    ],
    demoTitle: "See a referral leave the chair and come back",
    demoLede:
      "Pick a time. We’ll start a specialist handoff from a live visit and show where status lands on the originating schedule.",
    meetingName: "Referrals demo",
    meetingBlurb:
      "A 30-minute walkthrough from finding to specialist to return visit, on a board that looks like yours.",
  },
  recall: {
    key: "recall",
    product: "Recall",
    headline: "The overdue book, worked from the same board",
    lede: "Who is due, who was reached, and which chair they should land in — without a separate recall list.",
    bullets: [
      "Due patients sit next to today’s schedule, not in a side export",
      "Outreach status is on the patient",
      "Confirmed visits drop onto the same operatory grid",
    ],
    stats: [],
    howItWorksTitle: "Recall is a chair-time problem, not a mailing problem",
    howItWorksLede:
      "The overdue book is worked against open operatory time, so outreach has a chair waiting when they say yes.",
    steps: [
      {
        title: "Due patients are already on the list",
        body: "Recall reads the same chart the practice already keeps. Nobody re-keys a due list.",
      },
      {
        title: "Outreach is tracked on the patient",
        body: "Called, texted, confirmed, declined — visible to front desk without opening a campaign tool.",
      },
      {
        title: "Open chairs are the constraint",
        body: "Confirmed visits land on the operatory grid you already run, in the gaps you already have.",
      },
      {
        title: "The day absorbs them",
        body: "Recall is not a second calendar. It fills the one you have.",
      },
    ],
    demoTitle: "See overdue patients fill open chairs",
    demoLede:
      "Pick a time. We’ll take a due list and show it land on open operatory time, with outreach status on the patient.",
    meetingName: "Recall demo",
    meetingBlurb:
      "A 30-minute walkthrough of the overdue book against a live day’s open chairs.",
  },
};

export function getUpsellCopy(key: string): UpsellCopy {
  return UPSELL_BY_KEY[key] ?? { ...DEFAULT_UPSELL, key, product: key };
}
