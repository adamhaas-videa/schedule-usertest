import { useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import TimelineScrubber from "@/components/TimelineScrubber";
import OperatoryGrid from "@/components/OperatoryGrid";
import RightNowView from "@/components/RightNowView";
import PatientDetailDrawer from "@/components/PatientDetailDrawer";
import { mockPatients } from "@/data/mockPatients";
import type { Patient } from "@/data/mockPatients";

export default function App() {
  const [viewMode, setViewMode] = useState<"rightnow" | "fullday">("rightnow");
  const [windowHour, setWindowHour] = useState(9);
  const [snapshotTime, setSnapshotTime] = useState(9 * 60 + 30);
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
        <div className="h-full flex flex-col">
          <div className="shrink-0 h-3" />
          <div className="flex-1 min-h-0 relative">
            <TimelineScrubber
              snapshotTime={snapshotTime}
              onTimeChange={setSnapshotTime}
              scrollContainerRef={scrollRef}
            />
            <div className="absolute left-[88px] right-3 top-1/2 z-10 pointer-events-none border-t-2 border-dashed border-periwinkle" />
            <OperatoryGrid
              scrollRef={scrollRef}
              patients={mockPatients}
              viewMode={viewMode}
              snapshotTime={snapshotTime}
              privacyMode={privacyMode}
              onSelectPatient={handleSelectPatient}
              onScrollTimeChange={setSnapshotTime}
            />
          </div>
        </div>
      )}

      <PatientDetailDrawer
        patient={selectedPatient}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </AppShell>
  );
}
