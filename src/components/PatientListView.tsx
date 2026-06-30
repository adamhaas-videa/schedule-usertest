import { memo, useMemo } from "react";
import type {
  ConditionAlert,
  ConditionAlertSeverity,
  Patient,
} from "@/data/mockPatients";
import { computeAge, timeToMinutes } from "@/data/mockPatients";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ClinicalTab } from "@/App";
import { cn } from "@/lib/utils";

interface PatientListViewProps {
  patients: Patient[];
  privacyMode: boolean;
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
}

// Figma columns (in order): Time | Patient | Clinical Summary | Buttons
// Header has no label for the Buttons column. Min row height matches Figma 96px.
const GRID_TEMPLATE =
  "grid-cols-[96px_minmax(220px,260px)_minmax(0,1fr)_auto]";

// Pill palette per Figma node 3093:11790:
//   Stage 3 Perio → bg #fae3e2 / text #c63e38 / red dot
//   Stage 2 Perio → bg #faefd8 / text #c08b1e / amber dot
//   Stage 1 Perio → periwinkle accent / periwinkle dot
//   Healthy Gums  → bg #e5ecfb / text #0e3644 / NO dot
const ALERT_VARIANT: Record<
  ConditionAlertSeverity,
  { wrap: string; dot: string | null }
> = {
  success: {
    wrap: "bg-info-muted text-info-muted-foreground",
    dot: null,
  },
  accent: {
    wrap: "bg-accent-muted text-accent-muted-foreground",
    dot: "bg-accent-muted-foreground",
  },
  warning: {
    wrap: "bg-warning-muted text-warning-muted-foreground",
    dot: "bg-warning",
  },
  error: {
    wrap: "bg-error-muted text-error-muted-foreground",
    dot: "bg-destructive",
  },
};

function PerioIcon({ className }: { className?: string }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      className={cn("shrink-0", className)}
    >
      <path
        d="M13.2009 11.4583V17.6705C13.2009 18.0588 12.8723 18.3873 12.4841 18.3873C12.0958 18.3873 11.7673 18.0588 11.7673 17.6705V11.4583C11.7673 11.07 12.0958 10.7415 12.4841 10.7415C12.8723 10.7415 13.2009 11.07 13.2009 11.4583ZM15.5902 12.414V16.7148C15.5902 17.1031 15.2617 17.4316 14.8734 17.4316C14.4851 17.4316 14.1566 17.1031 14.1566 16.7148V12.414C14.1566 12.0257 14.4851 11.6972 14.8734 11.6972C15.2617 11.6972 15.5902 12.0257 15.5902 12.414ZM10.8115 12.8919V16.2369C10.8115 16.6252 10.483 16.9537 10.0947 16.9537C9.70646 16.9537 9.37793 16.6252 9.37793 16.2369V12.8919C9.37793 12.5036 9.70646 12.1751 10.0947 12.1751C10.483 12.1751 10.8115 12.5036 10.8115 12.8919ZM17.9795 13.8476V15.2812C17.9795 15.6695 17.651 15.998 17.2627 15.998C16.8745 15.998 16.5459 15.6695 16.5459 15.2812V13.8476C16.5459 13.4593 16.8745 13.1308 17.2627 13.1308C17.651 13.1308 17.9795 13.4593 17.9795 13.8476Z"
        fill="currentColor"
      />
      <path
        d="M11.7666 3C13.7675 3.00011 15.3797 4.61241 15.3799 6.61328V8.79395C15.3799 9.25833 15.3098 9.73566 15.1641 10.1904C14.8589 10.3374 14.2119 10.4671 13.8018 9.70801C13.8944 9.41403 13.9463 9.10429 13.9463 8.79395V6.61328C13.9461 5.41881 12.9611 4.4337 11.7666 4.43359C11.4383 4.43359 11.0798 4.52269 10.7812 4.67188L9.01855 5.56836C8.80952 5.6579 8.57035 5.65794 8.36133 5.56836L6.59961 4.67188C6.30106 4.5226 5.97249 4.43366 5.61426 4.43359C4.41968 4.43359 3.43375 5.41874 3.43359 6.61328V8.79395C3.43361 9.27177 3.55267 9.74987 3.76172 10.168L4.47852 11.6016C4.7174 12.1092 4.86701 12.6465 4.92676 13.2139L5.22559 16.3799C5.25545 16.6487 5.49487 16.8574 5.76367 16.8574C6.00245 16.8572 6.24066 16.6782 6.27051 16.4395L7.13672 12.4072C7.15117 12.335 7.17175 12.2652 7.19531 12.1973C7.54125 12.0297 8.34446 12.1311 8.53809 12.6855L7.6748 16.7383C7.49563 17.6341 6.68934 18.2908 5.76367 18.291C4.7482 18.291 3.91187 17.5145 3.82227 16.499L3.49316 13.334C3.4633 12.9457 3.37354 12.5869 3.19434 12.2285L2.47754 10.8252C2.14902 10.198 2.00002 9.48084 2 8.79395V6.61328C2.00015 4.61234 3.61328 3 5.61426 3C6.18151 3.00005 6.719 3.11903 7.22656 3.3877L8.69043 4.10449L10.1533 3.3877C10.6611 3.1189 11.1991 3 11.7666 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function AlertChip({ alert }: { alert: ConditionAlert }) {
  const variant = ALERT_VARIANT[alert.severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-[22px] px-2 rounded-lg whitespace-nowrap shrink-0",
        variant.wrap
      )}
    >
      {variant.dot && (
        <span className={cn("size-2 rounded-full shrink-0", variant.dot)} />
      )}
      <span className="text-[12px] font-semibold leading-none">
        {alert.label}
      </span>
    </span>
  );
}

