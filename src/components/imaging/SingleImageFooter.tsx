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
  INTRAORAL_PHOTOS,
} from "@/lib/fmxSeries";
import { cn } from "@/lib/utils";

/** Zoom slider bounds, shared with the viewer that owns the zoom state. */
export const ZOOM_MIN = 25;
export const ZOOM_MAX = 200;

interface SingleImageFooterProps {
  slot: number;
  slots: number[];
  /** Photo shown in the viewport, or null while the radiograph is shown. */
  selectedPhotoId: string | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onStep: (delta: number) => void;
  onSelectPhoto: (photoId: string | null) => void;
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

/** Shared shell so the film and photo thumbnails size and select identically. */
function Thumbnail({
  src,
  label,
  widthClass,
  selected,
  onClick,
}: {
  src: string;
  label: string;
  widthClass: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        // Every thumbnail stays at full brightness: this is a selector between
        // the film and its photos, not a carousel, so the carousel's dimming of
        // the inactive frames doesn't apply. The selected one is ringed instead.
        //
        // The ring is an inset outline, not `ring-*`. The strip is a scroll
        // container (overflow-x-auto forces overflow-y to match), so it clips a
        // ring's top and bottom against the 40px content edge and leaves only
        // the left/right segments showing in the gaps between thumbnails. An
        // inset outline stays inside the button, and outlines paint above child
        // content, so it sits on the image rather than under it.
        "h-10 shrink-0 overflow-hidden bg-black cursor-pointer",
        widthClass,
        selected
          ? "outline-2 -outline-offset-2 outline-deep-teal-400"
          : "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
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
 * plus the current film and its intraoral photos in the middle, and zoom +
 * Expand on the right. Spans the full viewer width, extending under the toolbar
 * rail. Sits inside the `dark imaging-surface` root, so bg-card / border-border
 * resolve to the viewer's #101214 / #27272a.
 *
 * The thumbnails are a selector between the film on screen and the photos taken
 * of the same area — not a carousel of the study. Stepping through the 18 films
 * is the stepper's job; the FMX footer's strip is what browses the mount.
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
  selectedPhotoId,
  zoom,
  onZoomChange,
  onStep,
  onSelectPhoto,
  onToggleExpand,
}: SingleImageFooterProps) {
  const index = slots.indexOf(slot);

  return (
    <TooltipProvider delay={150}>
      <footer className="@container/footer flex h-16 shrink-0 items-center justify-between gap-4 border-t border-border bg-card px-3">
        {/* Left — findings note. min-w-0 lets it give way first as the footer
            narrows; the stepper and zoom controls stay intact. */}
        <div className="flex min-w-0 flex-col gap-1 text-[10px] leading-none text-muted-foreground">
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

        {/* Center — the film stepper, then the current film and the photos of
            the same area. Films use the plain patient assets: the AI overlays
            aren't legible at 40px, so the strip stays independent of the AI /
            view toggles. It scrolls if a region ever carries enough photos to
            overflow — reuse the FMX footer's StripArrow if that stops being
            rare enough to handle with a scroll. */}
        <div className="flex shrink-0 items-center gap-8">
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

          <div className="hidden shrink-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] @min-[900px]/footer:flex">
            <Thumbnail
              src={`/xrays/slot-${String(slot).padStart(2, "0")}.png`}
              label={`Radiograph ${slot}`}
              widthClass={TALL_SLOTS.has(slot) ? "w-[30px]" : "w-[53px]"}
              selected={selectedPhotoId === null}
              onClick={() => onSelectPhoto(null)}
            />
            {INTRAORAL_PHOTOS.map((photo) => (
              <Thumbnail
                key={photo.id}
                src={photo.src}
                label={photo.alt}
                widthClass="w-14"
                selected={selectedPhotoId === photo.id}
                onClick={() => onSelectPhoto(photo.id)}
              />
            ))}
          </div>
        </div>

        {/* Right — zoom, then Expand. min-w-fit keeps the controls intact. */}
        <div className="flex min-w-fit items-center gap-2">
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
