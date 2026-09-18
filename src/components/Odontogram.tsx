import type {
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

function ToothVisual({
  spec,
  mark,
  arch,
}: {
  spec: ToothSpec;
  mark?: ToothMark;
  arch: Arch;
}) {
  const layers = mark ? MARKS[arch][mark] : [];
  return (
    <>
      <img
        alt=""
        aria-hidden
        src={spec.src}
        className="absolute inset-0 block size-full max-w-none"
      />
      {layers.map((layer, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: layer.inset[0],
            right: layer.inset[1],
            bottom: layer.inset[2],
            left: layer.inset[3],
            transform: layer.transform,
          }}
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
}: {
  spec: ToothSpec;
  mark?: ToothMark;
  arch: Arch;
  unscheduled?: UnscheduledTx;
}) {
  const box = {
    className: "relative shrink-0",
    style: { width: spec.w, height: spec.h },
  };

  if (!mark) {
    return (
      <div {...box}>
        <ToothVisual spec={spec} arch={arch} />
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          box.className,
          "appearance-none border-0 bg-transparent p-0 cursor-default rounded-[2px] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        style={box.style}
        aria-label={`Tooth ${spec.n}, ${HOVER_RECOMMENDATION[mark]}`}
      >
        <ToothVisual spec={spec} mark={mark} arch={arch} />
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
}: {
  teeth: ToothSpec[];
  marks: Map<number, ToothMark>;
  unscheduled: Map<number, UnscheduledTx>;
  arch: Arch;
  metrics: OdontogramMetrics;
}) {
  return (
    <div
      className={cn(
        "flex min-w-px flex-1 border-zinc-200",
        arch === "upper" ? "items-end" : "h-full items-start"
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
          arch={arch}
        />
      ))}
    </div>
  );
}

interface OdontogramProps {
  findings: ToothFinding[];
  unscheduledTx?: UnscheduledTx[];
  density?: OdontogramDensity;
  className?: string;
}

// Full-mouth chart, upper arch over lower, each arch split into its two
// quadrant boxes. One mark per tooth: the last finding wins, which matches how
// the parsed clinical text is ordered (explicit notes before seeded history).
export default function Odontogram({
  findings,
  unscheduledTx = [],
  density = "default",
  className,
}: OdontogramProps) {
  const metrics = DENSITY[density];
  const marks = new Map<number, ToothMark>();
  for (const { tooth, mark } of findings) marks.set(tooth, mark);

  const unscheduled = new Map<number, UnscheduledTx>();
  for (const tx of unscheduledTx) unscheduled.set(tx.tooth, tx);

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
          />
          <Quadrant
            teeth={Q2}
            marks={marks}
            unscheduled={unscheduled}
            arch="upper"
            metrics={metrics}
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
          />
          <Quadrant
            teeth={Q3}
            marks={marks}
            unscheduled={unscheduled}
            arch="lower"
            metrics={metrics}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
