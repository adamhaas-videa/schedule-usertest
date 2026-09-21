import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAppNavigate } from "@/lib/useAppNavigate";
import WorkflowHeader from "@/components/workflow/WorkflowHeader";
import { getPatientById } from "@/lib/patients";
import { cn } from "@/lib/utils";
import { useAiView } from "@/context/AiViewContext";

const UPPER = Array.from({ length: 16 }, (_, i) => i + 1);
const LOWER = Array.from({ length: 16 }, (_, i) => 32 - i);

const FACIAL_ROWS = [
  "Probing Depth",
  "Gingival Margin",
  "Clinical Attachment Level",
  "Mucogingival Junction",
  "Furcation Grade",
  "Bleeding",
  "Suppuration",
];
const LINGUAL_ROWS = [
  "Suppuration",
  "Bleeding",
  "Furcation Grade",
  "Mucogingival Junction",
  "Clinical Attachment Level",
  "Gingival Margin",
  "Probing Depth",
];

function ToothHeader({
  teeth,
  currentTooth,
}: {
  teeth: number[];
  currentTooth: number;
}) {
  return (
    <div
      className="grid border-b border-border"
      style={{ gridTemplateColumns: `180px repeat(16, minmax(0, 1fr))` }}
    >
      <div className="px-2 py-1" />
      {teeth.map((t) => (
        <div key={t} className="flex flex-col items-center py-1.5 gap-0.5">
          <span
            className={cn(
              "flex items-center justify-center size-5 rounded-full border text-[10px] font-semibold",
              t === currentTooth
                ? "border-error text-error"
                : "border-zinc-300 text-zinc-600"
            )}
          >
            {t}
          </span>
          <span className="text-[8px] tracking-wide text-zinc-400">DCM</span>
        </div>
      ))}
    </div>
  );
}

function ChartRows({ labels }: { labels: string[] }) {
  return (
    <>
      {labels.map((label) => (
        <div
          key={label}
          className="grid border-b border-border/60"
          style={{ gridTemplateColumns: `180px repeat(16, minmax(0, 1fr))` }}
        >
          <div className="px-2 py-1 text-[11px] text-zinc-500 truncate">
            {label}
          </div>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="h-6 border-l border-border/40" />
          ))}
        </div>
      ))}
    </>
  );
}

function ToolbarSelect({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-input bg-card text-sm hover:bg-muted transition-colors cursor-pointer"
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
      <i className="fa-regular fa-angle-down text-xs text-muted-foreground" aria-hidden />
    </button>
  );
}

function MeasureCell({ v }: { v: string }) {
  return (
    <span className="flex items-center justify-center h-7 rounded border border-input bg-card text-sm font-medium text-foreground tabular-nums">
      {v}
    </span>
  );
}

