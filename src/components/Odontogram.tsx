import type { ToothFinding, ToothMark } from "@/data/patientSummary";
import { cn } from "@/lib/utils";

// Tooth silhouettes and condition marks exported from the odontogram component
// in Figma (file E2QYvtQcNIpQNI9AubstEf). Each silhouette is shared by the two
// teeth of the same type in an arch — the file name records which universal
// numbers use it. Do not hand-edit these: re-export from Figma instead.
import tooth0116 from "@/assets/odontogram/tooth-01-16.svg";
import tooth0215 from "@/assets/odontogram/tooth-02-15.svg";
import tooth0314 from "@/assets/odontogram/tooth-03-14.svg";
import tooth0413 from "@/assets/odontogram/tooth-04-13.svg";
import tooth0512 from "@/assets/odontogram/tooth-05-12.svg";
import tooth0611 from "@/assets/odontogram/tooth-06-11.svg";
import tooth0710 from "@/assets/odontogram/tooth-07-10.svg";
import tooth0809 from "@/assets/odontogram/tooth-08-09.svg";
import tooth17 from "@/assets/odontogram/tooth-17.svg";
import tooth1831 from "@/assets/odontogram/tooth-18-31.svg";
import tooth1930 from "@/assets/odontogram/tooth-19-30.svg";
import tooth2029 from "@/assets/odontogram/tooth-20-29.svg";
import tooth2128 from "@/assets/odontogram/tooth-21-28.svg";
import tooth2227 from "@/assets/odontogram/tooth-22-27.svg";
import tooth2326 from "@/assets/odontogram/tooth-23-26.svg";
import tooth2425 from "@/assets/odontogram/tooth-24-25.svg";
import tooth32 from "@/assets/odontogram/tooth-32.svg";
import markCrownUpper from "@/assets/odontogram/mark-crown-upper.svg";
import markCrownLower from "@/assets/odontogram/mark-crown-lower.svg";
import markFilling from "@/assets/odontogram/mark-filling.svg";
import markIncipient from "@/assets/odontogram/mark-incipient.svg";
import markExtraction from "@/assets/odontogram/mark-extraction.svg";
import markImplantPost from "@/assets/odontogram/mark-implant-post.svg";
import markImplantAbutment from "@/assets/odontogram/mark-implant-abutment.svg";
import markImplantThread from "@/assets/odontogram/mark-implant-thread.svg";
import markRootCanal from "@/assets/odontogram/mark-root-canal.svg";

type Arch = "upper" | "lower";

interface ToothSpec {
  n: number;
  w: number;
  h: number;
  src: string;
}

// Box sizes come straight from the Figma odontogram so the arches keep their
// crown-height silhouette (molars short and wide, canines tall and narrow).
const Q1: ToothSpec[] = [
  { n: 1, w: 21.014, h: 31.521, src: tooth0116 },
  { n: 2, w: 22.515, h: 34.523, src: tooth0215 },
  { n: 3, w: 22.529, h: 35.307, src: tooth0314 },
  { n: 4, w: 14.37, h: 41.882, src: tooth0413 },
  { n: 5, w: 14.581, h: 45.517, src: tooth0512 },
  { n: 6, w: 12.775, h: 50.743, src: tooth0611 },
  { n: 7, w: 11.835, h: 46.185, src: tooth0710 },
  { n: 8, w: 13.558, h: 49.097, src: tooth0809 },
];

const Q2: ToothSpec[] = [
  { n: 9, w: 13.558, h: 49.097, src: tooth0809 },
  { n: 10, w: 11.835, h: 46.185, src: tooth0710 },
  { n: 11, w: 12.775, h: 50.743, src: tooth0611 },
  { n: 12, w: 14.581, h: 45.517, src: tooth0512 },
  { n: 13, w: 14.37, h: 41.882, src: tooth0413 },
  { n: 14, w: 22.529, h: 35.307, src: tooth0314 },
  { n: 15, w: 22.515, h: 34.523, src: tooth0215 },
  { n: 16, w: 21.014, h: 31.521, src: tooth0116 },
];

const Q4: ToothSpec[] = [
  { n: 32, w: 23.363, h: 37.126, src: tooth32 },
  { n: 31, w: 22.581, h: 39.352, src: tooth1831 },
  { n: 30, w: 22.874, h: 41.036, src: tooth1930 },
  { n: 29, w: 14.932, h: 45.729, src: tooth2029 },
  { n: 28, w: 13.965, h: 44.364, src: tooth2128 },
  { n: 27, w: 12.329, h: 46.378, src: tooth2227 },
  { n: 26, w: 9.693, h: 43.175, src: tooth2326 },
  { n: 25, w: 9.728, h: 42.509, src: tooth2425 },
];

const Q3: ToothSpec[] = [
  { n: 24, w: 9.728, h: 42.509, src: tooth2425 },
  { n: 23, w: 9.693, h: 43.175, src: tooth2326 },
  { n: 22, w: 12.329, h: 46.378, src: tooth2227 },
  { n: 21, w: 13.965, h: 44.364, src: tooth2128 },
  { n: 20, w: 14.932, h: 45.729, src: tooth2029 },
  { n: 19, w: 22.874, h: 41.036, src: tooth1930 },
  { n: 18, w: 22.581, h: 39.352, src: tooth1831 },
  { n: 17, w: 23.363, h: 37.126, src: tooth17 },
];

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

function Tooth({
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
    <div
      className="relative shrink-0"
      style={{ width: spec.w, height: spec.h }}
      title={mark ? `#${spec.n} — ${MARK_LABEL[mark]}` : `#${spec.n}`}
    >
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
    </div>
  );
}

function Quadrant({
  teeth,
  marks,
  arch,
}: {
  teeth: ToothSpec[];
  marks: Map<number, ToothMark>;
  arch: Arch;
}) {
  return (
    <div
      className={cn(
        "flex min-w-px flex-1 gap-[11.257px] rounded-[2px] border-[1.5px] border-zinc-200 p-[10.507px]",
        arch === "upper" ? "items-end" : "h-full items-start"
      )}
    >
      {teeth.map((spec) => (
        <Tooth
          key={spec.n}
          spec={spec}
          mark={marks.get(spec.n)}
          arch={arch}
        />
      ))}
    </div>
  );
}

interface OdontogramProps {
  findings: ToothFinding[];
  className?: string;
}

// Full-mouth chart, upper arch over lower, each arch split into its two
// quadrant boxes. One mark per tooth: the last finding wins, which matches how
// the parsed clinical text is ordered (explicit notes before seeded history).
export default function Odontogram({ findings, className }: OdontogramProps) {
  const marks = new Map<number, ToothMark>();
  for (const { tooth, mark } of findings) marks.set(tooth, mark);

  const summary = findings.length
    ? findings
        .map(({ tooth, mark }) => `#${tooth} ${MARK_LABEL[mark]}`)
        .join(", ")
    : "no charted findings";

  return (
    <div
      className={cn("flex w-full flex-col gap-[3px]", className)}
      role="img"
      aria-label={`Odontogram: ${summary}`}
    >
      <div className="flex h-[71.757px] w-full items-center gap-[3px]">
        <Quadrant teeth={Q1} marks={marks} arch="upper" />
        <Quadrant teeth={Q2} marks={marks} arch="upper" />
      </div>
      <div className="flex h-[69.796px] w-full items-center gap-[3px]">
        <Quadrant teeth={Q4} marks={marks} arch="lower" />
        <Quadrant teeth={Q3} marks={marks} arch="lower" />
      </div>
    </div>
  );
}
