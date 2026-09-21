import { useCallback, useMemo, useState, useRef } from "react";
import { useNowMinutes } from "@/lib/useNowMinutes";
import { useAppNavigate } from "@/lib/useAppNavigate";
import L1Header from "@/components/layout/L1Header";
import L2Header from "@/components/layout/L2Header";
import OperatoryGrid from "@/components/OperatoryGrid";
import PatientListView from "@/components/PatientListView";
import PatientSummaryPanel from "@/components/PatientSummaryPanel";
import { getEnrichedPatients } from "@/lib/patients";
import {
  ALL_OPERATORIES,
  timeToMinutes,
  type Patient,
} from "@/data/mockPatients";
import {
  CLINICAL_TAB_PATH,
  type ClinicalTab,
  type ScheduleFilters,
  type ScheduleView,
} from "@/types/clinical";
import { useAiView } from "@/context/AiViewContext";
import { getAppointmentKind } from "@/lib/appointmentColors";

const INITIAL_FILTERS: ScheduleFilters = {
  providers: [],
  operatories: [],
  treatments: [],
};

export default function SchedulePage() {
  const navigate = useAppNavigate();
  const { privacyMode, setPrivacyMode, cardVersion, summaryVersion } =
    useAiView();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ScheduleFilters>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<ScheduleView>("calendar");
  const scrollRef = useRef<HTMLDivElement>(null);
  const nowMinutes = useNowMinutes();

  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setDrawerOpen(true);
  }, []);

  const handleOpenClinical = useCallback(
    (patient: Patient, tab: ClinicalTab) => {
      navigate(`/patient/${patient.id}/${CLINICAL_TAB_PATH[tab]}`);
    },
    [navigate]
  );

  const patients = useMemo(
    () =>
      getEnrichedPatients(nowMinutes).filter((p) =>
        ALL_OPERATORIES.includes(p.operatory)
      ),
    [nowMinutes]
  );

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
      if (
        filters.treatments.length > 0 &&
        !filters.treatments.includes(getAppointmentKind(p.procedure))
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
        const next = (index + delta + stepOrder.length) % stepOrder.length;
        return stepOrder[next];
      });
    },
    [stepOrder]
  );

  return (
    <div className="flex flex-col h-full min-h-0">
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
        patients={patients}
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
            nowMinutes={nowMinutes}
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
    </div>
  );
}
