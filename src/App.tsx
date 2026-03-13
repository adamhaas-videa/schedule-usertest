import { useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import OperatoryGrid from "@/components/OperatoryGrid";
import RightNowView from "@/components/RightNowView";
import PatientDetailDrawer from "@/components/PatientDetailDrawer";
import { mockPatients } from "@/data/mockPatients";
import type { Patient } from "@/data/mockPatients";
import { getCurrentHour } from "@/lib/timeline";

export default function App() {
  const [viewMode, setViewMode] = useState<"rightnow" | "fullday">("rightnow");
  const [windowHour, setWindowHour] = useState(() => getCurrentHour());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [privacyMode, setPrivacyMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDrawerOpen(true);
  };

  return (
    <AppShell
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      privacyMode={privacyMode}
      onPrivacyToggle={setPrivacyMode}
      onSelectPatient={handleSelectPatient}
    >
      {viewMode === "rightnow" ? (
        <RightNowView
          patients={mockPatients}
          windowHour={windowHour}
          onWindowHourChange={setWindowHour}
          privacyMode={privacyMode}
          onSelectPatient={handleSelectPatient}
        />
      ) : (
        <OperatoryGrid
          scrollRef={scrollRef}
          patients={mockPatients}
          privacyMode={privacyMode}
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
