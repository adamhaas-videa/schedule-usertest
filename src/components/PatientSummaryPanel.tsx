import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Odontogram from "@/components/Odontogram";
import Chiclet from "@/components/OpportunityChiclet";
import type { ClinicalTab } from "@/types/clinical";
import type { Patient } from "@/data/mockPatients";
import {
  buildPastVisitMenu,
  buildPastVisits,
  countSameDay,
  type PastVisit,
} from "@/data/patientSummary";
import { buildPatientSummary } from "@/data/patientSummary";
import VisitPicker from "@/components/workflow/VisitPicker";
import {
  AlertBadges,
  AppointmentBlock,
  CompletedTaskList,
  GroupHeading,
  InsuranceLine,
  Section,
  SectionLabel,
  TasksDueList,
  UnscheduledTxList,
  VOICE_NOTE_INFO,
  WorkGroup,
  type TaskState,
} from "@/components/summary/SummaryParts";
import { getSummaryVersion, type SummaryVersion } from "@/lib/summaryVersions";
import { cn } from "@/lib/utils";

// Panel width and the 24px content padding come from the `patient-summary`
// frame in Figma (node 4696:13176).
const PANEL_WIDTH = "!w-[520px] !max-w-[520px]";

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
          <CompletedTaskList tasks={visit.completedTasks} />
        </Section>
      )}

      {showVoiceNote && (
        <Section
          label="Clinical voice note"
          info={VOICE_NOTE_INFO}
        >
          <p className="text-sm leading-5 text-foreground">{visit.voiceNote}</p>
        </Section>
      )}
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
  const [taskState, setTaskState] = useState<TaskState>({});
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
  const privateText = privacyMode ? "blur-sm select-none" : undefined;

  const setTask = (id: string, state: "done" | "dismissed") =>
    setTaskState((prev) => ({ ...prev, [`${patient.id}:${id}`]: state }));

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
            <AlertBadges alerts={summary.alerts} />
            {sections.insurance && patient.insurance && (
              <div className="py-2">
                <InsuranceLine insurance={patient.insurance} />
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
            <AppointmentBlock patient={patient} />
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
                  <TasksDueList
                    patientId={patient.id}
                    tasks={summary.tasks}
                    state={taskState}
                    onChange={setTask}
                  />
                </div>
              )}

              {sections.unscheduledTx && (
                <div className="flex min-w-px flex-1 flex-col gap-1.5">
                  <SectionLabel>Unscheduled tx</SectionLabel>
                  <UnscheduledTxList items={summary.unscheduledTx} />
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
