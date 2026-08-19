import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CHART_VERSIONS, type ChartVersion } from "@/lib/chartVersions";
import { cn } from "@/lib/utils";

interface ChartVersionMenuProps {
  value: ChartVersion;
  onChange: (version: ChartVersion) => void;
}

export default function ChartVersionMenu({
  value,
  onChange,
}: ChartVersionMenuProps) {
  const active = CHART_VERSIONS.find((v) => v.id === value) ?? CHART_VERSIONS[0];

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-2 h-8 pl-2 pr-2.5 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer">
        <i className="fa-regular fa-table text-muted-foreground text-[13px]" aria-hidden />
        <span className="text-muted-foreground">Chart demo</span>
        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded bg-secondary text-secondary-foreground text-[11px] font-semibold tabular-nums">
          {active.label}
        </span>
        <i className="fa-regular fa-chevron-down text-muted-foreground text-[10px]" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-1 p-1.5">
        <div className="px-2 pt-1.5 pb-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Patient chart version
          </div>
          <div className="text-[11px] text-muted-foreground/80">
            Prototype product tiers — schedule only
          </div>
        </div>
        {CHART_VERSIONS.map((v) => {
          const selected = v.id === value;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange(v.id)}
              className={cn(
                "w-full text-left flex items-start gap-2.5 rounded-md px-2 py-2 transition-colors",
                selected ? "bg-accent" : "hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded text-[11px] font-semibold tabular-nums shrink-0",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {v.label}
              </span>
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground leading-tight">
                  {v.title}
                  {selected && (
                    <i
                      className="fa-solid fa-check text-primary text-[10px]"
                      aria-hidden
                    />
                  )}
                </span>
                <span className="text-[12px] leading-snug text-muted-foreground">
                  {v.description}
                </span>
              </span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
