import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchField from "@/components/SearchField";
import PrivacyToggle from "@/components/PrivacyToggle";
import type { Patient } from "@/data/mockPatients";
import { DENTISTS, HYGIENISTS } from "@/data/mockPatients";
import type { ScheduleFilters, ScheduleView } from "@/App";
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

const OPERATORY_OPTIONS = [1, 2, 3, 4];

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
}: L2HeaderProps) {
  const filtersActive =
    filters.provider !== "all" || filters.operatory !== "all";

  const providerOptions = (() => {
    const seen = new Set<string>();
    const opts: Array<{ value: string; label: string }> = [
      { value: "all", label: "All" },
    ];
    for (const p of [...DENTISTS, ...HYGIENISTS]) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      opts.push({ value: p.id, label: p.name });
    }
    return opts;
  })();

  return (
    <div className="h-16 shrink-0 bg-card border-b border-border flex items-center gap-3 px-4 overflow-hidden">
      {/* View-mode segmented control (far left) */}
      <div className="flex w-fit items-center rounded-md shadow-xs shrink-0">
        <ViewModeButton
          active={viewMode === "list"}
          onClick={() => onViewModeChange("list")}
          icon="fa-regular fa-list"
          text="List"
          label="List view"
        />
        <ViewModeButton
          active={viewMode === "calendar"}
          onClick={() => onViewModeChange("calendar")}
          icon="fa-regular fa-calendar-days"
          text="Calendar"
          label="Calendar view"
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
        <FilterSelect
          label="Providers"
          value={filters.provider}
          onChange={(v) => onFiltersChange({ ...filters, provider: v })}
          options={providerOptions}
        />

        <FilterSelect
          label="Operatory"
          value={filters.operatory === "all" ? "all" : String(filters.operatory)}
          onChange={(v) =>
            onFiltersChange({
              ...filters,
              operatory: v === "all" ? "all" : Number(v),
            })
          }
          options={[
            { value: "all", label: "All" },
            ...OPERATORY_OPTIONS.map((op) => ({
              value: String(op),
              label: `${op}`,
            })),
          ]}
        />

        {filtersActive && (
          <button
            onClick={() =>
              onFiltersChange({
                provider: "all",
                operatory: "all",
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
        "inline-flex items-center justify-center h-8 text-sm font-medium whitespace-nowrap",
        "border border-input shadow-xs",
        "rounded-none first:rounded-l-md last:rounded-r-md",
        "border-l-0 first:border-l",
        "transition-[color,box-shadow] outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus:z-10 focus-visible:z-10",
        "w-8 px-0 md:w-auto md:min-w-8 md:px-2.5 md:gap-1.5",
        active
          ? "bg-accent text-accent-foreground"
          : "bg-transparent hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <i className={cn(icon, "w-4 h-4")} aria-hidden />
      <span className="hidden md:inline">{text}</span>
    </button>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <Select value={value} onValueChange={(v) => onChange(String(v))}>
      <SelectTrigger className="h-8 bg-card text-sm gap-1.5">
        <SelectValue>
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium text-foreground truncate">
            {current.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
