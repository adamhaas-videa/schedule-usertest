import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import L1Header from "./L1Header";
import L2Header from "./L2Header";
import type { Patient } from "@/data/mockPatients";

interface AppShellProps {
  children: ReactNode;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: "rightnow" | "fullday";
  onViewModeChange: (mode: "rightnow" | "fullday") => void;
  privacyMode: boolean;
  onPrivacyToggle: (enabled: boolean) => void;
  onSelectPatient: (patient: Patient) => void;
}

export default function AppShell({
  children,
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  privacyMode,
  onPrivacyToggle,
  onSelectPatient,
}: AppShellProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((prev) => !prev)}
      />
      <div
        className="flex-1 flex flex-col min-w-0 transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: sidebarExpanded ? 208 : 56 }}
      >
        <L1Header />
        <L2Header
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          privacyMode={privacyMode}
          onPrivacyToggle={onPrivacyToggle}
          onSelectPatient={onSelectPatient}
        />
        <main className="flex-1 bg-gray-100 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
