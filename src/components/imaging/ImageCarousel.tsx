import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  open: boolean;
  slots: number[];
  currentSlot: number;
  onSelect: (slot: number) => void;
  onClose: () => void;
}

/** Canva-style dark image selector docked above the footer. Horizontal filmstrip
 *  of every radiograph in the series; the active image is outlined. */
export default function ImageCarousel({
  open,
  slots,
  currentSlot,
  onSelect,
  onClose,
}: ImageCarouselProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 bg-card/95 backdrop-blur border-t border-border">
      <div className="flex items-center justify-between px-4 pt-2.5">
        <span className="text-xs font-medium text-muted-foreground">
          All images · {slots.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image selector"
          className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <i className="fa-regular fa-xmark" aria-hidden />
        </button>
      </div>
      <div className="flex items-center gap-2.5 overflow-x-auto px-4 py-3">
        {slots.map((slot) => {
          const active = slot === currentSlot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelect(slot)}
              className={cn(
                "group relative shrink-0 h-[72px] w-[96px] overflow-hidden rounded-md bg-black transition-all cursor-pointer",
                active
                  ? "ring-2 ring-deep-teal-400"
                  : "ring-1 ring-zinc-700 hover:ring-zinc-500"
              )}
            >
              <img
                src={`/xrays/slot-${String(slot).padStart(2, "0")}.png`}
                alt={`Radiograph ${slot}`}
                className="size-full object-cover"
                draggable={false}
              />
              <span
                className={cn(
                  "absolute left-1 top-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-semibold",
                  active ? "bg-deep-teal-500 text-white" : "bg-black/70 text-zinc-200"
                )}
              >
                {slot}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
