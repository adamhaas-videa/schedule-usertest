import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useImagingToolbar } from "@/context/ImagingToolbarContext";
import type { ToolbarMenuId } from "@/lib/imagingToolbar";
import type { IconState } from "./toolbarIcons";

export type { IconState } from "./toolbarIcons";

export interface ToolbarItem {
  key: string;
  label: ReactNode;
  /** Font Awesome class for a glyph icon. */
  iconClass?: string;
  /** Icon font-size in px (FA glyphs). Defaults to 16. */
  iconSizePx?: number;
  /** Custom icon renderer; receives the current visual state. Overrides iconClass. */
  renderIcon?: (state: IconState) => ReactNode;
  active?: boolean;
  hasSubmenu?: boolean;
  submenu?: ReactNode;
  /** Anchor the L2 flyout to the top (default) or bottom of the L1 trigger. */
  submenuAlign?: "start" | "end";
  onClick?: () => void;
}

/** Grouped AI + Patient/Clinical toggle cluster, wrapped in the unified frame. */
export interface AiClusterEntry {
  kind: "ai-cluster";
  ai: ToolbarItem;
  patient: ToolbarItem;
  clinical: ToolbarItem;
  /** When false, the Patient/Clinical toggle is dimmed and non-interactive. */
  toggleEnabled: boolean;
}

export type ToolbarEntry = ToolbarItem | AiClusterEntry;

// "Cyan Signal" dark-mode scheme. The toolbar background stays #101214 (bg-card);
// only icon, active-selection fill, and text colors change. Hover and active share
// ONE look — the teal-tinted fill plus a hairline cyan ring — so hovering previews
// exactly what selecting looks like. `rest` is the only calm/default state.
const FILL_ON = "#123138";
const RING_ON =
  "inset 0 0 0 1px rgba(78,206,234,0.55), 0 0 12px rgba(78,206,234,0.18)";
const ICON_REST = "#8b949c";
const ICON_ON = "#eafdff";
const LABEL_REST = "#7e878f";
const LABEL_ON = "#c9f2fa";

function isCluster(entry: ToolbarEntry): entry is AiClusterEntry {
  return (entry as AiClusterEntry).kind === "ai-cluster";
}

function ToolbarButton({
  item,
  isOpen,
  setOpen,
}: {
  item: ToolbarItem;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = !!item.active || isOpen;
  // Hover and active are one and the same visual state — hovering previews the fill.
  const on = active || hovered;
  const state: IconState = on ? "active" : "rest";

  const bg = on ? FILL_ON : "transparent";
  const labelColor = on ? LABEL_ON : LABEL_REST;
  const iconColor = on ? ICON_ON : ICON_REST;

  return (
    <div
      className="relative flex w-full flex-col items-center gap-[6px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => {
          if (item.hasSubmenu) {
            setOpen(!isOpen);
          } else {
            item.onClick?.();
          }
        }}
        className="flex size-8 items-center justify-center rounded transition-[background-color,box-shadow] duration-150 cursor-pointer"
        style={{ backgroundColor: bg, boxShadow: on ? RING_ON : undefined }}
      >
        <span
          className="flex items-center justify-center leading-none"
          style={{ color: iconColor, fontSize: item.iconSizePx ?? 16 }}
        >
          {item.renderIcon ? (
            item.renderIcon(state)
          ) : (
            <i className={item.iconClass} aria-hidden />
          )}
        </span>
      </button>

      <div className="flex items-center gap-[2px]">
        <span
          className="text-[9.5px] font-medium leading-tight text-center whitespace-nowrap"
          style={{ color: labelColor }}
        >
          {item.label}
        </span>
        {item.hasSubmenu && (
          <i
            className="fa-regular fa-angle-right text-[8px]"
            style={{ color: labelColor }}
            aria-hidden
          />
        )}
      </div>

      {isOpen && item.submenu && (
        <div
          className={cn(
            // Toolbar has px-1; +4px lands the L2 on the rail's outer edge.
            "absolute left-[calc(100%+4px)] z-40 overflow-visible",
            item.submenuAlign === "end" ? "bottom-0" : "top-0"
          )}
        >
          <div className="rounded-md bg-[#212734] p-1.5">
            {item.submenu}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Canva-style vertical imaging toolbar. The AI / Patient / Clinical items render
 * inside a unified bordered wrapper (matching Figma 65:1090): AI on top, then a
 * nested black wrapper holding the Patient ⇄ Clinical toggle. The toggle dims
 * and disables when AI is off, since the two image sets only exist under AI.
 */
export default function ImagingToolbar({ items }: { items: ToolbarEntry[] }) {
  const { openMenu, setOpenMenu } = useImagingToolbar();

  const renderItem = (item: ToolbarItem) => (
    <ToolbarButton
      key={item.key}
      item={item}
      isOpen={openMenu === item.key}
      setOpen={(open) =>
        setOpenMenu(open ? (item.key as ToolbarMenuId) : null)
      }
    />
  );

  return (
    <div className="relative shrink-0 h-full w-[72px] bg-card flex flex-col items-center gap-4 px-1 py-4 z-20">
      {items.map((entry) => {
        if (isCluster(entry)) {
          return (
            <div
              key="ai-cluster"
              className="flex w-[56px] flex-col items-center gap-2 rounded-md border border-[#17282d] p-1 pt-2"
            >
              {renderItem(entry.ai)}
              <div
                className={cn(
                  "flex w-full flex-col items-center gap-3 rounded-md bg-black py-1.5 transition-opacity",
                  !entry.toggleEnabled && "pointer-events-none opacity-40"
                )}
              >
                {renderItem(entry.patient)}
                {renderItem(entry.clinical)}
              </div>
            </div>
          );
        }
        return renderItem(entry);
      })}
    </div>
  );
}
