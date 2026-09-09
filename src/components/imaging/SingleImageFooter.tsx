import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FMX_BOTTOM_ROW,
  FMX_TALL_COLUMNS,
  FMX_TOP_ROW,
  VISIT_IMAGES,
} from "@/lib/fmxSeries";
import { cn } from "@/lib/utils";
import StripArrow from "./StripArrow";

/** Zoom slider bounds, shared with the viewer that owns the zoom state. */
export const ZOOM_MIN = 25;
export const ZOOM_MAX = 200;

interface SingleImageFooterProps {
  slot: number;
  slots: number[];
  /** Visit capture shown in the viewport, or null while a film is shown. */
  selectedVisitImageId: string | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onStep: (delta: number) => void;
  onSelectFilm: (slot: number) => void;
  onSelectVisitImage: (imageId: string) => void;
  onToggleExpand: () => void;
}

/** The three anterior films in each periapical row are mounted tall, so their
 *  thumbnails are narrower than the posteriors' in the 40px-tall strip. Derived
 *  from the mount definition so it stays right if the rows change. */
const TALL_SLOTS: ReadonlySet<number> = new Set(
  [FMX_TOP_ROW, FMX_BOTTOM_ROW].flatMap((row) =>
    row.filter((_, column) => FMX_TALL_COLUMNS.has(column))
  )
);

function NavArrow({
  direction,
  onClick,
}: {
  direction: -1 | 1;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={onClick}
      aria-label={direction < 0 ? "Previous image" : "Next image"}
      // Outlined teal chip on the viewer's near-black surround, 6px radius —
      // the primitive's icon-xs radius is 8px, so it's overridden here.
      className="rounded-sm border border-deep-teal-300 bg-background cursor-pointer"
    >
      <i
        className={cn(
          "text-base leading-none text-periwinkle-100",
          direction < 0 ? "fa-regular fa-angle-left" : "fa-regular fa-angle-right"
        )}
        aria-hidden
      />
    </Button>
  );
}

