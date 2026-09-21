import { ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  APPOINTMENT_FAMILY_LABELS,
  APPOINTMENT_KIND_GROUPS,
  APPOINTMENT_KIND_LABELS,
  getKindColor,
  type AppointmentKind,
} from "@/lib/appointmentColors";
import { cn } from "@/lib/utils";

interface TreatmentMultiSelectProps {
  selected: AppointmentKind[];
  onChange: (kinds: AppointmentKind[]) => void;
  /** How many of today's appointments fall in each kind, for the row counts. */
  counts?: Partial<Record<AppointmentKind, number>>;
}

/**
 * Filters the schedule by procedure kind. The options are the same taxonomy
 * that colors the cards (`AppointmentKind`), listed under their family and
 * carrying the family's swatch, so a selection here reads back on the board.
 *
 * The full taxonomy always shows, matching how Operatory lists every chair
 * whether or not it is booked — a kind with nothing on today is dimmed rather
 * than dropped, so the list does not reshuffle as you move between days.
 */
export default function TreatmentMultiSelect({
  selected,
  onChange,
  counts,
}: TreatmentMultiSelectProps) {
  const toggle = (kind: AppointmentKind) => {
    if (selected.includes(kind)) {
      onChange(selected.filter((k) => k !== kind));
    } else {
      onChange([...selected, kind]);
    }
  };

  const valueLabel = (() => {
    if (selected.length === 0) return "All";
    if (selected.length === 1) return APPOINTMENT_KIND_LABELS[selected[0]];
    return `${selected.length} selected`;
  })();

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-input bg-card text-sm hover:bg-muted transition-colors cursor-pointer shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 max-w-[220px]">
        <span className="text-muted-foreground shrink-0">Treatment:</span>
        <span className="font-medium text-foreground truncate">
          {valueLabel}
        </span>
        <ChevronDownIcon
          className="size-4 opacity-50 shrink-0 pointer-events-none"
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0 gap-0">
        <div className="px-2.5 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            All treatments
          </span>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="max-h-[320px] overflow-y-auto p-1">
          {APPOINTMENT_KIND_GROUPS.map(({ family, kinds }) => (
            <div key={family} className="mb-1 last:mb-0">
              <div className="px-1.5 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {APPOINTMENT_FAMILY_LABELS[family]}
              </div>
              {kinds.map((kind) => {
                const checked = selected.includes(kind);
                const count = counts?.[kind] ?? 0;
                const empty = counts !== undefined && count === 0;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => toggle(kind)}
                    aria-pressed={checked}
                    className="w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-md hover:bg-accent text-left cursor-pointer"
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center size-4 rounded border transition-colors shrink-0",
                        checked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-card"
                      )}
                    >
                      {checked && (
                        <i
                          className="fa-solid fa-check text-[9px]"
                          aria-hidden
                        />
                      )}
                    </span>
                    <span
                      className="size-2.5 rounded-sm shrink-0 border"
                      style={{
                        backgroundColor: getKindColor(kind).bg,
                        borderColor: getKindColor(kind).border,
                      }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "flex-1 min-w-0 truncate text-sm",
                        empty ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {APPOINTMENT_KIND_LABELS[kind]}
                    </span>
                    {counts !== undefined && (
                      <Badge
                        variant={empty ? "outline" : "secondary"}
                        className={cn(
                          "min-w-5 shrink-0 px-1.5 tabular-nums",
                          empty && "text-muted-foreground"
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
