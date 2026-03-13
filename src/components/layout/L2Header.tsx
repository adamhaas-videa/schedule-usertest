import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import SearchField from "@/components/SearchField";
import PrivacyToggle from "@/components/PrivacyToggle";
import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";

interface L2HeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: "rightnow" | "fullday";
  onViewModeChange: (mode: "rightnow" | "fullday") => void;
  privacyMode: boolean;
  onPrivacyToggle: (enabled: boolean) => void;
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

export default function L2Header({
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  privacyMode,
  onPrivacyToggle,
  onSelectPatient,
}: L2HeaderProps) {
  return (
    <div className="h-[72px] bg-white border-b border-slate-200 flex items-center gap-6 px-4 overflow-hidden">
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onDateChange(shiftDate(selectedDate, -1))}
          className="flex items-center justify-center w-10 h-10 rounded-md border border-zinc-200 bg-transparent hover:bg-gray-50 transition-colors"
        >
          <i className="fa-regular fa-chevron-left text-foreground text-xs" />
        </button>

        <Popover>
          <PopoverTrigger
            className="flex items-center gap-2 h-10 w-[160px] px-4 py-2 rounded-md border border-zinc-200 bg-white hover:bg-gray-50 transition-colors overflow-hidden cursor-pointer"
          >
            <i className="fa-regular fa-calendar text-foreground text-sm shrink-0" />
            <span className="text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
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
          className="flex items-center justify-center w-10 h-10 rounded-md border border-zinc-200 bg-transparent hover:bg-gray-50 transition-colors"
        >
          <i className="fa-regular fa-chevron-right text-foreground text-xs" />
        </button>
      </div>

      <SearchField onSelectPatient={onSelectPatient} />

      {/* View mode toggle */}
      <div className="flex items-center bg-white rounded-lg p-0.5 shrink-0">
        <button
          onClick={() => onViewModeChange("rightnow")}
          className={cn(
            "flex items-center gap-2 h-10 px-3 rounded-md text-sm font-medium transition-colors",
            viewMode === "rightnow"
              ? "bg-[#EEF4FF] text-deep-teal"
              : "text-deep-teal/70 hover:bg-gray-50"
          )}
        >
          <i className="fa-regular fa-clock text-base" />
          Right Now
        </button>
        <button
          onClick={() => onViewModeChange("fullday")}
          className={cn(
            "flex items-center gap-2 h-10 px-3 rounded-md text-sm font-medium transition-colors",
            viewMode === "fullday"
              ? "bg-[#EEF4FF] text-deep-teal"
              : "text-deep-teal/70 hover:bg-gray-50"
          )}
        >
          <i className="fa-regular fa-calendar-day text-base" />
          Full Day
        </button>
      </div>

      <PrivacyToggle enabled={privacyMode} onToggle={onPrivacyToggle} />
    </div>
  );
}