export default function VoicePerioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useAppNavigate();
  const patient = getPatientById(id);
  const { privacyMode, setPrivacyMode } = useAiView();
  const [mobility, setMobility] = useState(0);

  if (!patient) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
        <p className="text-lg font-medium text-foreground">Patient not found</p>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => navigate("/schedule")}
        >
          Back to Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Shared workflow header — Perio Chart is a tab within the header nav */}
      <WorkflowHeader
        patient={patient}
        activeTab="perio"
        privacyMode={privacyMode}
        onPrivacyToggle={setPrivacyMode}
      />

      {/* Perio toolbar (renders directly below the header, not as a modal) */}
      <div className="shrink-0 px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center h-5 px-2 rounded-full bg-error-muted text-error-muted-foreground text-[11px] font-medium">
            Stage 3
          </span>
          <ToolbarSelect label="Microphone" value="Op1 Microphone" />
          <ToolbarSelect label="Script" value="Maxillary Arch Inward" />
          <ToolbarSelect label="Gingival Margin Display" value="Minus Sign (-X)" />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-microphone text-success" aria-hidden />
            <i className="fa-solid fa-waveform-lines text-success text-lg" aria-hidden />
            <button className="flex items-center justify-center size-8 rounded-md border border-input hover:bg-muted cursor-pointer" aria-label="Pause">
              <i className="fa-regular fa-pause" aria-hidden />
            </button>
            <button className="flex items-center justify-center size-8 rounded-md border border-input hover:bg-muted cursor-pointer" aria-label="Delete">
              <i className="fa-regular fa-trash" aria-hidden />
            </button>
            <button className="h-8 px-3 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer">
              Save &amp; End Perio Charting
            </button>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="shrink-0 px-4 py-2 bg-accent-muted border-b border-border flex items-center gap-2 text-xs text-accent-muted-foreground">
        <i className="fa-solid fa-circle-info" aria-hidden />
        No SRP on record for this patient.
        <button className="underline font-medium">Add SRP date</button>
        <span className="text-muted-foreground">
          · SRP recommendations for this visit are based on the perio chart.
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex">
        {/* Chart */}
        <div className="flex-1 min-w-0 overflow-auto p-4">
          <div className="min-w-[860px]">
            <ToothHeader teeth={UPPER} currentTooth={13} />
            <ChartRows labels={FACIAL_ROWS} />
            <div
              className="grid bg-muted/60 border-y border-border"
              style={{ gridTemplateColumns: `180px repeat(16, minmax(0, 1fr))` }}
            >
              <div className="px-2 py-1 text-[11px] font-medium text-zinc-500">
                Status / Plaque / Mobility / Bone Loss
              </div>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-6 border-l border-border/40" />
              ))}
            </div>
            <ChartRows labels={LINGUAL_ROWS} />
            <div className="h-4" />
            <ToothHeader teeth={LOWER} currentTooth={30} />
            <ChartRows labels={FACIAL_ROWS} />
          </div>
        </div>

        {/* Charting tools */}
        <aside className="w-[320px] shrink-0 border-l border-border bg-card flex flex-col overflow-auto">
          <div className="p-4 text-center border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Capturing periodontal data…
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Videa will voice capture the measurements you call out and insert
              them into the patient's perio chart.
            </p>
            <div className="mt-3 rounded-xl border border-border p-4">
              <div className="text-xs text-muted-foreground">Current Tooth</div>
              <div className="text-4xl font-bold text-foreground tracking-tight">
                F21
              </div>
              <div className="mt-1 inline-flex items-center gap-3 text-sm text-muted-foreground">
                <i className="fa-regular fa-angle-left cursor-pointer hover:text-foreground" aria-hidden />
                <span className="font-medium text-foreground">MGJ</span>
                <i className="fa-regular fa-angle-right cursor-pointer hover:text-foreground" aria-hidden />
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Charting Tools</span>
              <i className="fa-regular fa-chevron-up text-xs text-muted-foreground" aria-hidden />
            </div>

            <div className="text-xs font-semibold text-primary">Facial</div>

            {/* Measurement grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_repeat(3,32px)] items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase">
                <span>Measurements</span>
                <span className="text-center">M</span>
                <span className="text-center">C</span>
                <span className="text-center">D</span>
              </div>
              {[
                { label: "Probing Depth", v: ["4", "3", "5"] },
                { label: "Gingival Margin", v: ["1", "1", "1"] },
                { label: "CAL", v: ["5", "4", "6"], muted: true },
                { label: "MGJ", v: ["3", "3", "3"] },
              ].map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-[1fr_repeat(3,32px)] items-center gap-2"
                >
                  <span className="text-sm text-foreground">{r.label}</span>
                  {r.v.map((val, i) => (
                    <MeasureCell key={i} v={val} />
                  ))}
                </div>
              ))}
            </div>

            <div className="text-[11px] font-medium text-muted-foreground uppercase">
              Assessments
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_repeat(3,32px)] items-center gap-2">
                <span className="text-sm text-foreground">Bleeding</span>
                {[true, false, true].map((on, i) => (
                  <span key={i} className="flex justify-center">
                    <i
                      className={cn(
                        "fa-solid fa-droplet text-sm",
                        on ? "text-error" : "text-zinc-300"
                      )}
                      aria-hidden
                    />
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_repeat(3,32px)] items-center gap-2">
                <span className="text-sm text-foreground">Suppuration</span>
                {[false, false, false].map((_, i) => (
                  <span key={i} className="flex justify-center">
                    <span className="size-3.5 rounded-full border border-zinc-300" />
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_repeat(3,32px)] items-center gap-2">
                <span className="text-sm text-foreground">Furcation</span>
                {["FO", "FO", "FO"].map((v, i) => (
                  <MeasureCell key={i} v={v} />
                ))}
              </div>

              {/* Mobility */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Mobility</span>
                <div className="inline-flex items-center rounded-md border border-input overflow-hidden">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMobility(n)}
                      className={cn(
                        "size-7 text-sm font-medium transition-colors cursor-pointer",
                        mobility === n
                          ? "bg-primary text-white"
                          : "bg-card text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plaque */}
              <SegmentRow label="Plaque" options={["–", "Lig", "Mod", "Hea"]} active="Mod" />
              {/* Bone Loss */}
              <SegmentRow label="Bone Loss" options={["–", "Mild", "Mod", "Sev"]} active="Mod" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SegmentRow({
  label,
  options,
  active,
}: {
  label: string;
  options: string[];
  active: string;
}) {
  const [value, setValue] = useState(active);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <div className="inline-flex items-center rounded-md border border-input overflow-hidden">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setValue(o)}
            className={cn(
              "h-7 px-2.5 text-sm font-medium transition-colors cursor-pointer",
              value === o
                ? "bg-primary text-white"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
