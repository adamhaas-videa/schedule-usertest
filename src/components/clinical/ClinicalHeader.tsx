import { ChevronDownIcon } from "lucide-react";
import type { Patient } from "@/data/mockPatients";
import { computeAge } from "@/data/mockPatients";
import type { ClinicalTab } from "@/App";
import PrivacyToggle from "@/components/PrivacyToggle";
import { cn } from "@/lib/utils";

interface ClinicalHeaderProps {
  patient: Patient;
  tab: ClinicalTab;
  onTabChange: (tab: ClinicalTab) => void;
  onBack: () => void;
  privacyMode: boolean;
  onPrivacyToggle: (enabled: boolean) => void;
  appointmentLabel?: string;
}

const TABS: { id: ClinicalTab; label: string }[] = [
  { id: "xray", label: "X-ray Images" },
  { id: "voice", label: "Voice Notes" },
  { id: "perio", label: "Perio Chart" },
];

function IconButton({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <i className={cn(icon, "text-base")} aria-hidden />
    </button>
  );
}

export default function ClinicalHeader({
  patient,
  tab,
  onTabChange,
  onBack,
  privacyMode,
  onPrivacyToggle,
  appointmentLabel = "May 14, 2026",
}: ClinicalHeaderProps) {
  const age = computeAge(patient.dob);

  return (
    <div className="shrink-0 bg-card">
      {/* Row 1 — patient identity + global controls */}
      <div className="h-14 flex items-center gap-4 px-4 border-b border-border">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
        >
          <i className="fa-regular fa-chevron-left text-xs" aria-hidden />
          Patient List
        </button>

        <div className="flex items-baseline gap-2 min-w-0">
          <span
            className={cn(
              "text-base font-semibold text-foreground truncate",
              privacyMode && "blur-sm select-none"
            )}
          >
            {patient.name}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Age {age} | DOB: {patient.dob}
          </span>
        </div>

        <div className="shrink-0">
          <PrivacyToggle enabled={privacyMode} onToggle={onPrivacyToggle} />
        </div>

        <div className="flex-1 min-w-0" />

        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary-hover transition-colors shrink-0"
        >
          <i className="fa-regular fa-microphone text-base" aria-hidden />
          Start Recording
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <IconButton icon="fa-regular fa-moon" label="Toggle theme" />
          <IconButton icon="fa-regular fa-book-open" label="Documentation" />
          <IconButton icon="fa-regular fa-circle-question" label="Help" />
        </div>

        <div
          className="w-9 h-9 rounded-full bg-periwinkle flex items-center justify-center overflow-hidden shrink-0"
          aria-label="Account"
        >
          <span className="text-sm font-semibold text-deep-teal-800 leading-none">
            AH
          </span>
        </div>
      </div>

      {/* Row 2 — clinical tabs + appointment selector */}
      <div className="h-12 flex items-center gap-3 px-4 border-b border-border">
        <div className="flex items-center gap-1">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                aria-pressed={active}
                className={cn(
                  "h-8 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  active
                    ? "bg-accent-muted text-accent-foreground border border-accent-muted-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0" />

        <button
          type="button"
          className="inline-flex items-center gap-2 h-8 px-2.5 rounded-md border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
        >
          <span className="text-muted-foreground">Appt:</span>
          <span className="font-medium">{appointmentLabel}</span>
          <ChevronDownIcon
            className="size-4 opacity-50 shrink-0 pointer-events-none"
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
