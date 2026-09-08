import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Patient } from "@/data/mockPatients";
import { FMX_SERIES, VISIT_IMAGES, type FmxSeries } from "@/lib/fmxSeries";
import { cn } from "@/lib/utils";

interface FmxFooterProps {
  patient: Patient;
  series: FmxSeries;
  onSeriesChange: (series: FmxSeries) => void;
}

/** "2026-03-12" → "03/12/2026". The study bar shows the same date as MM/DD/YY. */
function formatVisitDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border border-white px-px text-[10px] font-semibold leading-none tracking-[-0.3px] text-white tabular-nums">
      {count}
    </span>
  );
}

function StripArrow({
  direction,
  onClick,
}: {
  direction: -1 | 1;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction < 0 ? "Previous visit images" : "Next visit images"}
      className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
    >
      <i
        className={cn(
          "text-base leading-none",
          direction < 0 ? "fa-regular fa-angle-left" : "fa-regular fa-angle-right"
        )}
        aria-hidden
      />
    </button>
  );
}

/**
 * FMX viewer footer: visit context on the left, the visit's other captures in
 * the middle, and Sort + the FMX / BW / PA series toggles on the right. Sits
 * inside the `dark imaging-surface` root, so bg-card / border-border resolve
 * to the viewer's #101214 / #27272a.
 */
export default function FmxFooter({
  patient,
  series,
  onSeriesChange,
}: FmxFooterProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollStrip = (direction: -1 | 1) =>
    stripRef.current?.scrollBy({ left: direction * 60, behavior: "smooth" });

  return (
    <TooltipProvider delay={150}>
      <footer className="grid h-16 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 border-t border-border bg-card px-3">
        {/* Left — visit context */}
        <div className="flex min-w-0 flex-col gap-1 text-[10px] leading-none text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">
              Visit Date: {formatVisitDate(patient.appointmentDate)}
            </span>
            <Tooltip>
              <TooltipTrigger
                aria-label="About the visit date"
                className="inline-flex size-3 items-center justify-center rounded-full border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground cursor-default"
              >
                <i
                  className="fa-regular fa-circle-info text-xs leading-none"
                  aria-hidden
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                Date these images were captured.
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="truncate">
            Visualization is intended for patient education.
          </span>
        </div>

        {/* Center — other captures from this visit. The footer spans the 72px
            toolbar rail, so shift by half of it to centre the strip over the
            film viewport, as in the design. */}
        <div className="flex translate-x-9 items-center gap-4">
          <StripArrow direction={-1} onClick={() => scrollStrip(-1)} />
          <div
            ref={stripRef}
            className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]"
          >
            {VISIT_IMAGES.map((img) => (
              <img
                key={img.id}
                src={img.src}
                alt={img.alt}
                draggable={false}
                className="h-[42px] w-14 shrink-0 bg-black object-cover"
              />
            ))}
          </div>
          <StripArrow direction={1} onClick={() => scrollStrip(1)} />
        </div>

        {/* Right — sort + series */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" className="text-foreground cursor-pointer">
            <i className="fa-regular fa-arrows-cross text-base" aria-hidden />
            Sort
          </Button>
          <div
            role="radiogroup"
            aria-label="Image series"
            className="flex items-center gap-2"
          >
            {FMX_SERIES.map((s) => {
              const selected = s.id === series;
              return (
                <Button
                  key={s.id}
                  variant="ghost"
                  role="radio"
                  aria-checked={selected}
                  title={s.title}
                  onClick={() => onSeriesChange(s.id)}
                  className={cn(
                    "text-foreground cursor-pointer",
                    selected &&
                      "border-input bg-white/[0.08] text-accent-foreground hover:bg-white/[0.12] hover:text-accent-foreground"
                  )}
                >
                  {s.label}
                  <CountBadge count={s.slots.length} />
                </Button>
              );
            })}
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
}
