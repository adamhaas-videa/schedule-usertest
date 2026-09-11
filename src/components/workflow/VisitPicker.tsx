import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Patient } from "@/data/mockPatients";
import type { ClinicalTab } from "@/types/clinical";
import {
  formatRelative,
  formatShortDate,
  getVisitMenu,
  parseISODate,
  type Visit,
  type VisitChip,
} from "@/lib/visitHistory";
import { cn } from "@/lib/utils";

interface VisitPickerProps {
  patient: Patient;
  activeTab: ClinicalTab;
  /** Trigger prefix from the study bar — "Images from", "Chart from", … */
  label: string;
  /** The imaging bar is dark; the other workflow bars are light. The menu is
   *  portalled out of the surface, so it carries `dark` itself. */
  dark?: boolean;
}

/** Metadata chip under a visit date: "4 BW", "1 note", "Stage 3". */
function Chip({ chip, dark }: { chip: VisitChip; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-[14px] shrink-0 items-center rounded-[3px] px-1.5 text-[10px] font-medium leading-none",
        chip.accent
          ? dark
            ? "bg-deep-teal-400/30 text-[#A5E8F7]"
            : "bg-accent-muted-hover text-deep-teal-700"
          : dark
            ? // Chips lift with the row they sit on, as in the light spec.
              "bg-white/10 text-zinc-300 group-hover/row:bg-white/15"
            : "bg-zinc-100 text-zinc-600 group-hover/row:bg-white"
      )}
    >
      {chip.label}
    </span>
  );
}

function VisitRow({
  visit,
  current,
  dark,
  onSelect,
}: {
  visit: Visit;
  current: boolean;
  dark?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={current}
      disabled={visit.pending}
      onClick={onSelect}
      className={cn(
        "group/row flex w-full flex-col gap-[3px] rounded-md px-1.5 py-1 text-left outline-none",
        "focus-visible:ring-[1.5px]",
        dark
          ? "focus-visible:ring-deep-teal-300"
          : "focus-visible:ring-deep-teal-700",
        visit.pending
          ? "cursor-default"
          : cn("cursor-pointer", dark ? "hover:bg-white/8" : "hover:bg-accent")
      )}
    >
      <span className="flex items-center gap-1.5 text-sm leading-tight">
        <span
          className={cn(
            "font-semibold",
            visit.pending
              ? "text-muted-foreground"
              : dark
                ? "text-zinc-50"
                : "text-foreground"
          )}
        >
          {formatShortDate(visit.date)}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {visit.pending ? "still uploading" : formatRelative(visit.date)}
        </span>
        {current && (
          <i
            className={cn(
              "fa-regular fa-check ml-auto text-sm",
              dark ? "text-zinc-50" : "text-deep-teal-700"
            )}
            aria-hidden
          />
        )}
      </span>
      {visit.chips.length > 0 && (
        <span className="flex flex-wrap items-center gap-1">
          {visit.chips.map((chip) => (
            <Chip key={chip.label} chip={chip} dark={dark} />
          ))}
        </span>
      )}
    </button>
  );
}

/**
 * The study bar's visit picker: a date trigger that opens the patient's visit
 * history for the active tab. Each row is date · relative time over that
 * visit's metadata chips, with a check on the loaded date.
 *
 * Selecting a visit only moves the loaded date — there is no second study to
 * load in the mock data, so the surface behind the bar doesn't change.
 */
export default function VisitPicker({
  patient,
  activeTab,
  label,
  dark = false,
}: VisitPickerProps) {
  const menu = useMemo(
    () => getVisitMenu(patient, activeTab),
    [patient, activeTab]
  );
  const loadable = useMemo(
    () => menu.groups.flatMap((g) => g.visits).filter((v) => !v.pending),
    [menu]
  );

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(
    () => loadable[0]?.date ?? parseISODate(patient.appointmentDate)
  );

  // One date on file is nothing to pick between: the chevron goes and the
  // trigger stops being clickable.
  const enabled = loadable.length > 1;
  const muted = dark ? "text-zinc-400" : "text-muted-foreground";

  return (
    <div className="flex items-center gap-2.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={!enabled}
          className={cn(
            // -ml-1.5 cancels the pill's own padding so the calendar icon stays
            // on the bar's left margin and only the hover fill bleeds outward.
            "-ml-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 text-sm outline-none transition-colors",
            enabled ? "cursor-pointer" : "cursor-default",
            enabled
              ? dark
                ? cn("text-zinc-50 hover:bg-white/8", open && "bg-white/15")
                : cn(
                    "text-foreground hover:bg-zinc-100",
                    open && "bg-accent text-accent-foreground hover:bg-accent"
                  )
              : muted
          )}
        >
          <i className="fa-regular fa-calendar-days text-base" aria-hidden />
          <span>
            {label} {formatShortDate(selected)}
          </span>
          {enabled && (
            <i
              className={cn(
                "text-base",
                open ? "fa-regular fa-angle-up" : "fa-regular fa-angle-down"
              )}
              aria-hidden
            />
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className={cn(
            "w-72 gap-0 rounded-xl p-1 shadow-lg",
            // Portalled outside the imaging surface, so the dark palette has to
            // travel with the popup.
            dark && "dark"
          )}
        >
          {menu.header && (
            <div className="px-1.5 pt-1 pb-1.5 text-[11px] text-muted-foreground">
              {menu.header}
            </div>
          )}
          <div
            role="menu"
            aria-label="Visit history"
            className="max-h-[min(60vh,22rem)] overflow-y-auto"
          >
            {menu.groups.map((group, index) => (
              <div key={group.label ?? index}>
                {index > 0 && <div className="-mx-1 my-1 border-t border-border" />}
                {group.label && (
                  <div className="px-1.5 pt-1 pb-1.5 text-[11px] text-muted-foreground">
                    {group.label}
                  </div>
                )}
                {group.visits.map((visit) => (
                  <VisitRow
                    key={visit.date.toISOString()}
                    visit={visit}
                    current={visit.date.getTime() === selected.getTime()}
                    dark={dark}
                    onSelect={() => {
                      setSelected(visit.date);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <span className={cn("text-sm", muted)}>·</span>
      <span className={cn("text-sm", muted)}>{formatRelative(selected)}</span>
    </div>
  );
}
