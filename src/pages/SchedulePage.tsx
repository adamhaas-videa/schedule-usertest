import { useCallback, useMemo, useState, useRef } from "react";
import { useNowMinutes } from "@/lib/useNowMinutes";
import { useNavigate } from "react-router-dom";
import L1Header from "@/components/layout/L1Header";
import L2Header from "@/components/layout/L2Header";
import OperatoryGrid from "@/components/OperatoryGrid";
import PatientListView from "@/components/PatientListView";
import PatientDetailDrawer from "@/components/PatientDetailDrawer";
import { getEnrichedPatients } from "@/lib/patients";
import { ALL_OPERATORIES, type Patient } from "@/data/mockPatients";
import {
  CLINICAL_TAB_PATH,
  type ClinicalTab,
  type ScheduleFilters,
  type ScheduleView,
} from "@/types/clinical";
import { DEFAULT_CARD_VERSION, type CardVersion } from "@/lib/cardVersions";
import { useAiView } from "@/context/AiViewContext";

const INITIAL_FILTERS: ScheduleFilters = {
  providers: [],
  operatories: [],
};

export default function SchedulePage() {
  const navigate = useNavigate();
  const { privacyMode, setPrivacyMode } = useAiView();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<ScheduleFilters>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<ScheduleView>("calendar");
  const [cardVersion, setCardVersion] = useState<CardVersion>(
    DEFAULT_CARD_VERSION
  );
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
      return true;
    });
  }, [patients, filters]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <L1Header
        cardVersion={cardVersion}
        onCardVersionChange={setCardVersion}
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
            nowMinutes={nowMinutes}
          />
        )}
      </main>

      <PatientDetailDrawer
        patient={selectedPatient}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        patients={filteredPatients}
        onPatientChange={setSelectedPatient}
        onOpenClinical={handleOpenClinical}
      />
    </div>
  );
}
