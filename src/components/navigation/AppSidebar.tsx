import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import videaLogoHoriz from "@/assets/icons/videa-horizontal-logo.svg";
import videaLogoVert from "@/assets/icons/videa-vert-logo.svg";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAiView } from "@/context/AiViewContext";
import { getNavEntries } from "@/lib/navVersions";
import { type ProductNavItem } from "./products";

export const SIDEBAR_EXPANDED_WIDTH = 220;
export const SIDEBAR_COLLAPSED_WIDTH = 56;

const PRACTICE_NAME = "Vista Dental Studio";
const PRACTICE_INITIALS = "VD";

const footerNav = [
  { key: "help", label: "Help", iconClass: "fa-regular fa-circle-question" },
  {
    key: "learning",
    label: "Learning Center",
    iconClass: "fa-regular fa-book-open",
  },
  { key: "settings", label: "Settings", iconClass: "fa-regular fa-gear" },
] as const;

const accountMenuItems = [
  { key: "language", label: "Language", iconClass: "fa-regular fa-language" },
  { key: "about", label: "About", iconClass: "fa-regular fa-file-lines" },
  {
    key: "privacy",
    label: "Privacy Policy",
    iconClass: "fa-regular fa-user-shield",
  },
] as const;

function sidebarItemClass(collapsed: boolean, active: boolean) {
  return cn(
    "group/nav flex w-full items-center rounded-lg transition-all duration-200 ease-in-out overflow-hidden text-left cursor-pointer",
    collapsed ? "justify-center h-9 p-2" : "gap-3 h-9 px-3 py-2",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-item-hover hover:text-sidebar-item-hover-foreground"
  );
}

function NavRow({
  item,
  collapsed,
  active,
  onSelect,
}: {
  item: ProductNavItem;
  collapsed: boolean;
  active: boolean;
  onSelect: (path: string) => void;
}) {
  const { IconComponent } = item;
  const locked = Boolean(item.locked);
  return (
    <button
      type="button"
      onClick={() => onSelect(item.path)}
      aria-current={active ? "page" : undefined}
      aria-label={
        collapsed
          ? locked
            ? `${item.label} (not purchased)`
            : item.label
          : undefined
      }
      title={
        collapsed
          ? locked
            ? `${item.label} (not purchased)`
            : item.label
          : undefined
      }
      className={sidebarItemClass(collapsed, active)}
    >
      <span className="flex items-center justify-center shrink-0 size-5">
        {IconComponent ? (
          <IconComponent className="size-5" />
        ) : (
          <i className={cn("text-base text-center", item.iconClass)} aria-hidden />
        )}
      </span>
      <span
        className={cn(
          "text-sm font-medium whitespace-nowrap transition-[opacity,max-width] duration-200 ease-in-out",
          collapsed
            ? "max-w-0 opacity-0"
            : locked
              ? "min-w-0 flex-1 truncate opacity-100"
              : "max-w-[150px] opacity-100"
        )}
      >
        {item.label}
      </span>
      {locked && !collapsed && (
        <span className="ml-auto flex size-4 shrink-0 items-center justify-center">
          <i
            className="fa-regular fa-lock text-[13px] text-center"
            aria-hidden
          />
        </span>
      )}
    </button>
  );
}

function FooterRow({
  label,
  iconClass,
  collapsed,
}: {
  label: string;
  iconClass: string;
  collapsed: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      className={sidebarItemClass(collapsed, false)}
    >
      <span className="flex items-center justify-center shrink-0 size-5">
        <i className={cn("text-base text-center", iconClass)} aria-hidden />
      </span>
      <span
        className={cn(
          "text-sm font-medium whitespace-nowrap transition-[opacity,max-width] duration-200 ease-in-out",
          collapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
        )}
      >
        {label}
      </span>
    </button>
  );
}

function PracticeAvatar() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-periwinkle-200 text-sm font-semibold leading-5 text-deep-teal-700">
      {PRACTICE_INITIALS}
    </span>
  );
}

