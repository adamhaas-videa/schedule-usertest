import { useState } from "react";
import videaLogoHoriz from "@/assets/icons/videa-horizontal-logo.svg";
import videaLogoVert from "@/assets/icons/videa-vert-logo.svg";
import { cn } from "@/lib/utils";

interface NavItem {
  key: string;
  label: string;
  iconClass: string;
  active?: boolean;
}

const primaryItems: NavItem[] = [
  { key: "schedule", label: "Schedule", iconClass: "fa-regular fa-calendar", active: true },
  { key: "voice-notes", label: "Voice Notes", iconClass: "fa-regular fa-microphone" },
  { key: "auto-verify", label: "AutoVerify", iconClass: "fa-regular fa-shield-check" },
  { key: "clean-claims", label: "Clean Claims", iconClass: "fa-regular fa-file-lines" },
];

const secondaryItems: NavItem[] = [
  { key: "insights", label: "Insights", iconClass: "fa-regular fa-chart-line" },
  { key: "engagement", label: "Engagement", iconClass: "fa-regular fa-gauge-high" },
];

function NavIcon({ item }: { item: NavItem }) {
  return (
    <i
      className={cn("w-5 h-5 text-center shrink-0", item.iconClass)}
      aria-hidden
    />
  );
}

function NavRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <button
      type="button"
      aria-current={item.active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group/nav flex w-full items-center rounded-md transition-all duration-200 ease-in-out overflow-hidden text-left",
        collapsed ? "justify-center h-9 p-2" : "gap-3 h-9 px-3",
        item.active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-item-hover hover:text-sidebar-item-hover-foreground"
      )}
    >
      <NavIcon item={item} />
      <span
        className={cn(
          "text-sm font-medium whitespace-nowrap transition-[opacity,max-width] duration-200 ease-in-out",
          collapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"
        )}
      >
        {item.label}
      </span>
    </button>
  );
}

export const SIDEBAR_EXPANDED_WIDTH = 202;
export const SIDEBAR_COLLAPSED_WIDTH = 56;


interface SidebarProps {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  const toggle = () => {
    const next = !collapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-[width] duration-200 ease-in-out"
      )}
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
      }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center shrink-0 h-14 overflow-hidden transition-all duration-200 ease-in-out",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        <img
          src={collapsed ? videaLogoVert : videaLogoHoriz}
          alt="Videa"
          className={cn(collapsed ? "h-10 w-10" : "h-8")}
        />
      </div>

      {/* Nav */}
      <nav
        className={cn(
          "flex-1 flex flex-col pt-4 overflow-y-auto overflow-x-hidden",
          collapsed ? "px-2" : "px-3"
        )}
      >
        <div className="flex flex-col gap-0.5">
          {primaryItems.map((item) => (
            <NavRow key={item.key} item={item} collapsed={collapsed} />
          ))}
        </div>

        <div
          className={cn("my-3 h-px bg-sidebar-border/70", collapsed && "mx-1")}
        />

        <div className="flex flex-col gap-0.5">
          {secondaryItems.map((item) => (
            <NavRow key={item.key} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* Collapse / expand toggle */}
      <div
        className={cn(
          "shrink-0 pb-3 pt-2",
          collapsed ? "px-2 flex justify-center" : "px-3 flex justify-end"
        )}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center justify-center rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-item-hover hover:text-sidebar-item-hover-foreground transition-colors",
            collapsed && "w-full"
          )}
        >
          <i
            className={cn(
              "text-base",
              collapsed
                ? "fa-regular fa-square-chevron-right"
                : "fa-regular fa-square-chevron-left"
            )}
            aria-hidden
          />
        </button>
      </div>
    </aside>
  );
}
