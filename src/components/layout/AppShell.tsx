import { type ReactNode } from "react";
import Sidebar, {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
} from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  activeNav: string;
  onNavigate: (key: string) => void;
}

export default function AppShell({
  children,
  collapsed,
  onCollapsedChange,
  activeNav,
  onNavigate,
}: AppShellProps) {
  const sidebarWidth = collapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_EXPANDED_WIDTH;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={onCollapsedChange}
        activeKey={activeNav}
        onNavigate={onNavigate}
      />
      <div
        className="flex-1 flex flex-col min-w-0 transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </div>
    </div>
  );
}
