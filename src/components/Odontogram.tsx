import type {
  CompletedTreatment,
  ToothFinding,
  ToothMark,
  UnscheduledTx,
} from "@/data/patientSummary";
import { HOVER_RECOMMENDATION } from "@/data/patientSummary";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DENSITY,
  Q1,
  Q2,
  Q3,
  Q4,
  type Arch,
  type OdontogramDensity,
  type OdontogramMetrics,
  type ToothSpec,
} from "@/lib/odontogram";
import { formatShortDate } from "@/lib/visitHistory";
import { cn } from "@/lib/utils";

// Condition overlays, exported from the same Figma file as the silhouettes in
// `@/lib/odontogram`. Do not hand-edit these: re-export from Figma instead.
import markCrownUpper from "@/assets/odontogram/mark-crown-upper.svg";
import markCrownLower from "@/assets/odontogram/mark-crown-lower.svg";
import markFilling from "@/assets/odontogram/mark-filling.svg";
import markIncipient from "@/assets/odontogram/mark-incipient.svg";
import markExtraction from "@/assets/odontogram/mark-extraction.svg";
import markImplantPost from "@/assets/odontogram/mark-implant-post.svg";
import markImplantAbutment from "@/assets/odontogram/mark-implant-abutment.svg";
import markImplantThread from "@/assets/odontogram/mark-implant-thread.svg";
import markRootCanal from "@/assets/odontogram/mark-root-canal.svg";
import markCrownUpperRaw from "@/assets/odontogram/mark-crown-upper.svg?raw";
import markCrownLowerRaw from "@/assets/odontogram/mark-crown-lower.svg?raw";
import markFillingRaw from "@/assets/odontogram/mark-filling.svg?raw";
import markIncipientRaw from "@/assets/odontogram/mark-incipient.svg?raw";
import markExtractionRaw from "@/assets/odontogram/mark-extraction.svg?raw";
import markImplantPostRaw from "@/assets/odontogram/mark-implant-post.svg?raw";
import markImplantAbutmentRaw from "@/assets/odontogram/mark-implant-abutment.svg?raw";
import markImplantThreadRaw from "@/assets/odontogram/mark-implant-thread.svg?raw";
import markRootCanalRaw from "@/assets/odontogram/mark-root-canal.svg?raw";

// Completed work reuses the condition artwork recoloured to the light blue of
// `--color-odontogram-completed` (keep the two in step). The marks are baked
// in the AI palette — indigo, with slate on the upper crown and implant parts —
// so both are swapped in the source rather than masked or filtered at paint
// time, which Chrome struggles with across a zoomed chart.
const COMPLETED_FILL = "#9DB6F0";

