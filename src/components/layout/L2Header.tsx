import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import SearchField from "@/components/SearchField";
import PrivacyToggle from "@/components/PrivacyToggle";
import ProviderMultiSelect, {
  type ProviderOption,
} from "@/components/ProviderMultiSelect";
import OperatoryMultiSelect from "@/components/OperatoryMultiSelect";
import TreatmentMultiSelect from "@/components/TreatmentMultiSelect";
import { getAppointmentKind, type AppointmentKind } from "@/lib/appointmentColors";
import type { Patient } from "@/data/mockPatients";
import { ALL_OPERATORIES, DENTISTS, HYGIENISTS } from "@/data/mockPatients";
import type { ScheduleFilters, ScheduleView } from "@/types/clinical";
import { cn } from "@/lib/utils";

interface L2HeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  privacyMode: boolean;
  onPrivacyToggle: (enabled: boolean) => void;
  filters: ScheduleFilters;
  onFiltersChange: (filters: ScheduleFilters) => void;
  viewMode: ScheduleView;
  onViewModeChange: (mode: ScheduleView) => void;
  onSelectPatient: (patient: Patient) => void;
  /** Today's appointments, for the per-kind counts in the treatment filter. */
  patients: Patient[];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shiftDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function L2Header({
  selectedDate,
  onDateChange,
  privacyMode,
  onPrivacyToggle,
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  onSelectPatient,
  patients,
}: L2HeaderProps) {
  const filtersActive =
    filters.providers.length > 0 ||
    filters.operatories.length > 0 ||
    filters.treatments.length > 0;

  // Counted off the unfiltered day, so a kind's count doesn't collapse to zero
  // the moment you filter by a provider who isn't doing that work.
  const treatmentCounts = patients.reduce<Partial<Record<AppointmentKind, number>>>(
    (acc, p) => {
      const kind = getAppointmentKind(p.procedure);
      acc[kind] = (acc[kind] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const providerOptions: ProviderOption[] = (() => {
    const seen = new Set<string>();
    const opts: ProviderOption[] = [];
    for (const p of [...DENTISTS, ...HYGIENISTS]) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      opts.push({
        id: p.id,
        name: p.name,
        role: p.role,
        initials: p.initials,
      });
    }
    return opts;
  })();

  return (
    <div className="h-16 shrink-0 bg-card border-b border-border flex items-center gap-3 px-4 overflow-hidden">
      {/* View-mode segmented control (far left) */}
      <div className="flex h-8 w-fit shrink-0 items-center rounded-lg bg-zinc-200 p-1 dark:bg-zinc-800">
        <ViewModeButton
          active={viewMode === "calendar"}
          onClick={() => onViewModeChange("calendar")}
          icon="fa-regular fa-calendar-days"
          text="Calendar"
          label="Calendar view"
        />
        <ViewModeButton
          active={viewMode === "list"}
          onClick={() => onViewModeChange("list")}
          icon="fa-regular fa-list"
          text="List"
          label="List view"
        />
      </div>

      {/* Date — arrows + picker (≈212px) */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onDateChange(shiftDate(selectedDate, -1))}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Previous day"
        >
          <i className="fa-regular fa-angle-left text-xs" aria-hidden />
        </button>

        <Popover>
          <PopoverTrigger className="flex items-center gap-2 h-8 w-[140px] px-2.5 rounded-md border border-border bg-card hover:bg-muted transition-colors overflow-hidden cursor-pointer text-left">
            <i className="fa-regular fa-calendar text-foreground text-sm shrink-0" aria-hidden />
            <span className="flex-1 truncate text-sm text-foreground">
              {formatDate(selectedDate)}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) onDateChange(date);
              }}
            />
          </PopoverContent>
        </Popover>

        <button
          onClick={() => onDateChange(shiftDate(selectedDate, 1))}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Next day"
        >
          <i className="fa-regular fa-angle-right text-xs" aria-hidden />
        </button>
      </div>

      {/* Search — flexes to fill, shrinking so the right cluster always fits */}
      <div className="flex-1 min-w-[160px] max-w-[240px]">
        <SearchField onSelectPatient={onSelectPatient} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 shrink-0">
        <ProviderMultiSelect
          providers={providerOptions}
          selected={filters.providers}
          onChange={(ids) => onFiltersChange({ ...filters, providers: ids })}
        />

        <OperatoryMultiSelect
          options={ALL_OPERATORIES}
          selected={filters.operatories}
          onChange={(ops) => onFiltersChange({ ...filters, operatories: ops })}
        />

        <TreatmentMultiSelect
          selected={filters.treatments}
          counts={treatmentCounts}
          onChange={(kinds) =>
            onFiltersChange({ ...filters, treatments: kinds })
          }
        />

        {filtersActive && (
          <button
            onClick={() =>
              onFiltersChange({
                providers: [],
                operatories: [],
                treatments: [],
              })
            }
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Clear filters"
            title="Clear filters"
          >
            <i className="fa-regular fa-xmark text-xs" aria-hidden />
          </button>
        )}
      </div>

      {/* Privacy switch — flush right */}
      <div className="ml-auto shrink-0">
        <PrivacyToggle enabled={privacyMode} onToggle={onPrivacyToggle} />
      </div>
    </div>
  );
}

interface ViewModeButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  text: string;
  label: string;
}

function ViewModeButton({
  active,
  onClick,
  icon,
  text,
  label,
}: ViewModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium leading-none whitespace-nowrap outline-none transition-colors",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <i className={cn(icon, "text-[12px] leading-none")} aria-hidden />
      <span>{text}</span>
    </button>
  );
}

