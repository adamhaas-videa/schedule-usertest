import { ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProviderColor } from "@/lib/providerColors";
import { cn } from "@/lib/utils";

export interface ProviderOption {
  id: string;
  name: string;
  role: string;
  initials: string;
}

interface ProviderMultiSelectProps {
  providers: ProviderOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function ProviderMultiSelect({
  providers,
  selected,
  onChange,
}: ProviderMultiSelectProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const valueLabel = (() => {
    if (selected.length === 0) return "All";
    if (selected.length === 1) {
      const only = providers.find((p) => p.id === selected[0]);
      return only ? only.name : "1 selected";
    }
    return `${selected.length} selected`;
  })();

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-input bg-card text-sm hover:bg-muted transition-colors cursor-pointer shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 max-w-[220px]">
        <span className="text-muted-foreground shrink-0">Providers:</span>
        <span className="font-medium text-foreground truncate">
          {valueLabel}
        </span>
        <ChevronDownIcon
          className="size-4 opacity-50 shrink-0 pointer-events-none"
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0 gap-0">
        <div className="px-2.5 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            All providers
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
        <div className="p-1 max-h-72 overflow-y-auto">
          {providers.map((p) => {
            const color = getProviderColor(p.id);
            const checked = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
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
                <Avatar
                  size="sm"
                  className="size-7 after:border-transparent shrink-0"
                  style={{ backgroundColor: color.bg }}
                >
                  <AvatarFallback
                    className="text-[11px] font-semibold"
                    style={{ backgroundColor: color.bg, color: color.fg }}
                  >
                    {p.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 min-w-0 text-sm text-foreground truncate">
                  {p.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {p.role}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
