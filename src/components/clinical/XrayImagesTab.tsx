import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";

interface XrayImagesTabProps {
  patient: Patient;
}

// Low-fidelity wireframe of the clinical X-ray viewer. Radiographs are
// represented as greyscale placeholder tiles rather than real imagery.

function ToolButton({ icon }: { icon: string }) {
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700">
      <i className={cn(icon, "text-sm")} aria-hidden />
    </div>
  );
}

function FilmTile({ wide = false, tall = false }: { wide?: boolean; tall?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-sm bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600/60 flex items-center justify-center",
        wide ? "col-span-2" : "",
        tall ? "h-28" : "h-20"
      )}
    >
      <i className="fa-regular fa-tooth text-zinc-500 text-lg" aria-hidden />
    </div>
  );
}

const BONE_LEVELS = [
  { label: "UR, UL", severity: "Moderate", tone: "bg-amber-500/30 text-amber-200" },
  { label: "LL", severity: "Mild", tone: "bg-yellow-500/20 text-yellow-200" },
  { label: "LR", severity: "Severe", tone: "bg-red-500/30 text-red-200" },
];

const TOOTH_DAMAGE = [
  { tooth: "18", pct: 65 },
  { tooth: "19", pct: 35 },
  { tooth: "20", pct: 5 },
  { tooth: "30", pct: 60 },
  { tooth: "32", pct: 35 },
];

export default function XrayImagesTab({ patient }: XrayImagesTabProps) {
  void patient;
  return (
    <div className="h-full w-full bg-zinc-950 text-zinc-300 flex">
      {/* Left tool rail */}
      <div className="w-14 shrink-0 flex flex-col items-center gap-2 py-3 border-r border-zinc-800">
        <ToolButton icon="fa-regular fa-table-cells" />
        <ToolButton icon="fa-regular fa-clone" />
        <div className="my-1 h-px w-6 bg-zinc-800" />
        <ToolButton icon="fa-regular fa-tooth" />
        <ToolButton icon="fa-regular fa-teeth" />
        <div className="my-1 h-px w-6 bg-zinc-800" />
        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-deep-teal-600 text-white text-xs font-semibold">
          AI
        </div>
        <ToolButton icon="fa-regular fa-palette" />
        <ToolButton icon="fa-regular fa-sliders" />
      </div>

      {/* Center viewer */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto p-6">
          {/* FMX-style placeholder grid */}
          <div className="mx-auto max-w-4xl space-y-3">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <FilmTile key={`r1-${i}`} tall={i === 2 || i === 3} />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              <FilmTile />
              <FilmTile />
              <div className="col-span-3 h-20 rounded-sm border border-dashed border-zinc-700 bg-zinc-900/60" />
              <FilmTile />
              <FilmTile />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <FilmTile key={`r3-${i}`} tall={i === 2 || i === 3} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 h-16 px-4 flex items-center gap-3 border-t border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-zinc-700 text-sm text-zinc-300">
              <i className="fa-regular fa-arrow-down-short-wide text-xs" aria-hidden />
              Sort
            </div>
            <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-zinc-800 border border-zinc-700 text-sm">
              FMX <span className="text-zinc-500">18</span>
            </div>
            <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-zinc-700 text-sm text-zinc-400">
              BW <span className="text-zinc-500">4</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center gap-2">
            <i className="fa-regular fa-chevron-left text-xs text-zinc-500" aria-hidden />
            <div className="h-9 w-12 rounded-sm bg-gradient-to-br from-rose-900/40 to-zinc-800 border border-zinc-700" />
            <div className="h-9 w-12 rounded-sm bg-gradient-to-br from-rose-900/40 to-zinc-800 border border-zinc-700" />
            <i className="fa-regular fa-chevron-right text-xs text-zinc-500" aria-hidden />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">Visit Date: Mar 20, 2026</span>
            <button
              type="button"
              className="h-8 px-3 rounded-md bg-deep-teal-600 text-white text-sm font-medium"
            >
              Patient Education
            </button>
            <button
              type="button"
              className="h-8 px-3 rounded-md border border-zinc-600 text-zinc-200 text-sm font-medium inline-flex items-center gap-1.5"
            >
              Share with Patient
              <i className="fa-regular fa-arrow-up-right text-xs" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Right AI panel */}
      <div className="w-[300px] shrink-0 border-l border-zinc-800 bg-zinc-900/60 flex flex-col">
        {/* Top thumbnail strip */}
        <div className="p-3 border-b border-zinc-800 space-y-2">
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={`t-${i}`}
                className="h-7 rounded-[2px] bg-zinc-700/70 border border-zinc-600/50"
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 rounded-sm border border-violet-500/60 bg-zinc-800" />
            <div className="h-10 rounded-sm border border-red-500/60 bg-zinc-800" />
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-auto">
          <div className="text-sm font-semibold text-zinc-100">AI Summary</div>

          <div className="space-y-2">
            <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              Bone Level
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {BONE_LEVELS.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 text-xs"
                >
                  <span className="text-zinc-300">{b.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      b.tone
                    )}
                  >
                    {b.severity}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              Tooth Damage
            </div>
            {TOOTH_DAMAGE.map((t) => (
              <div key={t.tooth} className="flex items-center gap-2">
                <span className="w-6 text-xs text-zinc-400 tabular-nums">
                  {t.tooth}
                </span>
                <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
                <span className="w-9 text-right text-xs text-zinc-400 tabular-nums">
                  {t.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