// "10:30 AM" → "10:30am" to match Figma rendering
function formatTimeShort(time: string): string {
  return time.replace(" ", "").toLowerCase();
}

// Top-row clinical summary text in the Figma is short clinical findings
// (e.g. "5+ mm pockets, #14 #15 #19. Bone loss on BWX."). The closest existing
// model field is `aiFindings` (e.g. ["Bone loss detected", "Calculus buildup"])
// which is the model's clinical-findings array.
function clinicalSummaryText(patient: Patient): string {
  if (patient.aiFindings && patient.aiFindings.length > 0) {
    return patient.aiFindings.join(". ") + ".";
  }
  return "";
}

interface RowActionsProps {
  onAction: (tab: ClinicalTab) => void;
}

function RowActions({ onAction }: RowActionsProps) {
  const base =
    "flex items-center justify-center size-10 rounded-md transition-colors";
  const tone = "bg-primary text-primary-foreground hover:bg-primary-hover";
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => onAction("xray")}
        aria-label="Images"
        title="Images"
        className={cn(base, tone)}
      >
        <i className="fa-regular fa-images w-5 h-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onAction("voice")}
        aria-label="Voice note"
        title="Voice note"
        className={cn(base, tone)}
      >
        <i className="fa-regular fa-microphone w-5 h-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onAction("perio")}
        aria-label="Perio"
        title="Perio"
        className={cn(base, tone)}
      >
        <PerioIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

interface PatientRowProps {
  patient: Patient;
  privacyMode: boolean;
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
}

const PatientRow = memo(function PatientRow({
  patient,
  privacyMode,
  onOpenClinical,
}: PatientRowProps) {
  const age = computeAge(patient.dob);
  const summary = clinicalSummaryText(patient);
  const nameClass = privacyMode ? "blur-sm select-none" : "";

  return (
    <div
      role="row"
      className={cn(
        "grid items-center gap-3 px-4 py-3 border-b border-border bg-card transition-colors min-h-[96px]",
        "[content-visibility:auto] [contain-intrinsic-size:auto_96px]",
        GRID_TEMPLATE
      )}
    >
      {/* Time + provider badge + operatory */}
      <div role="cell" className="flex flex-col gap-1.5 min-w-0">
        <span className="text-sm text-foreground tabular-nums">
          {formatTimeShort(patient.appointmentTime)}
        </span>
        {patient.provider && (
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar
              size="sm"
              className="size-[22px] bg-periwinkle-100 after:border-transparent shrink-0"
            >
              <AvatarFallback className="bg-periwinkle-100 text-deep-teal-600 text-[10px] font-semibold">
                {patient.provider.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
              Op {patient.operatory}
            </span>
          </div>
        )}
      </div>

      {/* Patient */}
      <div role="cell" className="flex flex-col gap-2 min-w-0">
        <span
          className={cn(
            "text-base font-semibold text-foreground leading-none truncate",
            nameClass
          )}
        >
          {patient.name}
        </span>
        <span className="text-xs text-muted-foreground leading-none truncate">
          Age {age} | DOB: {patient.dob}
        </span>
      </div>

      {/* Clinical Summary */}
      <div role="cell" className="flex min-w-0">
        <div className="flex flex-col items-start gap-1.5 min-w-0">
          {patient.conditionAlert && <AlertChip alert={patient.conditionAlert} />}
          {summary && (
            <span className="text-[13px] leading-[18px] text-muted-foreground truncate min-w-0 max-w-full">
              {summary}
            </span>
          )}
        </div>
      </div>

      {/* Actions (no header label in Figma) */}
      <div role="cell" className="flex items-center justify-end">
        <RowActions onAction={(tab) => onOpenClinical(patient, tab)} />
      </div>
    </div>
  );
});

export default function PatientListView({
  patients,
  privacyMode,
  onOpenClinical,
}: PatientListViewProps) {
  const sortedPatients = useMemo(
    () =>
      [...patients].sort(
        (a, b) =>
          timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime)
      ),
    [patients]
  );

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Count header — matches Figma "11 total appointments" */}
      <div className="shrink-0 px-6 pt-4 pb-4">
        <h2 className="text-sm font-medium text-foreground">
          {sortedPatients.length} total appointments
        </h2>
      </div>

      {/* Bordered data table */}
      <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
        <div className="h-full rounded-md border border-border bg-card overflow-hidden flex flex-col">
          {/* Sticky header — Time | Patient | Clinical Summary | (blank) */}
          <div
            role="row"
            className={cn(
              "grid items-center gap-3 px-4 h-12 border-b border-border bg-card shrink-0",
              GRID_TEMPLATE
            )}
          >
            <span role="columnheader" className="text-sm font-medium text-muted-foreground">
              Time
            </span>
            <span role="columnheader" className="text-sm font-medium text-muted-foreground">
              Patient
            </span>
            <span role="columnheader" className="text-sm font-medium text-muted-foreground">
              Clinical Summary
            </span>
            <span role="columnheader" aria-hidden className="" />
          </div>

          {/* Body */}
          <div role="rowgroup" className="flex-1 min-h-0 overflow-y-auto">
            {sortedPatients.length === 0 ? (
              <div className="flex items-center justify-center h-full p-8 text-sm text-muted-foreground">
                No appointments match the current filters.
              </div>
            ) : (
              sortedPatients.map((patient) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  privacyMode={privacyMode}
                  onOpenClinical={onOpenClinical}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
