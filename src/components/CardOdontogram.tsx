import { useLayoutEffect, useRef, useState } from "react";
import { PreviewCard } from "@base-ui/react/preview-card";
import Odontogram from "@/components/Odontogram";
import Chiclet from "@/components/OpportunityChiclet";
import type { PatientSummary } from "@/data/patientSummary";
import { DENSITY } from "@/lib/odontogram";
import { cn } from "@/lib/utils";

// Fit a fixed-size subtree into whatever box the parent gives it, by transform
// rather than by re-laying-out. The odontogram is a stack of absolutely
// positioned SVG layers at hand-tuned pixel offsets, so scaling it any other
// way would pull the condition marks off their teeth. A transform keeps the
// artwork crisp and keeps every tooth's hit area in proportion, so the hover
// tooltips still land.
function ScaleToFit({
  naturalWidth,
  naturalHeight,
  className,
  style,
  children,
}: {
  naturalWidth: number;
  naturalHeight: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  // 0 until measured: the card's wrapper sets content-visibility:auto, so an
  // off-screen card has no layout box yet and would otherwise flash the chart
  // at full size before the first measurement lands.
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      // clientWidth/Height, not getBoundingClientRect: the V7 flyout scales
      // itself while it animates open, and a rect read mid-transition would
      // lock the chart in at the animation's scale.
      const { clientWidth: width, clientHeight: height } = el;
      if (width <= 0 || height <= 0) return;
      const next = Math.min(width / naturalWidth, height / naturalHeight);
      setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [naturalWidth, naturalHeight]);

  return (
    <div ref={boxRef} className={cn("relative", className)} style={style}>
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: naturalWidth,
          height: naturalHeight,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const COMPACT = DENSITY.compact;
const FULL = DENSITY.default;

/**
 * V6 — the odontogram inline on the card, filling whatever height is left
 * between the insurance row and the action bar.
 */
export function InlineCardOdontogram({
  summary,
  className,
}: {
  summary: PatientSummary;
  className?: string;
}) {
  return (
    <ScaleToFit
      naturalWidth={COMPACT.width}
      naturalHeight={COMPACT.height}
      className={cn("min-h-0 flex-1 overflow-hidden", className)}
    >
      <Odontogram
        density="compact"
        findings={summary.findings}
        unscheduledTx={summary.unscheduledTx}
      />
    </ScaleToFit>
  );
}

// Wide enough that the chart reads at roughly three-quarter size — noticeably
// wider than an operatory column, which is the point of floating it out.
const FLYOUT_WIDTH = 360;
const FLYOUT_PAD = 12;
const CHART_WIDTH = FLYOUT_WIDTH - FLYOUT_PAD * 2;
const CHART_HEIGHT = (FULL.height * CHART_WIDTH) / FULL.width;

/**
 * V7 — a teeth chip beside the perio chip. Hovering (or focusing) it floats the
 * AI opportunities section out beside the column: counts over the full chart,
 * the same pairing the summary slideout shows.
 */
export function OdontogramFlyout({
  summary,
  patientName,
}: {
  summary: PatientSummary;
  patientName: string;
}) {
  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger
        // Quick to open so it feels like a hover affordance rather than a
        // preview link, but slow enough to close that you can cross the gap
        // into the flyout and hover a tooth.
        delay={120}
        closeDelay={200}
        aria-label={`AI opportunities for ${patientName}`}
        onClick={(event: React.MouseEvent) => event.stopPropagation()}
        render={<button type="button" />}
        className={cn(
          "inline-flex size-5 shrink-0 cursor-default items-center justify-center rounded-full border-0 p-0",
          "bg-periwinkle-100 text-periwinkle-700 transition-colors",
          "hover:bg-periwinkle-200 data-[popup-open]:bg-periwinkle-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        )}
      >
        <i className="fa-solid fa-teeth text-[10px] leading-none" aria-hidden />
      </PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner
          side="inline-end"
          align="center"
          sideOffset={10}
          collisionPadding={12}
          // Above the now-line (z-20) and the card's own bottom-pinned action
          // strip, and out of the operatory column's paint containment.
          className="isolate z-50"
        >
          <PreviewCard.Popup
            onClick={(event: React.MouseEvent) => event.stopPropagation()}
            style={{ width: FLYOUT_WIDTH }}
            className={cn(
              "flex origin-(--transform-origin) flex-col gap-2 rounded-xl bg-popover p-3 text-popover-foreground",
              "ring-1 ring-foreground/10 outline-hidden",
              // Wide, soft spread so the flyout reads as floating well above
              // the grid rather than sitting on the next column.
              "shadow-[0_24px_60px_-12px_rgb(0_0_0/0.28),0_8px_24px_-8px_rgb(0_0_0/0.18)]",
              // Grows out of the chip rather than popping: `transition` in
              // Tailwind v4 covers opacity, translate and scale, which is what
              // the data-starting/ending-style pairs below move. Positioner
              // reports a logical side because `side` is logical, so the slide
              // direction follows the flip.
              "transition duration-200 ease-out",
              "data-starting-style:opacity-0 data-ending-style:opacity-0",
              "data-starting-style:scale-[0.97] data-ending-style:scale-[0.97]",
              "data-[side=inline-end]:data-starting-style:-translate-x-2",
              "data-[side=inline-end]:data-ending-style:-translate-x-2",
              "data-[side=inline-start]:data-starting-style:translate-x-2",
              "data-[side=inline-start]:data-ending-style:translate-x-2"
            )}
          >
            <div className="text-[12px] leading-none text-muted-foreground uppercase">
              AI opportunities
            </div>
            {summary.opportunities.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {summary.opportunities.map((opportunity) => (
                  <Chiclet key={opportunity.label}>
                    {opportunity.count} {opportunity.label}
                  </Chiclet>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No opportunities detected
              </div>
            )}
            <ScaleToFit
              naturalWidth={FULL.width}
              naturalHeight={FULL.height}
              style={{ height: CHART_HEIGHT }}
              className="w-full"
            >
              <Odontogram
                findings={summary.findings}
                unscheduledTx={summary.unscheduledTx}
              />
            </ScaleToFit>
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}
