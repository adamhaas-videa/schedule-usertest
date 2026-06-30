import { useCallback, useMemo, useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import OperatoryGrid from "@/components/OperatoryGrid";
import PatientListView from "@/components/PatientListView";
import PatientDetailDrawer from "@/components/PatientDetailDrawer";
import { mockPatients, applySimulatedTime } from "@/data/mockPatients";
import type { Patient } from "@/data/mockPatients";
import {
  getSimulatedNowMinutes,
  READY_FOR_CHAIR_WINDOW_MIN,
} from "@/lib/timeline";

export type OperatoryFilter = "all" | number;
export type ScheduleView = "list" | "calendar";

export interface ScheduleFilters {
  provider: string;
  operatory: OperatoryFilter;
}

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
  const [viewMode, setViewMode] = useState<ScheduleView>("list");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setDrawerOpen(true);
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

  return (
    <AppShell
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      privacyMode={privacyMode}
      onPrivacyToggle={setPrivacyMode}
      filters={filters}
      onFiltersChange={setFilters}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onSelectPatient={handleSelectPatient}
    >
      {viewMode === "list" ? (
        <PatientListView
          patients={filteredPatients}
          privacyMode={privacyMode}
          onSelectPatient={handleSelectPatient}
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
          onSelectPatient={handleSelectPatient}
        />
      )}

      <PatientDetailDrawer
        patient={selectedPatient}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </AppShell>
  );
}
