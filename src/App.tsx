import { useCallback, useMemo, useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import L1Header from "@/components/layout/L1Header";
import L2Header from "@/components/layout/L2Header";
import OperatoryGrid from "@/components/OperatoryGrid";
import PatientListView from "@/components/PatientListView";
import PatientSummaryPanel from "@/components/PatientSummaryPanel";
import ClinicalView from "@/components/clinical/ClinicalView";
import {
  mockPatients,
  applySimulatedTime,
  timeToMinutes,
} from "@/data/mockPatients";
import type { Patient } from "@/data/mockPatients";
import {
  getSimulatedNowMinutes,
  READY_FOR_CHAIR_WINDOW_MIN,
} from "@/lib/timeline";
import { DEFAULT_CARD_VERSION } from "@/lib/cardVersions";
import {
  DEFAULT_SUMMARY_VERSION,
  type SummaryVersion,
} from "@/lib/summaryVersions";

export type ScheduleView = "list" | "calendar";
export type ClinicalTab = "xray" | "voice" | "perio";

export interface ScheduleFilters {
  providers: string[];
  operatories: number[];
}

type AppView =
  | { kind: "schedule" }
  | { kind: "clinical"; patient: Patient; tab: ClinicalTab };

const INITIAL_FILTERS: ScheduleFilters = {
  providers: [],
  operatories: [],
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [privacyMode, setPrivacyMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ScheduleFilters>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<ScheduleView>("calendar");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [summaryVersion, setSummaryVersion] = useState<SummaryVersion>(
    DEFAULT_SUMMARY_VERSION
  );
  // The card interaction model is no longer switchable from the header — the
  // header menu now demos the summary slideout tiers instead. Cards stay on the
  // default model (see src/lib/cardVersions.ts).
  const cardVersion = DEFAULT_CARD_VERSION;
  const [view, setView] = useState<AppView>({ kind: "schedule" });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Search dropdown still opens the patient detail drawer.
  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setDrawerOpen(true);
  }, []);

  const handleOpenClinical = useCallback(
    (patient: Patient, tab: ClinicalTab) => {
      setView({ kind: "clinical", patient, tab });
    },
    []
  );

  const handleNavigate = useCallback((key: string) => {
    if (key === "schedule") {
      setView({ kind: "schedule" });
    }
  }, []);

  const patients = useMemo(() => {
    const now = getSimulatedNowMinutes();
    return mockPatients.map((p) =>
      applySimulatedTime(p, now, READY_FOR_CHAIR_WINDOW_MIN)
    );
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (filters.providers.length > 0) {
        const matches =
          (p.provider && filters.providers.includes(p.provider.id)) ||
          (p.hygienist && filters.providers.includes(p.hygienist.id));
        if (!matches) return false;
      }
      if (
        filters.operatories.length > 0 &&
        !filters.operatories.includes(p.operatory)
      ) {
        return false;
      }
      return true;
    });
  }, [patients, filters]);

  // Footer arrows in the summary panel walk the schedule in clock order, which
  // is not the order `filteredPatients` comes in (that is grouped by operatory).
  const stepOrder = useMemo(
    () =>
      [...filteredPatients].sort(
        (a, b) =>
          timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime) ||
          a.operatory - b.operatory
      ),
    [filteredPatients]
  );

  const handleStepPatient = useCallback(
    (delta: -1 | 1) => {
      setSelectedPatient((current) => {
        if (!current || stepOrder.length === 0) return current;
        const index = stepOrder.findIndex((p) => p.id === current.id);
        if (index === -1) return current;
        const next =
          (index + delta + stepOrder.length) % stepOrder.length;
        return stepOrder[next];
      });
    },
    [stepOrder]
  );

  const activeNav =
    view.kind === "clinical" && view.tab === "voice" ? "voice-notes" : "schedule";

  return (
    <AppShell
      collapsed={sidebarCollapsed}
      onCollapsedChange={setSidebarCollapsed}
      activeNav={activeNav}
      onNavigate={handleNavigate}
    >
      {view.kind === "schedule" ? (
        <>
          <L1Header
            summaryVersion={summaryVersion}
            onSummaryVersionChange={setSummaryVersion}
          />
          <L2Header
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            privacyMode={privacyMode}
            onPrivacyToggle={setPrivacyMode}
            filters={filters}
            onFiltersChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSelectPatient={handleSelectPatient}
          />
          <main className="flex-1 bg-background overflow-hidden">
            {viewMode === "list" ? (
              <PatientListView
                patients={filteredPatients}
                privacyMode={privacyMode}
                onOpenClinical={handleOpenClinical}
              />
            ) : (
              <OperatoryGrid
                scrollRef={scrollRef}
                patients={filteredPatients}
                privacyMode={privacyMode}
                operatories={filters.operatories}
                onOperatoriesChange={(ops) =>
                  setFilters((prev) => ({ ...prev, operatories: ops }))
                }
                onOpenClinical={handleOpenClinical}
                onSelectPatient={handleSelectPatient}
                cardVersion={cardVersion}
              />
            )}
          </main>

          <PatientSummaryPanel
            patient={selectedPatient}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            version={summaryVersion}
            privacyMode={privacyMode}
            onOpenClinical={handleOpenClinical}
            onStepPatient={handleStepPatient}
          />
        </>
      ) : (
        <ClinicalView
          patient={view.patient}
          tab={view.tab}
          onTabChange={(tab) =>
            setView({ kind: "clinical", patient: view.patient, tab })
          }
          onBack={() => setView({ kind: "schedule" })}
          privacyMode={privacyMode}
          onPrivacyToggle={setPrivacyMode}
        />
      )}
    </AppShell>
  );
}
