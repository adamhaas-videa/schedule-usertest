import { cn } from "@/lib/utils";

import { Badge } from "./ui";

import { QUADRANTS } from "./constants";
import { Tooth } from "./Tooth";
import type {
  ChartMode,
  Quadrant,
  QuadrantData,
  QuadrantId,
  QuadrantState,
  ToothData,
  ToothNumber,
  ToothState,
} from "./types";

interface OdontogramProps {
  teeth: Map<ToothNumber, ToothData>;
  quadrants: Map<QuadrantId, QuadrantData>;
  activeTooth: ToothNumber | null;
  activeQuadrants: Set<QuadrantId>;
  chartMode: ChartMode;
  onChartModeChange: (mode: ChartMode) => void;
  onToothClick: (tooth: ToothNumber) => void;
  onQuadrantClick: (id: QuadrantId) => void;
}

const legendItems: Array<{ label: string; swatch: string }> = [
  {
    label: "Selected",
    swatch: "bg-[var(--color-periwinkle-500)]",
  },
  {
    label: "Treatment saved",
    swatch: "bg-[var(--color-deep-teal-500)]",
  },
  {
    label: "Unsaved treatment",
    swatch:
      "bg-black border-[1.5px] border-dashed border-[var(--stone-400)]",
  },
];

const quadrantStateClasses: Record<QuadrantState, string> = {
  normal:
    "border border-[var(--accent)] bg-transparent hover:bg-[color-mix(in_oklab,var(--accent)_30%,transparent)]",
  selected:
    "border-2 border-solid border-[var(--color-periwinkle-400)] bg-[var(--color-periwinkle-950)]",
  saved:
    "border-2 border-solid border-[var(--color-deep-teal-500)] bg-transparent",
  unsaved:
    "border-2 border-dashed border-[var(--stone-400)] bg-transparent",
};

function getToothState(
  tooth: ToothData | undefined,
  activeTooth: ToothNumber | null,
  number: ToothNumber,
): ToothState {
  if (activeTooth === number) {
    return "selected";
  }

  return tooth?.state ?? "normal";
}

function getQuadrantDisplayState(
  data: QuadrantData | undefined,
  isActive: boolean,
): QuadrantState {
  if (isActive) {
    return "selected";
  }

  return data?.state ?? "normal";
}

function ChartModeToggle({
  value,
  onValueChange,
}: {
  value: ChartMode;
  onValueChange: (value: ChartMode) => void;
}) {
  return (
    <div className="flex h-7 items-center gap-0 rounded-md bg-[#27272b] p-[2px]">
      {(["adult", "pediatric"] as const).map((mode) => {
        const active = mode === value;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onValueChange(mode)}
            className={[
              "flex h-full items-center justify-center rounded px-[21px] py-1 text-[12px] font-medium leading-none transition-colors",
              active
                ? "bg-[var(--popover)] text-[#fafafa]"
                : "text-[#a1a1aa] hover:text-[#fafafa]",
            ].join(" ")}
          >
            {mode === "adult" ? "Adult" : "Pediatric"}
          </button>
        );
      })}
    </div>
  );
}

function QuadrantRow({
  quadrants,
  quadrantData,
  activeQuadrants,
  teeth,
  activeTooth,
  onToothClick,
  onQuadrantClick,
}: {
  quadrants: Quadrant[];
  quadrantData: Map<QuadrantId, QuadrantData>;
  activeQuadrants: Set<QuadrantId>;
  teeth: Map<ToothNumber, ToothData>;
  activeTooth: ToothNumber | null;
  onToothClick: (tooth: ToothNumber) => void;
  onQuadrantClick: (id: QuadrantId) => void;
}) {
  return (
    <div className="flex w-full items-stretch gap-1">
      {quadrants.map((quadrant) => {
        const data = quadrantData.get(quadrant.id);
        const isActive = activeQuadrants.has(quadrant.id);
        const displayState = getQuadrantDisplayState(data, isActive);

        function handleQuadActivate() {
          onQuadrantClick(quadrant.id);
        }

        return (
          <div
            key={quadrant.id}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            aria-label={`Quadrant ${quadrant.id}, ${displayState}`}
            onClick={handleQuadActivate}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleQuadActivate();
              }
            }}
            className={cn(
              "group/quad flex flex-1 cursor-pointer items-center justify-between gap-1 rounded-sm px-6 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-periwinkle-400)]",
              quadrantStateClasses[displayState],
            )}
          >
            {quadrant.teeth.map((number) => (
              <div
                key={number}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                className="flex flex-1 justify-center"
              >
                <Tooth
                  arch={quadrant.arch}
                  number={number}
                  state={getToothState(
                    teeth.get(number),
                    activeTooth,
                    number,
                  )}
                  onClick={onToothClick}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function Odontogram({
  teeth,
  quadrants,
  activeTooth,
  activeQuadrants,
  chartMode,
  onChartModeChange,
  onToothClick,
  onQuadrantClick,
}: OdontogramProps) {
  const savedToothCount = Array.from(teeth.values()).filter(
    (tooth) => tooth.state === "saved",
  ).length;
  const savedQuadCount = Array.from(quadrants.values()).filter(
    (quad) => quad.state === "saved",
  ).length;
  const savedCount = savedToothCount + savedQuadCount;

  const [upperRight, upperLeft, lowerRight, lowerLeft] = QUADRANTS;

  return (
    <div className="w-full">
      <header className="flex items-center gap-4 border-b border-border p-4">
        <h2 className="text-[14px] font-semibold leading-none text-foreground">
          Chart
        </h2>
        <ChartModeToggle value={chartMode} onValueChange={onChartModeChange} />
        <div className="ml-auto">
          <Badge>{savedCount} added to report</Badge>
        </div>
      </header>

      <p className="px-6 pt-3 text-left text-[11px] leading-none text-[#71717a]">
        Click a tooth to assign treatment, or click a quadrant outline for arch-level treatments
      </p>

      <div className="flex w-full flex-col items-stretch gap-3 px-6 py-3">
        <div className="flex w-full flex-col items-stretch gap-1">
          <QuadrantRow
            quadrants={[upperRight, upperLeft]}
            quadrantData={quadrants}
            activeQuadrants={activeQuadrants}
            teeth={teeth}
            activeTooth={activeTooth}
            onToothClick={onToothClick}
            onQuadrantClick={onQuadrantClick}
          />
          <QuadrantRow
            quadrants={[lowerRight, lowerLeft]}
            quadrantData={quadrants}
            activeQuadrants={activeQuadrants}
            teeth={teeth}
            activeTooth={activeTooth}
            onToothClick={onToothClick}
            onQuadrantClick={onQuadrantClick}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {legendItems.map((item) => (
            <div className="flex items-center gap-2" key={item.label}>
              <span
                className={[
                  "h-[14px] w-[14px] shrink-0 rounded-sm",
                  item.swatch,
                ].join(" ")}
              />
              <span className="text-[11px] leading-none text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
