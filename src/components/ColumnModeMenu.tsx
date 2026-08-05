import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ColumnMode = "operatory" | "provider";

const OPTIONS: {
  id: ColumnMode;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: "operatory",
    label: "Operatory",
    icon: "fa-regular fa-chair",
    desc: "One column per chair",
  },
  {
    id: "provider",
    label: "Provider",
    icon: "fa-regular fa-user-doctor",
    desc: "One column per provider",
  },
];

interface ColumnModeMenuProps {
  value: ColumnMode;
  onChange: (mode: ColumnMode) => void;
}

// Selector that lives in the timeline gutter (next to Op 1) and swaps how the
// schedule columns are grouped: by operatory (default) or by provider.
export default function ColumnModeMenu({
  value,
  onChange,
}: ColumnModeMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground transition-colors cursor-pointer"
        aria-label="Change column grouping"
        title="Column view"
      >
        <i className="fa-regular fa-columns-3 text-base" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-56 gap-1 p-1.5">
        <div className="px-2 pt-1 pb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Group columns by
        </div>
        {OPTIONS.map((o) => {
          const selected = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors",
                selected ? "bg-accent" : "hover:bg-muted"
              )}
            >
              <i
                className={cn(
                  o.icon,
                  "text-sm w-4 text-center shrink-0",
                  selected ? "text-accent-foreground" : "text-muted-foreground"
                )}
                aria-hidden
              />
              <span className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium text-foreground leading-tight">
                  {o.label}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {o.desc}
                </span>
              </span>
              {selected && (
                <i
                  className="fa-solid fa-check text-primary text-[10px] ml-auto"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