/** Shared shell so films and visit captures size and select identically. */
function Thumbnail({
  src,
  label,
  widthClass,
  active,
  onClick,
}: {
  src: string;
  label: string;
  widthClass: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "true" : undefined}
      data-active={active}
      className={cn(
        // The active image is ringed with an inset outline, not `ring-*`: the
        // strip is a scroll container (overflow-x-auto forces overflow-y to
        // match), so it clips a ring's top and bottom against the content edge
        // and leaves only the left/right segments showing in the gaps between
        // thumbnails. Outlines paint above child content, so this sits on the
        // image rather than under it.
        "h-10 shrink-0 overflow-hidden bg-black transition-opacity cursor-pointer",
        widthClass,
        active
          ? "outline-2 -outline-offset-2 outline-deep-teal-400"
          : "opacity-50 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      )}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="size-full object-cover"
      />
    </button>
  );
}

/**
 * Single-image viewer footer: the findings note on the left, the image stepper
 * plus the study's thumbnail strip in the middle, and zoom + Expand on the
 * right. Spans the full viewer width, extending under the toolbar rail. Sits
 * inside the `dark imaging-surface` root, so bg-card / border-border resolve to
 * the viewer's #101214 / #27272a.
 *
 * The strip carries the whole study — all 18 mount films, then the visit's pano
 * and intraoral photos — and any of them can be selected straight into the
 * viewport. That's more than fits, so it scrolls, the active thumbnail is kept
 * in view, and the flanking arrows page it the way the FMX footer's strip does.
 * The FMX footer shows only the non-FMX captures, since its grid already has
 * the films.
 *
 * Responsive tiers are container queries on the footer itself (its width is the
 * viewport minus the right panel, which collapses, so viewport breakpoints would
 * drift):
 *   ≥ 900px  thumbnail strip shown
 *   ≥ 760px  disclaimer line shown
 */
export default function SingleImageFooter({
  slot,
  slots,
  selectedVisitImageId,
  zoom,
  onZoomChange,
  onStep,
  onSelectFilm,
  onSelectVisitImage,
  onToggleExpand,
}: SingleImageFooterProps) {
  const index = slots.indexOf(slot);
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollStrip = (direction: -1 | 1) =>
    stripRef.current?.scrollBy({ left: direction * 180, behavior: "smooth" });

  // The study runs past the strip's width, so follow the selection — stepping
  // through films has to walk the strip along with it.
  useEffect(() => {
    stripRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [slot, selectedVisitImageId]);

  return (
    <TooltipProvider delay={150}>
      <footer className="@container/footer flex h-16 shrink-0 items-center gap-4 border-t border-border bg-card px-3">
        {/* Left — findings note. */}
        <div className="flex shrink-0 flex-col gap-1 text-[10px] leading-none text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span>11 Findings</span>
              <span>5 Hidden</span>
            </span>
            <Tooltip>
              <TooltipTrigger
                aria-label="About the findings count"
                className="inline-flex size-3 items-center justify-center rounded-full border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground cursor-default"
              >
                <i
                  className="fa-regular fa-circle-info text-xs leading-none"
                  aria-hidden
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                5 of 11 findings are hidden by the current display settings.
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="hidden truncate @min-[760px]/footer:inline">
            Visualization is intended for patient education.
          </span>
        </div>

        {/* Center — the film stepper, then the study. Takes the space the
            flanking blocks don't need, so the strip shows as many thumbnails as
            the footer allows. Films use the plain patient assets: the AI
            overlays aren't legible at 40px, so the strip stays independent of
            the AI / view toggles. */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-8">
          <div className="flex shrink-0 items-center justify-center gap-4">
            <NavArrow direction={-1} onClick={() => onStep(-1)} />
            <span className="flex items-center gap-1 text-sm leading-none text-zinc-300">
              <span>Image</span>
              <span className="tabular-nums">
                {index + 1}/{slots.length}
              </span>
            </span>
            <NavArrow direction={1} onClick={() => onStep(1)} />
          </div>

          <div className="hidden min-w-0 items-center gap-4 @min-[900px]/footer:flex">
            <StripArrow
              direction={-1}
              label="Scroll thumbnails left"
              onClick={() => scrollStrip(-1)}
            />
            <div
              ref={stripRef}
              className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]"
            >
              {slots.map((s) => (
                <Thumbnail
                  key={`film-${s}`}
                  src={`/xrays/slot-${String(s).padStart(2, "0")}.png`}
                  label={`Radiograph ${s}`}
                  widthClass={TALL_SLOTS.has(s) ? "w-[30px]" : "w-[53px]"}
                  active={selectedVisitImageId === null && s === slot}
                  onClick={() => onSelectFilm(s)}
                />
              ))}
              {VISIT_IMAGES.map((image) => (
                <Thumbnail
                  key={image.id}
                  src={image.src}
                  label={image.alt}
                  widthClass={image.kind === "pano" ? "w-[53px]" : "w-14"}
                  active={selectedVisitImageId === image.id}
                  onClick={() => onSelectVisitImage(image.id)}
                />
              ))}
            </div>
            <StripArrow
              direction={1}
              label="Scroll thumbnails right"
              onClick={() => scrollStrip(1)}
            />
          </div>
        </div>

        {/* Right — zoom, then Expand. */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-4 items-center gap-2 border-r border-zinc-600 pr-4">
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              aria-label="Zoom"
              className="zoom-slider w-24 cursor-pointer"
              style={
                {
                  "--zoom-fill": `${((zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100}%`,
                } as React.CSSProperties
              }
            />
            <span className="min-w-[26px] text-xs font-medium leading-none text-white tabular-nums">
              {zoom}%
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={onToggleExpand}
            // 8px radius per the design; the primitive's default is 10px.
            className="rounded-md text-foreground cursor-pointer"
          >
            <i className="fa-regular fa-expand text-base" aria-hidden />
            Expand
          </Button>
        </div>
      </footer>
    </TooltipProvider>
  );
}
