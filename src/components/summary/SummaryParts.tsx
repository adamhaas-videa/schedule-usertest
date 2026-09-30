// Building blocks shared by the patient summary drawer (PatientSummaryPanel)
// and the full-page Patient Summary tab (ChartPage). Both derive from
// `buildPatientSummary` / `buildPastVisits`; only the arrangement differs.
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Patient } from "@/data/mockPatients";
import type {
  PatientSummary,
  SummaryTask,
  VisitWorkItem,
} from "@/data/patientSummary";
import { getProviderColor } from "@/lib/providerColors";
import { cn } from "@/lib/utils";

export const VOICE_NOTE_INFO =
  "A quick, friendly recap of the last visit, written by AI from the provider's voice note — or from the clinical note in your practice software when no voice note was recorded.";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] leading-none text-muted-foreground uppercase">
      {children}
    </div>
  );
}

export function Section({
  label,
  info,
  children,
  className,
}: {
  label: string;
  /** Optional explainer, shown in a tooltip on an info icon beside the label. */
  info?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {info ? (
        <div className="flex items-center gap-1">
          <SectionLabel>{label}</SectionLabel>
          <TooltipProvider delay={150}>
            <Tooltip>
              <TooltipTrigger
                aria-label={`About ${label.toLowerCase()}`}
                className="inline-flex size-4 cursor-default items-center justify-center rounded-full border-0 bg-transparent p-0 text-muted-foreground hover:text-foreground"
              >
                <i className="fa-regular fa-circle-info text-[12px] leading-none" aria-hidden />
              </TooltipTrigger>
              <TooltipContent side="top">{info}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <SectionLabel>{label}</SectionLabel>
      )}
      {children}
    </div>
  );
}

/** Top-level grouping: Today, then the picked past visit. The rule runs out
 *  from the label, centred on it, and doubles as the divider. */
export function GroupHeading({
  children,
  trailing,
  action,
}: {
  children: React.ReactNode;
  /** Quiet context beside the label — the page puts the visit date here. */
  trailing?: React.ReactNode;
  /** Control at the far end of the rule. */
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <h3 className="shrink-0 text-sm leading-5 font-semibold text-foreground">
        {children}
      </h3>
      {trailing && (
        <span className="shrink-0 text-sm leading-5 text-muted-foreground">
          {trailing}
        </span>
      )}
      <div className="h-px flex-1 bg-border" aria-hidden />
      {action}
    </div>
  );
}

