import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";

interface PerioChartTabProps {
  patient: Patient;
}

type RowType = "num" | "dash" | "bleed";

interface MeasRow {
  label: string;
  type: RowType;
}

const FACIAL_ROWS: MeasRow[] = [
  { label: "Probing Depth", type: "num" },
  { label: "Gingival Margin", type: "num" },
  { label: "Clinical Attachment Level", type: "num" },
  { label: "Mucogingival Junction", type: "dash" },
  { label: "Furcation Grade", type: "dash" },
  { label: "Bleeding", type: "bleed" },
  { label: "Suppuration", type: "bleed" },
];

const LINGUAL_ROWS: MeasRow[] = [...FACIAL_ROWS].reverse();

const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1); // 1..16
const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => 32 - i); // 32..17

const COL_W = 56;
const LABEL_W = 184;

function siteValues(tooth: number, rowIdx: number): number[] {
  const base = tooth * 7 + rowIdx * 13;
  return [0, 1, 2].map((i) => (base + i * 5) % 6);
}

function siteLabel(tooth: number): string {
  // Alternating site-order labels as seen in the design.
  return tooth % 3 === 0 ? "MCD" : "DCM";
}

function NumCell({ tooth, rowIdx }: { tooth: number; rowIdx: number }) {
  const values = siteValues(tooth, rowIdx);
  return (
    <div
      className="flex items-center justify-around px-1 border-l border-border/60"
      style={{ width: COL_W }}
    >
      {values.map((v, i) => (
        <span
          key={i}
          className={cn(
            "text-[10px] tabular-nums leading-none",
            v >= 4 ? "text-destructive font-semibold" : "text-foreground"
          )}
        >
          {v}
        </span>
      ))}
    </div>
  );
}

function DashCell() {
  return (
    <div
      className="flex items-center justify-around px-1 border-l border-border/60 text-[10px] text-muted-foreground/60"
      style={{ width: COL_W }}
    >
      <span>-</span>
      <span>-</span>
      <span>-</span>
    </div>
  );
}

function BleedCell({ tooth, rowIdx }: { tooth: number; rowIdx: number }) {
  const values = siteValues(tooth, rowIdx);
  return (
    <div
      className="flex items-center justify-around px-1 border-l border-border/60"
      style={{ width: COL_W }}
    >
      {values.map((v, i) =>
        v >= 4 ? (
          <i
            key={i}
            className="fa-solid fa-droplet text-destructive text-[9px]"
            aria-hidden
          />
        ) : (
          <span key={i} className="text-[10px] text-muted-foreground/40">
            -
          </span>
        )
      )}
    </div>
  );
}

function MeasurementRow({
  row,
  rowIdx,
  teeth,
}: {
  row: MeasRow;
  rowIdx: number;
  teeth: number[];
}) {
  return (
    <div className="flex items-stretch h-6 border-b border-border/40">
      <div
        className="shrink-0 flex items-center text-[11px] text-muted-foreground pl-2"
        style={{ width: LABEL_W }}
      >
        {row.label}
      </div>
      {teeth.map((tooth) =>
        row.type === "num" ? (
          <NumCell key={tooth} tooth={tooth} rowIdx={rowIdx} />
        ) : row.type === "dash" ? (
          <DashCell key={tooth} />
        ) : (
          <BleedCell key={tooth} tooth={tooth} rowIdx={rowIdx} />
        )
      )}
    </div>
  );
}

function TeethHeader({
  teeth,
  archLabel,
}: {
  teeth: number[];
  archLabel: string;
}) {
  return (
    <div className="flex items-end h-12 border-b border-border">
      <div
        className="shrink-0 flex items-center pl-2 text-sm font-semibold text-muted-foreground"
        style={{ width: LABEL_W }}
      >
        {archLabel}
      </div>
      {teeth.map((tooth) => (
        <div
          key={tooth}
          className="flex flex-col items-center justify-end gap-0.5 border-l border-border/60 pb-1"
          style={{ width: COL_W }}
        >
          <span className="flex items-center justify-center size-5 rounded-full border border-border text-[10px] font-medium text-foreground">
            {tooth}
          </span>
          <span className="text-[9px] text-muted-foreground tracking-wide">
            {siteLabel(tooth)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Arch({
  teeth,
  topArchLabel,
  bottomArchLabel,
}: {
  teeth: number[];
  topArchLabel: string;
  bottomArchLabel: string;
}) {
  return (
    <div className="min-w-fit">
      <TeethHeader teeth={teeth} archLabel={topArchLabel} />
      {FACIAL_ROWS.map((row, idx) => (
        <MeasurementRow key={`f-${row.label}`} row={row} rowIdx={idx} teeth={teeth} />
      ))}

      {/* Plaque / mobility / bone-loss divider band */}
      <div className="flex items-stretch h-7 border-y border-border bg-muted/40">
        <div
          className="shrink-0 flex items-center pl-2 text-[11px] font-medium text-muted-foreground"
          style={{ width: LABEL_W }}
        >
          Plaque / Mobility / Bone Loss
        </div>
        <div className="flex-1" />
      </div>

      {LINGUAL_ROWS.map((row, idx) => (
        <MeasurementRow
          key={`l-${row.label}`}
          row={row}
          rowIdx={idx + 7}
          teeth={teeth}
        />
      ))}
      <TeethHeader teeth={teeth} archLabel={bottomArchLabel} />
    </div>
  );
}

export default function PerioChartTab({ patient }: PerioChartTabProps) {
  void patient;
  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Sub-header */}
      <div className="shrink-0 h-12 px-4 flex items-center gap-2 border-b border-border">
        <span className="inline-flex items-center h-7 px-3 rounded-full border border-border text-xs font-medium text-foreground">
          Recent Perio Chart
        </span>
        <span className="inline-flex items-center h-7 px-3 rounded-full bg-warning-muted text-warning-muted-foreground text-xs font-medium">
          Stage 2
        </span>
        <div className="flex-1" />
        <button
          type="button"
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <i className="fa-regular fa-microphone text-sm" aria-hidden />
          Start Voice Perio
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <div className="space-y-8">
          <Arch teeth={UPPER_TEETH} topArchLabel="F" bottomArchLabel="L" />
          <Arch teeth={LOWER_TEETH} topArchLabel="L" bottomArchLabel="F" />
        </div>
      </div>
    </div>
  );
}
