import { useCallback, useMemo, useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import L1Header from "@/components/layout/L1Header";
import L2Header from "@/components/layout/L2Header";
import OperatoryGrid from "@/components/OperatoryGrid";
import PatientListView from "@/components/PatientListView";
import PatientDetailDrawer from "@/components/PatientDetailDrawer";
import ClinicalView from "@/components/clinical/ClinicalView";
import { mockPatients, applySimulatedTime } from "@/data/mockPatients";
import type { Patient } from "@/data/mockPatients";
import {
  getSimulatedNowMinutes,
  READY_FOR_CHAIR_WINDOW_MIN,
} from "@/lib/timeline";

export type OperatoryFilter = "all" | number;
export type ScheduleView = "list" | "calendar";
export type ClinicalTab = "xray" | "voice" | "perio";

export interface ScheduleFilters {
  provider: string;
  operatory: OperatoryFilter;
}

type AppView =
  | { kind: "schedule" }
  | { kind: "clinical"; patient: Patient; tab: ClinicalTab };

const INITIAL_FILTERS: ScheduleFilters = {
  provider: "all",
  operatory: "all",
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [privacyMode, setPrivacyMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ScheduleFilters>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<ScheduleView>("calendar");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
      if (
        filters.provider !== "all" &&
        p.provider?.id !== filters.provider &&
        p.hygienist?.id !== filters.provider
      ) {
        return false;
      }
      if (filters.operatory !== "all" && p.operatory !== filters.operatory) {
        return false;
      }
      return true;
    });
  }, [patients, filters]);

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
          <L1Header />
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
                operatoryFilter={filters.operatory}
                onOperatoryFilterChange={(op) =>
                  setFilters((prev) => ({ ...prev, operatory: op }))
                }
                onOpenClinical={handleOpenClinical}
              />
            )}
          </main>

          <PatientDetailDrawer
            patient={selectedPatient}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
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