// The tooth a treatment applies to, rendered "30 • Crown Prep" like the design.
function toothPrefix(patient: Patient): string | null {
  for (const tag of patient.visitTags ?? []) {
    const match = tag.match(/#\s*(\d{1,2})/);
    if (match) return match[1];
  }
  return null;
}

/**
 * One line of completed work. Same-day rows carry the badge — the section
 * exists to make the gap between what was booked and what was done visible at
 * a glance, so that marker is the thing that has to read first.
 *
 * "Same-day", not "Unscheduled": the Unscheduled Tx list means treatment that
 * is still NOT done, which is the opposite of this.
 */
function WorkRow({ item }: { item: VisitWorkItem }) {
  return (
    <div className="flex items-start gap-2">
      <i
        className={cn(
          "fa-regular fa-check mt-[3px] text-[11px]",
          item.planned ? "text-muted-foreground" : "text-deep-teal-700"
        )}
        aria-hidden
      />
      <span className="flex-1 text-sm leading-5 text-foreground">
        {item.tooth ? (
          <span className="font-medium">#{item.tooth} </span>
        ) : null}
        {item.label}
      </span>
      {!item.planned && (
        <Badge
          variant="secondary"
          className="mt-px shrink-0 bg-accent text-deep-teal-700"
        >
          Same-day
        </Badge>
      )}
    </div>
  );
}

export function WorkGroup({
  label,
  items,
  className,
}: {
  label: string;
  items: VisitWorkItem[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="text-[11px] leading-none text-muted-foreground uppercase">
        {label}
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <WorkRow key={`${item.tooth ?? ""}${item.label}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function AlertBadges({ alerts }: { alerts: PatientSummary["alerts"] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {alerts.map((alert) =>
        alert.tone === "error" ? (
          <Badge
            key={alert.label}
            className="border-error-muted-border bg-error-muted text-destructive"
          >
            <i
              className="fa-regular fa-triangle-exclamation text-[10px]"
              aria-hidden
            />
            {alert.label}
          </Badge>
        ) : alert.tone === "success" ? (
          <Badge
            key={alert.label}
            className="border-success-muted-border bg-success-muted text-success"
          >
            {alert.label}
          </Badge>
        ) : (
          <Badge
            key={alert.label}
            className="border-warning-muted-border bg-warning-muted text-warning-emphasis"
          >
            <span className="size-1.5 rounded-full bg-warning" />
            {alert.label}
          </Badge>
        )
      )}
    </div>
  );
}

export function InsuranceLine({
  insurance,
}: {
  insurance: NonNullable<Patient["insurance"]>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        className={cn(
          insurance.status === "Active" &&
            "border-success-muted-border bg-success-muted text-success",
          insurance.status === "Pending" &&
            "border-warning-muted-border bg-warning-muted text-warning-emphasis",
          insurance.status === "Inactive" &&
            "border-error-muted-border bg-error-muted text-destructive"
        )}
      >
        <i className="fa-solid fa-shield-check text-[10px]" aria-hidden />
        {insurance.status}
      </Badge>
      <span className="text-sm text-foreground">
        {insurance.carrier} • ${insurance.remainingBenefit} remaining benefits
      </span>
    </div>
  );
}

/** Today's booking: procedure over the provider chip, time, and operatory. */
export function AppointmentBlock({ patient }: { patient: Patient }) {
  const providerColor = getProviderColor(patient.provider?.id);
  const tooth = toothPrefix(patient);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-base leading-6 font-medium text-foreground">
        {tooth ? `${tooth} • ` : ""}
        {patient.procedure}
      </div>
      <div className="flex items-center gap-1.5">
        <Avatar
          size="sm"
          className="size-[22px] after:border-transparent"
          style={{ backgroundColor: providerColor.bg }}
        >
          <AvatarFallback
            className="text-[11px] font-semibold"
            style={{
              backgroundColor: providerColor.bg,
              color: providerColor.fg,
            }}
          >
            {patient.provider?.initials ?? "—"}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">
          {patient.provider?.name ?? "Unassigned"} • {patient.appointmentTime} •
          Op {patient.operatory}
        </span>
      </div>
    </div>
  );
}

export type TaskState = Record<string, "done" | "dismissed">;

/** Outstanding tasks with complete / dismiss controls. State is keyed
 *  `${patientId}:${taskId}` by the caller so it survives patient stepping. */
export function TasksDueList({
  patientId,
  tasks,
  state,
  onChange,
}: {
  patientId: string;
  tasks: SummaryTask[];
  state: TaskState;
  onChange: (taskId: string, next: "done" | "dismissed") => void;
}) {
  const visible = tasks.filter(
    (task) => state[`${patientId}:${task.id}`] !== "dismissed"
  );
  if (visible.length === 0) {
    return <div className="text-sm text-muted-foreground">Nothing outstanding</div>;
  }
  return (
    <>
      {visible.map((task) => {
        const done = state[`${patientId}:${task.id}`] === "done";
        return (
          <div key={task.id} className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onChange(task.id, "done")}
              className="flex size-4 items-center justify-center text-success transition-colors hover:text-success-emphasis"
              aria-label={`Complete ${task.label}`}
              title="Complete"
            >
              <i
                className={cn(
                  "text-base",
                  done ? "fa-solid fa-circle-check" : "fa-regular fa-circle"
                )}
                aria-hidden
              />
            </button>
            <button
              type="button"
              onClick={() => onChange(task.id, "dismissed")}
              className="flex size-4 items-center justify-center text-destructive transition-colors hover:text-destructive-hover"
              aria-label={`Dismiss ${task.label}`}
              title="Dismiss"
            >
              <i className="fa-regular fa-xmark text-base" aria-hidden />
            </button>
            <span
              className={cn(
                "text-sm text-muted-foreground",
                done && "line-through"
              )}
            >
              {task.label}
            </span>
          </div>
        );
      })}
    </>
  );
}

export function UnscheduledTxList({
  items,
}: {
  items: PatientSummary["unscheduledTx"];
}) {
  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">None outstanding</div>;
  }
  return (
    <>
      {items.map((tx) => (
        <div key={`${tx.tooth}-${tx.label}`} className="text-sm text-muted-foreground">
          {tx.tooth} • {tx.label}
        </div>
      ))}
    </>
  );
}

export function CompletedTaskList({ tasks }: { tasks: string[] }) {
  return (
    <>
      {tasks.map((task) => (
        <div key={task} className="flex items-center gap-2.5">
          <i
            className="fa-solid fa-circle-check text-base text-muted-foreground"
            aria-hidden
          />
          <span className="text-sm text-muted-foreground">{task}</span>
        </div>
      ))}
    </>
  );
}
