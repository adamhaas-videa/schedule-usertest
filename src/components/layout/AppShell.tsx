import { useState, type ReactNode } from "react";
import Sidebar, {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
} from "./Sidebar";
import L1Header from "./L1Header";
import L2Header from "./L2Header";
import type { Patient } from "@/data/mockPatients";
import type { ScheduleFilters, ScheduleView } from "@/App";

interface AppShellProps {
  children: ReactNode;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  privacyMode: boolean;
  onPrivacyToggle: (enabled: boolean) => void;
  filters: ScheduleFilters;
  onFiltersChange: (filters: ScheduleFilters) => void;
  viewMode: ScheduleView;
  onViewModeChange: (mode: ScheduleView) => void;
  onSelectPatient: (patient: Patient) => void;
}

export default function AppShell({
  children,
  selectedDate,
  onDateChange,
  privacyMode,
  onPrivacyToggle,
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  onSelectPatient,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_EXPANDED_WIDTH;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div
        className="flex-1 flex flex-col min-w-0 transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <L1Header />
        <L2Header
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          privacyMode={privacyMode}
          onPrivacyToggle={onPrivacyToggle}
          filters={filters}
          onFiltersChange={onFiltersChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onSelectPatient={onSelectPatient}
        />
        <main className="flex-1 bg-background overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
