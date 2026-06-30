import { useState } from "react";
import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";

interface VoiceNotesTabProps {
  patient: Patient;
  privacyMode: boolean;
}

interface Template {
  label: string;
  favorite?: boolean;
}

const TEMPLATE_GROUPS: { title: string; items: Template[] }[] = [
  {
    title: "Favorites",
    items: [
      { label: "SOAP", favorite: true },
      { label: "Crown - Initial Placement", favorite: true },
      { label: "Composite Restoration Procedure", favorite: true },
      { label: "Crown Prep Procedure", favorite: true },
    ],
  },
  {
    title: "Exams & Consultations",
    items: [
      { label: "Prophylaxis & Exam" },
      { label: "Simple Exam Procedure" },
      { label: "Adult Prophylaxis" },
      { label: "Child Prophylaxis" },
    ],
  },
  {
    title: "Surgical",
    items: [
      { label: "Implant Placement" },
      { label: "Post-Op Follow-Up" },
      { label: "Lesion Removal" },
    ],
  },
];

const STEPS = [
  {
    n: 1,
    title: "Select a Template",
    body: "Choose one or more from the left. They set the sections and fields for this note.",
  },
  {
    n: 2,
    title: "Generate the Note",
    body: "Click \u201cGenerate Note\u201d and we\u2019ll fill the template from your recording.",
  },
  {
    n: 3,
    title: "Review and Save",
    body: "Confirm the highlighted critical fields, then save the note to the patient\u2019s chart.",
  },
];

function TemplateRow({ item }: { item: Template }) {
  const [checked, setChecked] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setChecked((c) => !c)}
      className="w-full flex items-center gap-2.5 py-2 text-left group cursor-pointer"
    >
      <span
        className={cn(
          "flex items-center justify-center size-4 rounded border transition-colors shrink-0",
          checked
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border bg-card group-hover:border-primary/50"
        )}
      >
        {checked && <i className="fa-solid fa-check text-[9px]" aria-hidden />}
      </span>
      <span className="flex-1 text-sm text-foreground truncate">
        {item.label}
      </span>
      <i
        className={cn(
          "text-sm shrink-0",
          item.favorite
            ? "fa-solid fa-star text-amber-400"
            : "fa-regular fa-star text-muted-foreground/50"
        )}
        aria-hidden
      />
    </button>
  );
}

export default function VoiceNotesTab({
  patient,
  privacyMode,
}: VoiceNotesTabProps) {
  return (
    <div className="h-full w-full flex bg-background">
      {/* Left — template picker */}
      <div className="w-[380px] shrink-0 border-r border-border bg-card flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto p-4">
          <h2 className="text-sm font-semibold text-foreground">
            What kind of note would you like to create?
          </h2>

          <div className="mt-3 relative">
            <i
              className="fa-regular fa-magnifying-glass text-xs text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden
            />
            <input
              type="text"
              placeholder="Search templates"
              className="w-full h-9 pl-8 pr-3 rounded-md border border-border bg-background text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>

          <div className="mt-4 space-y-4">
            {TEMPLATE_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="text-xs font-semibold text-foreground mb-1">
                  {group.title}
                </div>
                <div className="divide-y divide-border/60">
                  {group.items.map((item) => (
                    <TemplateRow key={item.label} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 p-3 border-t border-border">
          <button
            type="button"
            className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors"
          >
            <i className="fa-regular fa-wand-magic-sparkles text-sm" aria-hidden />
            End Recording &amp; Generate Note
          </button>
        </div>
      </div>

      {/* Right — empty state */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-8 overflow-auto">
        <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-error-muted text-error-muted-foreground text-xs font-medium">
          <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
          Recording in Progress for{" "}
          <span className={cn(privacyMode && "blur-sm select-none")}>
            {patient.name}
          </span>{" "}
          - 02:14
        </div>

        <h3 className="mt-6 text-xl font-semibold text-foreground text-center">
          Pick a template to start your note.
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground text-center max-w-md">
          Audio&apos;s recording. When you&apos;re done recording, pick a
          template and create your note.
        </p>

        <div className="mt-6 w-full max-w-xl rounded-lg border border-border bg-card divide-y divide-border">
          {STEPS.map((step) => (
            <div key={step.n} className="flex items-start gap-3 p-4">
              <span className="flex items-center justify-center size-6 rounded-full bg-deep-teal-100 text-deep-teal-700 text-xs font-semibold shrink-0">
                {step.n}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {step.title}
                </div>
                <div className="text-[13px] text-muted-foreground mt-0.5">
                  {step.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