function AccountMenu({ collapsed }: { collapsed: boolean }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={PRACTICE_NAME}
        title={collapsed ? PRACTICE_NAME : undefined}
        className={cn(
          "flex items-center rounded-lg text-left cursor-pointer transition-all duration-200 ease-in-out overflow-hidden",
          "text-sidebar-foreground hover:bg-sidebar-item-hover hover:text-sidebar-item-hover-foreground",
          "aria-expanded:bg-sidebar-item-hover aria-expanded:text-sidebar-item-hover-foreground",
          collapsed ? "justify-center size-8" : "w-full gap-2 p-2"
        )}
      >
        <PracticeAvatar />
        <span
          className={cn(
            "min-w-0 flex-1 text-sm font-medium leading-none truncate transition-[opacity,max-width] duration-200 ease-in-out",
            collapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
          )}
        >
          {PRACTICE_NAME}
        </span>
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center transition-[opacity,width] duration-200 ease-in-out",
            collapsed ? "w-0 opacity-0 overflow-hidden" : "opacity-100"
          )}
        >
          <i
            className="fa-regular fa-angles-up-down text-base text-center"
            aria-hidden
          />
        </span>
      </PopoverTrigger>
      <PopoverContent
        side={collapsed ? "right" : "top"}
        align={collapsed ? "end" : "start"}
        sideOffset={8}
        className="w-56 gap-0 overflow-hidden rounded-lg p-1"
      >
        <div className="flex h-11 items-center gap-2 rounded-lg px-2 py-1.5">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {PRACTICE_NAME}
          </p>
          <Button variant="outline" size="xs" type="button">
            Change
          </Button>
        </div>
        <div className="mx-px my-1 h-px bg-border" />
        {accountMenuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className="flex h-7 w-full max-h-7 items-center gap-1.5 overflow-hidden rounded-lg px-2 py-1 text-left text-sm text-popover-foreground hover:bg-muted cursor-pointer"
          >
            <span className="flex size-4 shrink-0 items-center justify-center">
              <i className={cn("text-base text-center", item.iconClass)} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </button>
        ))}
        <div className="mx-px my-1 h-px bg-border" />
        <button
          type="button"
          className="flex h-7 w-full max-h-7 items-center gap-1.5 overflow-hidden rounded-lg px-2 py-1 text-left text-sm text-popover-foreground hover:bg-muted cursor-pointer"
        >
          <span className="flex size-4 shrink-0 items-center justify-center">
            <i
              className="fa-regular fa-arrow-right-from-bracket text-base text-center"
              aria-hidden
            />
          </span>
          <span className="min-w-0 flex-1 truncate">Log out</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}

interface AppSidebarProps {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function AppSidebar({
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
}: AppSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const navigate = useNavigate();
  const location = useLocation();
  const { navVersion } = useAiView();
  const navEntries = getNavEntries(navVersion);

  const toggle = () => {
    const next = !collapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  return (
    <aside
      className="relative flex flex-col h-screen shrink-0 bg-sidebar border-r border-border transition-[width] duration-200 ease-in-out"
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
      }}
    >
      {/* Header / logo */}
      <div
        className={cn(
          "flex items-center shrink-0 h-14 overflow-hidden transition-all duration-200 ease-in-out",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        <img
          src={collapsed ? videaLogoVert : videaLogoHoriz}
          alt="Videa"
          className={cn(collapsed ? "h-8 w-8" : "h-8")}
        />
      </div>

      {/* Nav — lifted above the click-to-toggle overlay via z-20 so item clicks
          navigate rather than toggling the sidebar. */}
      <nav
        className={cn(
          "flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden",
          collapsed ? "px-2" : "px-3"
        )}
      >
        <div className="relative z-20 flex flex-col gap-1 pt-2">
          {navEntries.map((entry) => {
            if (entry.type === "label") {
              if (collapsed) return null;
              return (
                <div
                  key={entry.key}
                  className="px-3 py-2 text-[12px] font-normal leading-none uppercase tracking-wide text-muted-foreground"
                >
                  {entry.label}
                </div>
              );
            }
            if (entry.type === "divider") {
              return (
                <div key={entry.key} className="px-3 py-1">
                  <div className="h-px w-full bg-border" />
                </div>
              );
            }
            const active =
              location.pathname === entry.path ||
              location.pathname.startsWith(entry.path + "/");
            return (
              <NavRow
                key={entry.key}
                item={entry}
                collapsed={collapsed}
                active={active}
                onSelect={(path) => navigate(path)}
              />
            );
          })}
        </div>
      </nav>

      <div
        className={cn(
          "relative z-20 shrink-0 flex flex-col",
          collapsed ? "items-center gap-1 px-2 pb-4" : "gap-2 p-2"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-1",
            collapsed ? "items-center" : "w-full"
          )}
        >
          {footerNav.map((item) => (
            <FooterRow
              key={item.key}
              label={item.label}
              iconClass={item.iconClass}
              collapsed={collapsed}
            />
          ))}
        </div>
        <AccountMenu collapsed={collapsed} />
      </div>

      {/* Full-surface overlay — clicking chrome (logo, padding, empty space)
          toggles collapse/expand. col-resize cursor signals that this is a
          resize/toggle affordance, not a link. Extends a few pixels past the
          right edge so the seam itself is hoverable. Sits below nav/footer
          (z-20), above everything else (z-10). */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-0 left-0 bottom-0 z-10 cursor-col-resize outline-none"
        style={{ right: collapsed ? "-8px" : "-6px" }}
      />
    </aside>
  );
}