function tint(raw: string): string {
  const svg = raw.replace(/#4338CA|#334155/gi, COMPLETED_FILL);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const COMPLETED_SRC: Record<string, string> = {
  [markCrownUpper]: tint(markCrownUpperRaw),
  [markCrownLower]: tint(markCrownLowerRaw),
  [markFilling]: tint(markFillingRaw),
  [markIncipient]: tint(markIncipientRaw),
  [markExtraction]: tint(markExtractionRaw),
  [markImplantPost]: tint(markImplantPostRaw),
  [markImplantAbutment]: tint(markImplantAbutmentRaw),
  [markImplantThread]: tint(markImplantThreadRaw),
  [markRootCanal]: tint(markRootCanalRaw),
};

interface MarkLayer {
  src: string;
  // Percentage insets inside the tooth box, in `top right bottom left` order.
  inset: [string, string, string, string];
  transform?: string;
}

// Marks are positioned per arch because the two arches are drawn in opposite
// orientations: upper teeth sit root-up (crown at the bottom of the box), lower
// teeth crown-up. The upper values are lifted from teeth 3 and 14 in the design,
// the lower ones from teeth 19, 29, 30, 31 and 32.
const MARKS: Record<Arch, Record<ToothMark, MarkLayer[]>> = {
  upper: {
    crown: [{ src: markCrownUpper, inset: ["58.63%", "0", "0", "0"] }],
    filling: [{ src: markFilling, inset: ["58%", "17%", "10%", "17%"] }],
    incipient: [
      {
        src: markIncipient,
        inset: ["68.7%", "74.5%", "11.6%", "0"],
        transform: "rotate(180deg)",
      },
      {
        src: markIncipient,
        inset: ["68.7%", "0", "11.6%", "73.4%"],
        transform: "rotate(180deg) scaleX(-1)",
      },
    ],
    extraction: [
      { src: markExtraction, inset: ["52%", "24.3%", "14%", "24.3%"] },
    ],
    implant: [
      { src: markImplantPost, inset: ["0", "28.35%", "55.61%", "28.35%"] },
      {
        src: markImplantAbutment,
        inset: ["42.77%", "10.03%", "41.37%", "10.03%"],
      },
      { src: markImplantThread, inset: ["6.46%", "18.78%", "81.37%", "18.78%"] },
      {
        src: markImplantThread,
        inset: ["16.39%", "18.78%", "71.45%", "18.78%"],
      },
      {
        src: markImplantThread,
        inset: ["25.76%", "18.78%", "62.08%", "18.78%"],
      },
      { src: markCrownUpper, inset: ["58.63%", "0", "0", "0"] },
    ],
    "root-canal": [
      { src: markRootCanal, inset: ["26%", "52%", "18%", "8%"] },
      {
        src: markRootCanal,
        inset: ["26%", "8%", "18%", "52%"],
        transform: "scaleX(-1)",
      },
    ],
  },
  lower: {
    crown: [{ src: markCrownLower, inset: ["1.1%", "2.6%", "70.79%", "2.9%"] }],
    filling: [{ src: markFilling, inset: ["10%", "17%", "58%", "17%"] }],
    incipient: [
      {
        src: markIncipient,
        inset: ["9.85%", "64.82%", "74.94%", "4.82%"],
        transform: "rotate(180deg)",
      },
      {
        src: markIncipient,
        inset: ["9.85%", "5.2%", "74.89%", "61.82%"],
        transform: "rotate(180deg) scaleX(-1)",
      },
    ],
    extraction: [
      { src: markExtraction, inset: ["14%", "24.3%", "52%", "24.3%"] },
    ],
    implant: [
      { src: markImplantPost, inset: ["55.61%", "28.35%", "0", "28.35%"] },
      {
        src: markImplantAbutment,
        inset: ["41.37%", "10.03%", "42.77%", "10.03%"],
      },
      { src: markImplantThread, inset: ["81.37%", "18.78%", "6.46%", "18.78%"] },
      {
        src: markImplantThread,
        inset: ["71.45%", "18.78%", "16.39%", "18.78%"],
      },
      {
        src: markImplantThread,
        inset: ["62.08%", "18.78%", "25.76%", "18.78%"],
      },
      { src: markCrownLower, inset: ["1.1%", "2.6%", "70.79%", "2.9%"] },
    ],
    "root-canal": [
      { src: markRootCanal, inset: ["18%", "52%", "26%", "8%"] },
      {
        src: markRootCanal,
        inset: ["18%", "8%", "26%", "52%"],
        transform: "scaleX(-1)",
      },
    ],
  },
};

const MARK_LABEL: Record<ToothMark, string> = {
  crown: "crown",
  filling: "filling",
  incipient: "incipient lesion",
  extraction: "extraction",
  implant: "implant",
  "root-canal": "root canal",
};

function layerBox(layer: MarkLayer): React.CSSProperties {
  return {
    top: layer.inset[0],
    right: layer.inset[1],
    bottom: layer.inset[2],
    left: layer.inset[3],
    transform: layer.transform,
  };
}

function ToothVisual({
  spec,
  mark,
  completedMark,
  arch,
}: {
  spec: ToothSpec;
  mark?: ToothMark;
  /** Completed work, in the light-blue copy of the mark artwork. An AI mark on
   *  the same tooth takes precedence. */
  completedMark?: ToothMark;
  arch: Arch;
}) {
  const layers = mark ? MARKS[arch][mark] : [];
  const completedLayers = completedMark && !mark ? MARKS[arch][completedMark] : [];
  return (
    <>
      <img
        alt=""
        aria-hidden
        src={spec.src}
        className="absolute inset-0 block size-full max-w-none"
      />
      {completedLayers.map((layer, i) => (
        <div key={`done-${i}`} className="absolute" style={layerBox(layer)}>
          <img
            alt=""
            aria-hidden
            src={COMPLETED_SRC[layer.src] ?? layer.src}
            className="absolute inset-0 block size-full max-w-none"
          />
        </div>
      ))}
      {layers.map((layer, i) => (
        <div
          key={i}
          className="absolute"
          style={layerBox(layer)}
        >
          <img
            alt=""
            aria-hidden
            src={layer.src}
            className="absolute inset-0 block size-full max-w-none"
          />
        </div>
      ))}
    </>
  );
}

function Tooth({
  spec,
  mark,
  arch,
  unscheduled,
  completed = [],
}: {
  spec: ToothSpec;
  mark?: ToothMark;
  arch: Arch;
  unscheduled?: UnscheduledTx;
  /** Work already done on this tooth, oldest first. The latest sets the mark. */
  completed?: CompletedTreatment[];
}) {
  const completedMark = completed.at(-1)?.mark;
  const box = {
    className: "relative shrink-0",
    style: { width: spec.w, height: spec.h },
  };

  if (!mark && !completedMark) {
    return (
      <div {...box}>
        <ToothVisual spec={spec} arch={arch} />
      </div>
    );
  }

  const label = mark
    ? `Tooth ${spec.n}, ${HOVER_RECOMMENDATION[mark]}`
    : `Tooth ${spec.n}, completed ${completed.map((c) => c.label).join(", ")}`;

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          box.className,
          "appearance-none border-0 bg-transparent p-0 cursor-default rounded-[2px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        style={box.style}
        aria-label={label}
      >
        <ToothVisual
          spec={spec}
          mark={mark}
          completedMark={completedMark}
          arch={arch}
        />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="flex max-w-[220px] flex-col items-start bg-popover px-3 py-2.5 text-left text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 [&>svg]:bg-popover [&>svg]:fill-popover"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <i className="fa-regular fa-tooth text-base" aria-hidden />
            {spec.n}
          </div>
          {mark && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <i
                  className="fa-regular fa-sparkles text-xs text-primary"
                  aria-hidden
                />
                Recommendations
              </div>
              <ul className="m-0 list-disc pl-4">
                <li className="text-sm text-foreground">
                  {HOVER_RECOMMENDATION[mark]}
                </li>
              </ul>
            </div>
          )}
          {completed.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <span
                  className="size-2 rounded-full bg-odontogram-completed"
                  aria-hidden
                />
                Completed
              </div>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {completed.map((item) => (
                  <li
                    key={`${item.date.getTime()}-${item.label}`}
                    className="flex flex-col text-sm text-foreground"
                  >
                    <span>{item.label.replace(/\s+D\d{4}$/, "")}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatShortDate(item.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {unscheduled && (
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold text-foreground">
                Not Scheduled
              </div>
              <ul className="m-0 list-disc pl-4">
                <li className="text-sm text-foreground">{unscheduled.label}</li>
              </ul>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function Quadrant({
  teeth,
  marks,
  unscheduled,
  arch,
  metrics,
  completed,
}: {
  teeth: ToothSpec[];
  marks: Map<number, ToothMark>;
  unscheduled: Map<number, UnscheduledTx>;
  completed: Map<number, CompletedTreatment[]>;
  arch: Arch;
  metrics: OdontogramMetrics;
}) {
  return (
    <div
      className={cn(
        "flex min-w-px flex-1 border-zinc-200",
        arch === "upper" ? "items-end" : "h-full items-start",
        metrics.spread && "justify-between"
      )}
      style={{
        gap: metrics.toothGap,
        padding: metrics.pad,
        borderRadius: metrics.radius,
        borderWidth: metrics.border,
        borderStyle: "solid",
      }}
    >
      {teeth.map((spec) => (
        <Tooth
          key={spec.n}
          spec={spec}
          mark={marks.get(spec.n)}
          unscheduled={unscheduled.get(spec.n)}
          completed={completed.get(spec.n)}
          arch={arch}
        />
      ))}
    </div>
  );
}

interface OdontogramProps {
  findings: ToothFinding[];
  unscheduledTx?: UnscheduledTx[];
  /** Past work to chart under the AI marks, oldest first. Omit to draw AI
   *  opportunities only, as the drawer and schedule cards do. */
  completed?: CompletedTreatment[];
  density?: OdontogramDensity;
  className?: string;
}

// Full-mouth chart, upper arch over lower, each arch split into its two
// quadrant boxes. One mark per tooth: the last finding wins, which matches how
// the parsed clinical text is ordered (explicit notes before seeded history).
export default function Odontogram({
  findings,
  unscheduledTx = [],
  completed = [],
  density = "default",
  className,
}: OdontogramProps) {
  const metrics = DENSITY[density];
  const marks = new Map<number, ToothMark>();
  for (const { tooth, mark } of findings) marks.set(tooth, mark);

  const unscheduled = new Map<number, UnscheduledTx>();
  for (const tx of unscheduledTx) unscheduled.set(tx.tooth, tx);

  const completedByTooth = new Map<number, CompletedTreatment[]>();
  for (const item of completed) {
    completedByTooth.set(item.tooth, [
      ...(completedByTooth.get(item.tooth) ?? []),
      item,
    ]);
  }

  const summary = findings.length
    ? findings
        .map(({ tooth, mark }) => `#${tooth} ${MARK_LABEL[mark]}`)
        .join(", ")
    : "no charted findings";

  return (
    <TooltipProvider delay={100}>
      <div
        className={cn("flex w-full flex-col", className)}
        style={{ gap: metrics.quadGap }}
        role="img"
        aria-label={`Odontogram: ${summary}`}
      >
        <div
          className="flex w-full items-center"
          style={{ height: metrics.upperRow, gap: metrics.quadGap }}
        >
          <Quadrant
            teeth={Q1}
            marks={marks}
            unscheduled={unscheduled}
            arch="upper"
            metrics={metrics}
            completed={completedByTooth}
          />
          <Quadrant
            teeth={Q2}
            marks={marks}
            unscheduled={unscheduled}
            arch="upper"
            metrics={metrics}
            completed={completedByTooth}
          />
        </div>
        <div
          className="flex w-full items-center"
          style={{ height: metrics.lowerRow, gap: metrics.quadGap }}
        >
          <Quadrant
            teeth={Q4}
            marks={marks}
            unscheduled={unscheduled}
            arch="lower"
            metrics={metrics}
            completed={completedByTooth}
          />
          <Quadrant
            teeth={Q3}
            marks={marks}
            unscheduled={unscheduled}
            arch="lower"
            metrics={metrics}
            completed={completedByTooth}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
