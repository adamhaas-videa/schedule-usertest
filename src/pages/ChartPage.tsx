import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WorkflowHeader from "@/components/workflow/WorkflowHeader";
import Odontogram from "@/components/Odontogram";
import Chiclet from "@/components/OpportunityChiclet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  buildTreatmentHistory,
  countOpportunities,
  countSameDay,
  type CompletedTreatment,
  type PastVisit,
  type PatientSummary,
} from "@/data/patientSummary";
import type { Patient } from "@/data/mockPatients";
import { getPatientById } from "@/lib/patients";
import { useAiView } from "@/context/AiViewContext";
import { getSummaryVersion, type SummarySections } from "@/lib/summaryVersions";
import {
  formatRelative,
  formatShortDate,
  getVisitDate,
  isToday,
  type VisitMenu,
} from "@/lib/visitHistory";
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
      const next = Math.min(
        Math.max(width / ODONTOGRAM_BASE_WIDTH, 1),
        ODONTOGRAM_MAX_ZOOM
      );
      // Ignore sub-pixel jitter so a resize can't feed back into itself.
      setZoom((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
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
 * The chart card. AI opportunities are always drawn; completed work is a
 * second layer the switch shows or hides. The caller passes only the history
 * up to the date being viewed, so stepping back through visits replays the
 * mouth as it was then.
 */
function ChartCard({
  summary,
  aiFindings,
  completed,
  showCompleted,
  onShowCompletedChange,
  showOdontogram,
  className,
}: {
  summary: PatientSummary;
  aiFindings: PatientSummary["findings"];
  completed: CompletedTreatment[];
  showCompleted: boolean;
  onShowCompletedChange: (on: boolean) => void;
  showOdontogram: boolean;
  className?: string;
}) {
  const opportunities = countOpportunities(aiFindings);
  return (
    <section className={cn(CARD, "flex min-w-0 flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SectionLabel>AI opportunities</SectionLabel>
          {opportunities.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {opportunities.map((opportunity) => (
                <Chiclet key={opportunity.label}>
                  {opportunity.count} {opportunity.label}
                </Chiclet>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              No opportunities detected
            </span>
          )}
        </div>
        {showOdontogram && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
            <span
              className="size-2.5 rounded-full bg-odontogram-completed"
              aria-hidden
            />
            Past treatments
            <Switch
              size="sm"
              checked={showCompleted}
              onCheckedChange={onShowCompletedChange}
            />
          </label>
        )}
      </div>
      {showOdontogram && (
        <ScaledOdontogram
          findings={aiFindings}
          unscheduledTx={summary.unscheduledTx}
          completed={showCompleted ? completed : []}
        />
      )}
    </section>
  );
}

function CameInFor({ visit }: { visit: PastVisit }) {
  return (
    <div className="flex flex-col gap-1">
      <SectionLabel>Came in for</SectionLabel>
      <div className="text-base leading-6 font-medium text-foreground">
        {visit.plannedProcedure}
      </div>
      <div className="text-sm text-muted-foreground">{visit.providerName}</div>
    </div>
  );
}

function SameDayNote({ visit }: { visit: PastVisit }) {
  const sameDay = countSameDay(visit);
  if (sameDay === 0) return null;
  return (
    <div className="text-[12px] leading-4 text-muted-foreground">
      {sameDay === 1
        ? "1 procedure was diagnosed and treated in the chair, off the schedule."
        : `${sameDay} procedures were diagnosed and treated in the chair, off the schedule.`}
    </div>
  );
}

/** Voice note over the tasks closed out, in one card. */
function VisitRecapCard({
  visit,
  sections,
  className,
}: {
  visit: PastVisit;
  sections: SummarySections;
  className?: string;
}) {
  const showTasks = sections.tasks && visit.completedTasks.length > 0;
  if (!sections.voiceNoteSummary && !showTasks) return null;
  return (
    <section className={cn(CARD, "flex flex-col gap-4", className)}>
      {sections.voiceNoteSummary && (
        <Section label="Clinical voice note" info={VOICE_NOTE_INFO}>
          <p className="text-[15px] leading-6 text-foreground">{visit.voiceNote}</p>
        </Section>
      )}
      {sections.voiceNoteSummary && showTasks && (
        <div className="h-px bg-border" aria-hidden />
      )}
      {showTasks && (
        <Section label="Tasks completed">
          <CompletedTaskList tasks={visit.completedTasks} />
        </Section>
      )}
    </section>
  );
}

/** What was booked and what was done, in one card. */
function VisitWorkCard({
  visit,
  stacked = false,
  className,
}: {
  visit: PastVisit;
  /** One column, for the narrow rail beside the chart. */
  stacked?: boolean;
  className?: string;
}) {
  return (
    <section className={cn(CARD, "flex flex-col gap-4", className)}>
      <CameInFor visit={visit} />
      <div className="h-px bg-border" aria-hidden />
      <div
        className={cn(
          "grid grid-cols-1 gap-x-6 gap-y-4",
          !stacked && "sm:grid-cols-2"
        )}
      >
        <WorkGroup label="Clinical work" items={visit.clinical} />
        <WorkGroup label="Hygiene" items={visit.hygiene} />
      </div>
      <SameDayNote visit={visit} />
    </section>
  );
}

function TodayRail({
  patient,
  summary,
  sections,
  taskState,
  onTaskChange,
}: {
  patient: Patient;
  summary: PatientSummary;
  sections: SummarySections;
  taskState: TaskState;
  onTaskChange: (taskId: string, next: "done" | "dismissed") => void;
}) {
  const showOpenWork = sections.tasks || sections.unscheduledTx;
  return (
    <>
      <section className="flex flex-col gap-1.5 rounded-lg bg-accent p-5">
        <SectionLabel>Appointment</SectionLabel>
        <AppointmentBlock patient={patient} />
      </section>
      {showOpenWork && (
        <section className={cn(CARD, "flex flex-1 flex-col gap-5")}>
          {sections.tasks && (
            <Section label="Tasks due">
              <TasksDueList
                patientId={patient.id}
                tasks={summary.tasks}
                state={taskState}
                onChange={onTaskChange}
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
    </>
  );
}

function DateContext({ date }: { date: Date }) {
  return (
    <span className="tabular-nums">
      {formatShortDate(date)} · {formatRelative(date)}
    </span>
  );
}

/**
 * The Patient Summary tab. Identity lives in the workflow header, and the
 * study bar's picker chooses what the page is about: today's visit by default
 * (chart, booking, open work, with the last visit beneath), or any past visit,
 * which replays the chart to that date above what was done.
 */
export default function ChartPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = getPatientById(id);
  const { privacyMode, setPrivacyMode, summaryVersion } = useAiView();

  const [taskState, setTaskState] = useState<TaskState>({});
  // null = today's visit; otherwise the picked past visit's date.
  const [pickedDate, setPickedDate] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);

  const pastVisits = useMemo(
    () => (patient ? buildPastVisits(patient) : []),
    [patient]
  );
  const history = useMemo(() => buildTreatmentHistory(pastVisits), [pastVisits]);
  const todayDate = useMemo(
    () => getVisitDate(patient),
    [patient]
  );
  const todayLabel = isToday(todayDate) ? "Today" : "This visit";
  const menu = useMemo<VisitMenu>(
    () => ({
      groups: [
        { label: todayLabel, visits: [{ date: todayDate, chips: [] }] },
        {
          label: `Past visits · ${pastVisits.length}`,
          visits: buildPastVisitMenu(pastVisits).groups[0].visits,
        },
      ],
    }),
    [pastVisits, todayDate, todayLabel]
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
  const pastVisit =
    pickedDate === null
      ? undefined
      : pastVisits.find((visit) => visit.date.getTime() === pickedDate);
  const lastVisit = pastVisits[0];
  const viewedDate = pastVisit?.date ?? todayDate;

  // A treated tooth isn't an open opportunity any more, so the AI layer drops
  // every tooth the history covers — otherwise a filling done two years ago
  // would still be charted as one to do.
  const treatedTeeth = new Set(history.map((item) => item.tooth));
  const aiFindings = summary.findings.filter((f) => !treatedTeeth.has(f.tooth));
  const completedToDate = history.filter(
    (item) => item.date.getTime() <= viewedDate.getTime()
  );

  const showInsurance = sections.insurance && patient.insurance;

  const chart = sections.aiOpportunities && (
    <ChartCard
      summary={summary}
      aiFindings={aiFindings}
      completed={completedToDate}
      showCompleted={showCompleted}
      onShowCompletedChange={setShowCompleted}
      showOdontogram={sections.odontogram}
      className="lg:col-span-8"
    />
  );
  const railSpan = chart ? "lg:col-span-4" : "lg:col-span-12";

  return (
    <div className="flex h-screen flex-col bg-background">
      <WorkflowHeader
        patient={patient}
        activeTab="chart"
        privacyMode={privacyMode}
        onPrivacyToggle={setPrivacyMode}
        studyPicker={{
          menu,
          label: "Summary from",
          value: viewedDate,
          onSelect: (date) =>
            setPickedDate(
              date.getTime() === todayDate.getTime() ? null : date.getTime()
            ),
        }}
      />

      {/* Stable gutter: the chart's zoom follows the column width, so a
          scrollbar appearing as it grows must not narrow the column. */}
      <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
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

          {pastVisit ? (
            <>
              <GroupHeading
                trailing={<DateContext date={pastVisit.date} />}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPickedDate(null)}
                  >
                    <i className="fa-regular fa-arrow-left text-sm" aria-hidden />
                    Back to {todayLabel.toLowerCase()}
                  </Button>
                }
              >
                Past visit
              </GroupHeading>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {chart}
                <div className={cn("flex flex-col gap-5", railSpan)}>
                  <VisitWorkCard visit={pastVisit} stacked className="flex-1" />
                </div>
              </div>
              <VisitRecapCard visit={pastVisit} sections={sections} />
            </>
          ) : (
            <>
              <GroupHeading
                trailing={
                  <span className="tabular-nums">{formatShortDate(todayDate)}</span>
                }
              >
                {todayLabel}
              </GroupHeading>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {chart}
                <div className={cn("flex flex-col gap-5", railSpan)}>
                  <TodayRail
                    patient={patient}
                    summary={summary}
                    sections={sections}
                    taskState={taskState}
                    onTaskChange={(taskId, next) =>
                      setTaskState((prev) => ({
                        ...prev,
                        [`${patient.id}:${taskId}`]: next,
                      }))
                    }
                  />
                </div>
              </div>

              {lastVisit && (
                <>
                  <GroupHeading trailing={<DateContext date={lastVisit.date} />}>
                    Last visit
                  </GroupHeading>
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    <VisitWorkCard visit={lastVisit} className="lg:col-span-7" />
                    <div className="lg:col-span-5">
                      <VisitRecapCard
                        visit={lastVisit}
                        sections={sections}
                        className="h-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
