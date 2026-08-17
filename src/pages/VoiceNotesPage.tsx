import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WorkflowHeader from "@/components/workflow/WorkflowHeader";
import { getPatientById } from "@/lib/patients";
import { cn } from "@/lib/utils";
import { useAiView } from "@/context/AiViewContext";

interface Template {
  key: string;
  label: string;
  favorite?: boolean;
}

const GROUPS: { title: string; items: Template[] }[] = [
  {
    title: "Favorites",
    items: [
      { key: "soap", label: "SOAP", favorite: true },
      { key: "crown-initial", label: "Crown - Initial Placement", favorite: true },
      { key: "composite", label: "Composite Restoration Procedure", favorite: true },
      { key: "crown-prep", label: "Crown Prep Procedure", favorite: true },
    ],
  },
  {
    title: "Exams & Consultations",
    items: [
      { key: "prophy-exam", label: "Prophylaxis & Exam" },
      { key: "simple-exam", label: "Simple Exam Procedure" },
      { key: "adult-prophy", label: "Adult Prophylaxis" },
      { key: "child-prophy", label: "Child Prophylaxis" },
    ],
  },
  {
    title: "Surgical",
    items: [
      { key: "implant", label: "Implant Placement" },
      { key: "post-op", label: "Post-Op Follow-Up" },
      { key: "lesion", label: "Lesion Removal" },
    ],
  },
];

function TemplateRow({
  item,
  checked,
  onToggle,
}: {
  item: Template;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center gap-3 h-10 px-1 cursor-pointer group">
      <span
        className={cn(
          "flex items-center justify-center size-4 rounded border transition-colors",
          checked ? "bg-primary border-primary text-white" : "border-input bg-card"
        )}
      >
        {checked && <i className="fa-solid fa-check text-[9px]" aria-hidden />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <span className="flex-1 text-sm text-foreground">{item.label}</span>
      <i
        className={cn(
          "text-sm",
          item.favorite
            ? "fa-solid fa-star text-highlight"
            : "fa-regular fa-star text-muted-foreground group-hover:text-foreground"
        )}
        aria-hidden
      />
    </label>
  );
}

export default function VoiceNotesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = getPatientById(id);
  const { privacyMode, setPrivacyMode } = useAiView();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  if (!patient) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
        <p className="text-lg font-medium text-foreground">Patient not found</p>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => navigate("/schedule")}
        >
          Back to Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <WorkflowHeader
        patient={patient}
        activeTab="voice"
        privacyMode={privacyMode}
        onPrivacyToggle={setPrivacyMode}
      />

      <div className="flex-1 min-h-0 flex">
        {/* Template picker */}
        <aside className="w-[380px] shrink-0 border-r border-border flex flex-col">
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              What kind of note would you like to create?
            </h2>
            <div className="relative">
              <i
                className="fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                aria-hidden
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates"
                className="h-9 w-full rounded-md border border-input bg-card pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
            {GROUPS.map((group) => {
              const items = group.items.filter((i) =>
                i.label.toLowerCase().includes(query.toLowerCase())
              );
              if (items.length === 0) return null;
              return (
                <div key={group.title}>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    {group.title}
                  </div>
                  <div className="flex flex-col divide-y divide-border/60">
                    {items.map((item) => (
                      <TemplateRow
                        key={item.key}
                        item={item}
                        checked={!!selected[item.key]}
                        onToggle={() =>
                          setSelected((p) => ({ ...p, [item.key]: !p[item.key] }))
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-border">
            <button
              type="button"
              className="w-full h-11 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-regular fa-wand-magic-sparkles" aria-hidden />
              End Recording &amp; Generate Note
            </button>
          </div>
        </aside>

        {/* Guide / recording */}
        <main className="flex-1 min-w-0 flex flex-col items-center justify-center gap-6 p-8">
          <span className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-error-muted text-error-muted-foreground text-xs font-medium">
            <span className="size-2 rounded-full bg-error animate-pulse" />
            Recording in Progress for {patient.name} · 02:14
          </span>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              Pick a template to start your note.
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Audio's recording. When you're done recording, pick a template and
              create your note.
            </p>
          </div>

          <ol className="w-full max-w-lg rounded-xl border border-border bg-card divide-y divide-border">
            {[
              {
                n: 1,
                title: "Select a Template",
                body: "Choose one or more from the left. They set the sections and fields for this note.",
              },
              {
                n: 2,
                title: "Generate the Note",
                body: 'Click "Generate Note" and we\'ll fill the template from your recording.',
              },
              {
                n: 3,
                title: "Review and Save",
                body: "Confirm the highlighted critical fields, then save the note to the patient's chart.",
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-3 p-4">
                <span className="flex items-center justify-center size-6 shrink-0 rounded-full bg-primary text-white text-xs font-semibold">
                  {step.n}
                </span>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {step.title}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </main>
      </div>
    </div>
  );
}
