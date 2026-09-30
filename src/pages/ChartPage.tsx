import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WorkflowHeader from "@/components/workflow/WorkflowHeader";
import Odontogram from "@/components/Odontogram";
import Chiclet from "@/components/OpportunityChiclet";
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
import {
  buildPastVisitMenu,
  buildPastVisits,
  buildPatientSummary,
  countSameDay,
} from "@/data/patientSummary";
import { getPatientById } from "@/lib/patients";
import { useAiView } from "@/context/AiViewContext";
import { getSummaryVersion } from "@/lib/summaryVersions";
import { cn } from "@/lib/utils";

const CARD = "rounded-lg border border-border bg-card p-5";

// The odontogram's teeth are fixed-pixel artwork tuned for the 472px content
// column of the drawer. On the page it is drawn at that width and zoomed to
// fill its card, so the chart reads at a clinical size without re-tuning every
// tooth. Capped so a very wide window doesn't blow it up past legibility.
const ODONTOGRAM_BASE_WIDTH = 472;
const ODONTOGRAM_MAX_ZOOM = 1.75;

function ScaledOdontogram(props: React.ComponentProps<typeof Odontogram>) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setZoom(Math.min(Math.max(width / ODONTOGRAM_BASE_WIDTH, 1), ODONTOGRAM_MAX_ZOOM));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex w-full flex-1 items-center justify-center">
      <div style={{ zoom, width: ODONTOGRAM_BASE_WIDTH }} className="max-w-full">
        <Odontogram {...props} />
      </div>
    </div>
  );
}

/**
 * The Patient Summary tab: the summary drawer's content laid out for a full
 * page. Identity lives in the workflow header and the past-visit picker in its
 * study bar, so neither is repeated here — the page is Today (chart, booking,
 * open work) over the visit picked in the bar.
 */
export default function ChartPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = getPatientById(id);
  const { privacyMode, setPrivacyMode, summaryVersion } = useAiView();

  const [taskState, setTaskState] = useState<TaskState>({});
  const [pickedDate, setPickedDate] = useState<number | null>(null);

  const pastVisits = useMemo(
    () => (patient ? buildPastVisits(patient) : []),
    [patient]
  );
  const pastVisitMenu = useMemo(
    () => buildPastVisitMenu(pastVisits),
    [pastVisits]
  );

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

  const { sections } = getSummaryVersion(summaryVersion);
  const summary = buildPatientSummary(patient);
  const selectedVisit =
    pastVisits.find((visit) => visit.date.getTime() === pickedDate) ??
    pastVisits[0];
  const sameDay = selectedVisit ? countSameDay(selectedVisit) : 0;
  const showInsurance = sections.insurance && patient.insurance;
  const showRail = sections.tasks || sections.unscheduledTx;

  return (
    <div className="flex h-screen flex-col bg-background">
      <WorkflowHeader
        patient={patient}
        activeTab="chart"
        privacyMode={privacyMode}
        onPrivacyToggle={setPrivacyMode}
        studyPicker={
          selectedVisit
            ? {
                menu: pastVisitMenu,
                label: "Past visit",
                value: selectedVisit.date,
                onSelect: (date) => setPickedDate(date.getTime()),
              }
            : undefined
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-8 pt-6 pb-12">
          {(summary.alerts.length > 0 || showInsurance) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <AlertBadges alerts={summary.alerts} />
              {summary.alerts.length > 0 && showInsurance && (
                <div className="h-4 w-px bg-border" aria-hidden />
              )}
              {showInsurance && <InsuranceLine insurance={patient.insurance!} />}
            </div>
          )}

          <GroupHeading>Today</GroupHeading>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {sections.aiOpportunities && (
              <section
                className={cn(
                  CARD,
                  "flex flex-col gap-4",
                  showRail ? "lg:col-span-8" : "lg:col-span-12"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SectionLabel>AI opportunities</SectionLabel>
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
                </div>
                {sections.odontogram && (
                  <ScaledOdontogram
                    findings={summary.findings}
                    unscheduledTx={summary.unscheduledTx}
                  />
                )}
              </section>
            )}

            <div
              className={cn(
                "flex flex-col gap-5",
                sections.aiOpportunities ? "lg:col-span-4" : "lg:col-span-12"
              )}
            >
              <section className="flex flex-col gap-1.5 rounded-lg bg-accent p-5">
                <SectionLabel>Appointment</SectionLabel>
                <AppointmentBlock patient={patient} />
              </section>

              {showRail && (
                <section className={cn(CARD, "flex flex-1 flex-col gap-5")}>
                  {sections.tasks && (
                    <Section label="Tasks due">
                      <TasksDueList
                        patientId={patient.id}
                        tasks={summary.tasks}
                        state={taskState}
                        onChange={(taskId, next) =>
                          setTaskState((prev) => ({
                            ...prev,
                            [`${patient.id}:${taskId}`]: next,
                          }))
                        }
                      />
                    </Section>
                  )}
                  {sections.tasks && sections.unscheduledTx && (
                    <div className="h-px bg-border" aria-hidden />
                  )}
                  {sections.unscheduledTx && (
                    <Section label="Unscheduled tx">
                      <UnscheduledTxList items={summary.unscheduledTx} />
                    </Section>
                  )}
                </section>
              )}
            </div>
          </div>

          {selectedVisit && (
            <>
              <GroupHeading>Past visit</GroupHeading>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <section
                  className={cn(CARD, "flex flex-col gap-4 lg:col-span-7")}
                >
                  <div className="flex flex-col gap-1">
                    <SectionLabel>Came in for</SectionLabel>
                    <div className="text-base leading-6 font-medium text-foreground">
                      {selectedVisit.plannedProcedure}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedVisit.providerName}
                    </div>
                  </div>
                  <div className="h-px bg-border" aria-hidden />
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <WorkGroup label="Clinical work" items={selectedVisit.clinical} />
                    <WorkGroup label="Hygiene" items={selectedVisit.hygiene} />
                  </div>
                  {sameDay > 0 && (
                    <div className="text-[12px] leading-4 text-muted-foreground">
                      {sameDay === 1
                        ? "1 procedure was diagnosed and treated in the chair, off the schedule."
                        : `${sameDay} procedures were diagnosed and treated in the chair, off the schedule.`}
                    </div>
                  )}
                </section>

                {(sections.voiceNoteSummary ||
                  (sections.tasks && selectedVisit.completedTasks.length > 0)) && (
                  <div className="lg:col-span-5">
                    <section className={cn(CARD, "flex h-full flex-col gap-4")}>
                      {sections.voiceNoteSummary && (
                        <Section label="Clinical voice note" info={VOICE_NOTE_INFO}>
                          <p className="text-[15px] leading-6 text-foreground">
                            {selectedVisit.voiceNote}
                          </p>
                        </Section>
                      )}
                      {sections.voiceNoteSummary &&
                        sections.tasks &&
                        selectedVisit.completedTasks.length > 0 && (
                          <div className="h-px bg-border" aria-hidden />
                        )}
                      {sections.tasks && selectedVisit.completedTasks.length > 0 && (
                        <Section label="Tasks completed">
                          <CompletedTaskList tasks={selectedVisit.completedTasks} />
                        </Section>
                      )}
                    </section>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
