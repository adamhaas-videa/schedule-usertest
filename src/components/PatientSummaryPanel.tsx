import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Odontogram from "@/components/Odontogram";
import type { ClinicalTab } from "@/App";
import type { Patient } from "@/data/mockPatients";
import { buildPatientSummary } from "@/data/patientSummary";
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
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

// Outline count chiclet — "2 Curodont", "1 Crown". Shared by the AI opportunity
// and recommendation rows so both read as the same kind of object.
function Chiclet({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="bg-background font-medium text-foreground"
    >
      {children}
    </Badge>
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn(PANEL_WIDTH, "gap-0 p-0")}>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
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
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
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
                Voice Notes
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenClinical(patient, "perio")}
              >
                <i
                  className="fa-regular fa-waveform-lines text-base"
                  aria-hidden
                />
                Voice Perio
              </Button>
            </div>
          )}

          {sections.insurance && patient.insurance && (
            <Section label="Insurance">
              <div className="flex flex-wrap items-center gap-1.5">
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
            </Section>
          )}

          <Section label="Today">
            <div className="text-base leading-6 font-medium text-foreground">
              {tooth ? `${tooth} • ` : ""}
              {patient.procedure}
            </div>
            <div className="flex items-center gap-2">
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
          </Section>

          <Section label="Last appointment">
            <div className="text-sm text-foreground">
              {summary.lastAppointment.date} •{" "}
              {summary.lastAppointment.procedure}
            </div>
            <div className="text-sm text-muted-foreground">
              {summary.lastAppointment.providerName}
            </div>
          </Section>

          {sections.voiceNoteSummary && (
            <Section label="Last voice note">
              <p className="text-sm leading-5 text-muted-foreground">
                {summary.voiceNoteSummary}
              </p>
            </Section>
          )}

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
                  <Odontogram findings={summary.findings} />
                )}
              </div>
            </div>
          )}

          {sections.recommendations && summary.recommendations.length > 0 && (
            <Section label="Recommendations">
              <div className="flex flex-wrap items-center gap-1.5">
                {summary.recommendations.map((recommendation) => (
                  <Chiclet key={recommendation}>{recommendation}</Chiclet>
                ))}
              </div>
            </Section>
          )}

          {(sections.tasks || sections.unscheduledTx) && (
            <div className="flex items-start gap-3">
              {sections.tasks && (
                <div className="flex min-w-px flex-1 flex-col gap-1.5">
                  <SectionLabel>Tasks</SectionLabel>
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
