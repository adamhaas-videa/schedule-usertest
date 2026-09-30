import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Odontogram from "@/components/Odontogram";
import Chiclet from "@/components/OpportunityChiclet";
import type { ClinicalTab } from "@/types/clinical";
import type { Patient } from "@/data/mockPatients";
import {
  buildPastVisitMenu,
  buildPastVisits,
  countSameDay,
  type PastVisit,
  type VisitWorkItem,
} from "@/data/patientSummary";
import { buildPatientSummary } from "@/data/patientSummary";
import VisitPicker from "@/components/workflow/VisitPicker";
import { getProviderColor } from "@/lib/providerColors";
import { getSummaryVersion, type SummaryVersion } from "@/lib/summaryVersions";
import { cn } from "@/lib/utils";

// Panel width and the 24px content padding come from the `patient-summary`
// frame in Figma (node 4696:13176).
const PANEL_WIDTH = "!w-[520px] !max-w-[520px]";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] leading-none text-muted-foreground uppercase">
      {children}
    </div>
  );
}

function Section({
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
 * "Same-day", not "Unscheduled": the panel's Unscheduled Tx list further down
 * means treatment that is still NOT done, which is the opposite of this.
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

function WorkGroup({
  label,
  items,
}: {
  label: string;
  items: VisitWorkItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
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

/**
 * Everything the drawer knows about one earlier visit: what it was booked as,
 * the work and tasks completed, and the provider's recap. Grouped under the
 * visit picker so switching the date swaps the whole block at once — nothing
 * here describes today.
 */
function PastVisitDetail({
  visit,
  showTasks,
  showVoiceNote,
}: {
  visit: PastVisit;
  showTasks: boolean;
  showVoiceNote: boolean;
}) {
  const sameDay = countSameDay(visit);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-md border border-border p-3">
        <div className="flex flex-col gap-1">
          <div className="text-[11px] leading-none text-muted-foreground uppercase">
            Came in for
          </div>
          <div className="text-sm leading-5 font-medium text-foreground">
            {visit.plannedProcedure}
          </div>
          <div className="text-sm text-muted-foreground">
            {visit.providerName}
          </div>
        </div>
        <div className="h-px bg-border" />
        <WorkGroup label="Clinical work" items={visit.clinical} />
        <WorkGroup label="Hygiene" items={visit.hygiene} />
        {sameDay > 0 && (
          <div className="text-[12px] leading-4 text-muted-foreground">
            {sameDay === 1
              ? "1 procedure was diagnosed and treated in the chair, off the schedule."
              : `${sameDay} procedures were diagnosed and treated in the chair, off the schedule.`}
          </div>
        )}
      </div>

      {showTasks && visit.completedTasks.length > 0 && (
        <Section label="Tasks completed">
          {visit.completedTasks.map((task) => (
            <div key={task} className="flex items-center gap-2.5">
              <i
                className="fa-solid fa-circle-check text-base text-muted-foreground"
                aria-hidden
              />
              <span className="text-sm text-muted-foreground">{task}</span>
            </div>
          ))}
        </Section>
      )}

      {showVoiceNote && (
        <Section
          label="Clinical voice note"
          info="A quick, friendly recap of the last visit, written by AI from the provider's voice note — or from the clinical note in your practice software when no voice note was recorded."
        >
          <p className="text-sm leading-5 text-foreground">{visit.voiceNote}</p>
        </Section>
      )}
    </div>
  );
}

/** Top-level grouping in the drawer: Today, then the picked past visit. The
 *  rule runs out from the label, centred on it, and doubles as the divider. */
function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <h3 className="shrink-0 text-sm leading-5 font-semibold text-foreground">
        {children}
      </h3>
      <div className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

interface PatientSummaryPanelProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: SummaryVersion;
  privacyMode: boolean;
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
  // Step through the patients currently on the schedule without closing the
  // panel — the angle-up / angle-down pair in the design's footer.
  onStepPatient?: (delta: -1 | 1) => void;
}

export default function PatientSummaryPanel({
  patient,
  open,
  onOpenChange,
  version,
  privacyMode,
  onOpenClinical,
  onStepPatient,
}: PatientSummaryPanelProps) {
  // Demo-local task state, keyed by patient so stepping to the next patient
  // shows their own list rather than inheriting ticks from the previous one.
  const [taskState, setTaskState] = useState<
    Record<string, "done" | "dismissed">
  >({});
  // Keyed by patient so stepping to the next one opens on their latest visit
  // rather than holding a date that belongs to somebody else's history.
  const [visitDates, setVisitDates] = useState<Record<string, number>>({});

  const pastVisits = useMemo(
    () => (patient ? buildPastVisits(patient) : []),
    [patient]
  );
  const pastVisitMenu = useMemo(
    () => buildPastVisitMenu(pastVisits),
    [pastVisits]
  );

  if (!patient) return null;

  const { sections } = getSummaryVersion(version);
  const summary = buildPatientSummary(patient);
  const providerColor = getProviderColor(patient.provider?.id);
  const tooth = toothPrefix(patient);
  const privateText = privacyMode ? "blur-sm select-none" : undefined;

  const setTask = (id: string, state: "done" | "dismissed") =>
    setTaskState((prev) => ({ ...prev, [`${patient.id}:${id}`]: state }));

  const visibleTasks = summary.tasks.filter(
    (task) => taskState[`${patient.id}:${task.id}`] !== "dismissed"
  );

  const pickedDate = visitDates[patient.id];
  const selectedVisit =
    pastVisits.find((visit) => visit.date.getTime() === pickedDate) ??
    pastVisits[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn(PANEL_WIDTH, "gap-0 p-0")}>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <SheetHeader className="flex flex-col gap-1.5 p-0">
            <SheetTitle
              className={cn("text-xl font-semibold text-foreground", privateText)}
            >
              {patient.name}
            </SheetTitle>
            <div className={cn("text-sm text-muted-foreground", privateText)}>
              {summary.identity} • {summary.phone}
            </div>
            {summary.alerts.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {summary.alerts.map((alert) =>
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
            )}
            {sections.insurance && patient.insurance && (
              <div className="flex flex-wrap items-center gap-2 py-2">
                <Badge
                  className={cn(
                    patient.insurance.status === "Active" &&
                      "border-success-muted-border bg-success-muted text-success",
                    patient.insurance.status === "Pending" &&
                      "border-warning-muted-border bg-warning-muted text-warning-emphasis",
                    patient.insurance.status === "Inactive" &&
                      "border-error-muted-border bg-error-muted text-destructive"
                  )}
                >
                  <i
                    className="fa-solid fa-shield-check text-[10px]"
                    aria-hidden
                  />
                  {patient.insurance.status}
                </Badge>
                <span className="text-sm text-foreground">
                  {patient.insurance.carrier} • $
                  {patient.insurance.remainingBenefit} remaining benefits
                </span>
              </div>
            )}
          </SheetHeader>

          {sections.shortcuts && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenClinical(patient, "xray")}
              >
                <i className="fa-regular fa-images text-base" aria-hidden />
                Images
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenClinical(patient, "voice")}
              >
                <i className="fa-regular fa-microphone text-base" aria-hidden />
                Clinical Notes
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenClinical(patient, "perio")}
              >
                <i
                  className="fa-regular fa-waveform-lines text-base"
                  aria-hidden
                />
                Perio Chart
              </Button>
            </div>
          )}

          <GroupHeading>Today</GroupHeading>

          <div className="flex w-full flex-col gap-1.5 rounded-md bg-accent p-3">
            <SectionLabel>Appointment</SectionLabel>
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
                  {patient.provider?.name ?? "Unassigned"} •{" "}
                  {patient.appointmentTime} • Op {patient.operatory}
                </span>
              </div>
            </div>
          </div>

          {sections.aiOpportunities && (
            <div className="flex flex-col gap-3">
              <SectionLabel>AI opportunities</SectionLabel>
              <div className="flex flex-col gap-2">
                {summary.opportunities.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {summary.opportunities.map((opportunity) => (
                      <Chiclet key={opportunity.label}>
                        {opportunity.count} {opportunity.label}
                      </Chiclet>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No opportunities detected
                  </div>
                )}
                {sections.odontogram && (
                  <Odontogram
                    findings={summary.findings}
                    unscheduledTx={summary.unscheduledTx}
                  />
                )}
              </div>
            </div>
          )}

          {(sections.tasks || sections.unscheduledTx) && (
            <div className="flex items-start gap-3">
              {sections.tasks && (
                <div className="flex min-w-px flex-1 flex-col gap-1.5">
                  <SectionLabel>Tasks due</SectionLabel>
                  {visibleTasks.length > 0 ? (
                    visibleTasks.map((task) => {
                      const done =
                        taskState[`${patient.id}:${task.id}`] === "done";
                      return (
                        <div key={task.id} className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setTask(task.id, "done")}
                            className="flex size-4 items-center justify-center text-success transition-colors hover:text-success-emphasis"
                            aria-label={`Complete ${task.label}`}
                            title="Complete"
                          >
                            <i
                              className={cn(
                                "text-base",
                                done
                                  ? "fa-solid fa-circle-check"
                                  : "fa-regular fa-circle"
                              )}
                              aria-hidden
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTask(task.id, "dismissed")}
                            className="flex size-4 items-center justify-center text-destructive transition-colors hover:text-destructive-hover"
                            aria-label={`Dismiss ${task.label}`}
                            title="Dismiss"
                          >
                            <i
                              className="fa-regular fa-xmark text-base"
                              aria-hidden
                            />
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
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Nothing outstanding
                    </div>
                  )}
                </div>
              )}

              {sections.unscheduledTx && (
                <div className="flex min-w-px flex-1 flex-col gap-1.5 text-muted-foreground">
                  <SectionLabel>Unscheduled tx</SectionLabel>
                  {summary.unscheduledTx.length > 0 ? (
                    summary.unscheduledTx.map((tx) => (
                      <div key={`${tx.tooth}-${tx.label}`} className="text-sm">
                        {tx.tooth} • {tx.label}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm">None outstanding</div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedVisit && (
            <>
              <div className="flex flex-col gap-1.5">
                <GroupHeading>Past visits</GroupHeading>
                <VisitPicker
                  patient={patient}
                  activeTab="chart"
                  menu={pastVisitMenu}
                  value={selectedVisit.date}
                  onSelect={(date) =>
                    setVisitDates((prev) => ({
                      ...prev,
                      [patient.id]: date.getTime(),
                    }))
                  }
                />
              </div>
              <PastVisitDetail
                visit={selectedVisit}
                showTasks={sections.tasks}
                showVoiceNote={sections.voiceNoteSummary}
              />
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2.5 border-t border-border px-6 py-4">
          <div className="flex flex-1 items-center gap-2.5">
            {onStepPatient && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onStepPatient(-1)}
                  aria-label="Previous patient"
                  title="Previous patient"
                >
                  <i className="fa-regular fa-angle-up text-base" aria-hidden />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onStepPatient(1)}
                  aria-label="Next patient"
                  title="Next patient"
                >
                  <i
                    className="fa-regular fa-angle-down text-base"
                    aria-hidden
                  />
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onOpenClinical(patient, "xray")}>
            Review
            <i className="fa-regular fa-arrow-right text-base" aria-hidden />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
