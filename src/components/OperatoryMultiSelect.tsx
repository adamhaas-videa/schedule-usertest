import { ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface OperatoryMultiSelectProps {
  options: number[];
  selected: number[];
  onChange: (ops: number[]) => void;
}

export default function OperatoryMultiSelect({
  options,
  selected,
  onChange,
}: OperatoryMultiSelectProps) {
  const toggle = (op: number) => {
    if (selected.includes(op)) {
      onChange(selected.filter((s) => s !== op));
    } else {
      onChange([...selected, op].sort((a, b) => a - b));
    }
  };

  const valueLabel = (() => {
    if (selected.length === 0) return "All";
    if (selected.length === 1) return `Op ${selected[0]}`;
    return `${selected.length} selected`;
  })();

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-input bg-card text-sm hover:bg-muted transition-colors cursor-pointer shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
        <span className="text-muted-foreground shrink-0">Operatory:</span>
        <span className="font-medium text-foreground truncate">
          {valueLabel}
        </span>
        <ChevronDownIcon
          className="size-4 opacity-50 shrink-0 pointer-events-none"
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-0 gap-0">
        <div className="px-2.5 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            All operatories
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
        <div className="p-1">
          {options.map((op) => {
            const checked = selected.includes(op);
            return (
              <button
                key={op}
                type="button"
                onClick={() => toggle(op)}
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
                    <i className="fa-solid fa-check text-[9px]" aria-hidden />
                  )}
                </span>
                <span className="flex-1 min-w-0 text-sm text-foreground">
                  Op {op}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
