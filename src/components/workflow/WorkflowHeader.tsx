import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import videaBrandmark from "@/assets/icons/videa-brandmark.svg";
import PrivacyToggle from "@/components/PrivacyToggle";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { computeAge } from "@/data/mockPatients";
import type { Patient } from "@/data/mockPatients";
import { CLINICAL_TAB_NAV, type ClinicalTab } from "@/types/clinical";
import { cn } from "@/lib/utils";

interface WorkflowHeaderProps {
  patient: Patient;
  activeTab: ClinicalTab;
  /** Privacy mode. When on, the patient name and demographics are blurred. */
  privacyMode?: boolean;
  onPrivacyToggle?: (on: boolean) => void;
  /** When false, the L2 study bar is omitted so a sibling right rail can
   *  extend up to L1. Imaging surfaces render `WorkflowStudyBar` themselves. */
  showStudyBar?: boolean;
}

const TABS = CLINICAL_TAB_NAV;

const STUDY_LABEL: Record<ClinicalTab, string> = {
  xray: "Images from",
  voice: "Clinical notes from",
  perio: "Chart from",
  chart: "Summary from",
};

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function formatShortDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function formatRelative(date: Date, now = new Date()): string {
  const months =
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth());
  if (months <= 0) {
    const days = Math.round((now.getTime() - date.getTime()) / 86_400_000);
    if (days <= 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 14) return `${days} days ago`;
    const weeks = Math.round(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.round(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function WorkflowStudyBar({
  patient,
  activeTab,
}: {
  patient: Patient;
  activeTab: ClinicalTab;
}) {
  const [studyDate, setStudyDate] = useState(() =>
    parseISODate(patient.appointmentDate)
  );
  const relative = useMemo(() => formatRelative(studyDate), [studyDate]);
  const dark = activeTab === "xray";

  return (
    <div
      className={cn(
        "h-11 shrink-0 flex items-center px-4",
        dark
          ? "bg-zinc-800/50 backdrop-blur-[14px] border-t border-white/10 shadow-[0px_2px_14px_0px_rgba(0,0,0,0.34)]"
          : "bg-card border-b border-border"
      )}
    >
      <div className="flex items-center gap-2.5">
        <i
          className={cn(
            "fa-regular fa-calendar-days text-base",
            dark ? "text-zinc-400" : "text-muted-foreground"
          )}
          aria-hidden
        />
        <Popover>
          <PopoverTrigger
            className={cn(
              "flex items-center gap-1.5 text-sm cursor-pointer hover:opacity-80 outline-none",
              dark ? "text-zinc-50" : "text-foreground"
            )}
          >
            <span>
              {STUDY_LABEL[activeTab]} {formatShortDate(studyDate)}
            </span>
            <i className="fa-regular fa-angle-down text-base" aria-hidden />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={studyDate}
              onSelect={(date) => {
                if (date) setStudyDate(date);
              }}
            />
          </PopoverContent>
        </Popover>
        <span
          className={cn(
            "text-sm",
            dark ? "text-zinc-400" : "text-muted-foreground"
          )}
        >
          ·
        </span>
        <span
          className={cn(
            "text-sm",
            dark ? "text-zinc-400" : "text-muted-foreground"
          )}
        >
          {relative}
        </span>
      </div>
    </div>
  );
}

export default function WorkflowHeader({
  patient,
  activeTab,
  privacyMode = false,
  onPrivacyToggle,
  showStudyBar = true,
}: WorkflowHeaderProps) {
  const navigate = useNavigate();
  const age = computeAge(patient.dob);

  return (
    <div className="shrink-0 flex flex-col">
      <header className="h-[51px] shrink-0 bg-[#fafaf9] border-b border-border flex items-center justify-between pr-4">
        <div className="flex flex-1 items-center gap-4 min-w-0">
          <div className="w-[72px] shrink-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => navigate("/schedule")}
              aria-label="Videa — back to home"
              title="Home"
              className="flex h-full items-center justify-center rounded-md py-2.5 cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={videaBrandmark}
                alt="Videa"
                className="h-8 w-auto shrink-0"
              />
            </button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/schedule")}
            aria-label="Back to Schedule"
            title="Back"
            className="cursor-pointer"
          >
            <i className="fa-regular fa-angle-left text-base" aria-hidden />
          </Button>

          <div className="flex items-center gap-4 min-w-0">
            <span
              className={cn(
                "text-lg font-medium text-secondary-foreground whitespace-nowrap transition-[filter]",
                privacyMode && "blur-sm select-none"
              )}
            >
              {patient.name}
            </span>
            <span
              className={cn(
                "text-sm text-muted-foreground whitespace-nowrap leading-none transition-[filter]",
                privacyMode && "blur-sm select-none"
              )}
            >
              Age {age} • DOB {patient.dob}
            </span>
          </div>

          <PrivacyToggle
            enabled={privacyMode}
            onToggle={(on) => onPrivacyToggle?.(on)}
          />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div
            role="tablist"
            aria-label="Patient workflow"
            className="flex h-8 items-center overflow-hidden rounded-xl bg-muted p-1"
          >
            {TABS.map((t) => {
              const active = t.id === activeTab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => navigate(`/patient/${patient.id}/${t.path}`)}
                  className={cn(
                    "h-7 px-2.5 rounded-[9px] text-[15px] font-medium whitespace-nowrap transition-colors cursor-pointer",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <Button variant="secondary" className="cursor-pointer">
            <i className="fa-regular fa-microphone text-base" aria-hidden />
            Start Recording
          </Button>
        </div>
      </header>

      {showStudyBar && (
        <WorkflowStudyBar patient={patient} activeTab={activeTab} />
      )}
    </div>
  );
}
