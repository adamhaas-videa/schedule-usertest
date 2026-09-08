import { useState } from "react";
import type { Patient } from "@/data/mockPatients";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ShareReportModal from "./ShareReportModal";
import PatientEducationModal from "./PatientEducationModal";

const BONE_LEVELS = [
  { label: "UR, UL", severity: "Moderate", tone: "bg-amber-500/25 text-amber-200" },
  { label: "LL", severity: "Mild", tone: "bg-yellow-500/20 text-yellow-200" },
  { label: "LR", severity: "Severe", tone: "bg-red-500/30 text-red-200" },
];

interface ToothDamage {
  tooth: string;
  pct: number;
}

interface ImagingRightPanelProps {
  patient: Patient;
  subtitle?: string;
  toothDamage?: ToothDamage[];
  /** When false the rail collapses to zero width, giving the viewer the space.
   *  Toggled from the study bar's collapse control. */
  open?: boolean;
}

const DEFAULT_DAMAGE: ToothDamage[] = [
  { tooth: "18", pct: 65 },
  { tooth: "19", pct: 35 },
  { tooth: "20", pct: 5 },
  { tooth: "30", pct: 60 },
  { tooth: "32", pct: 35 },
];

/** Shared imaging right rail — odontogram + AI Summary. Used by both the FMX
 *  grid and the single-image viewer. */
export default function ImagingRightPanel({
  patient,
  subtitle,
  toothDamage = DEFAULT_DAMAGE,
  open = true,
}: ImagingRightPanelProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);

  return (
    <>
      {/* The width animates on the outer wrapper while the inner column keeps
          its 330px so the contents slide out of view instead of reflowing.
          Hidden from a11y and tab order once collapsed. */}
      <aside
        className={cn(
          "shrink-0 overflow-hidden bg-card transition-[width] duration-300 ease-out",
          open ? "w-[330px]" : "w-0"
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="h-full w-[330px] flex flex-col">
          <div className="p-4 border-b border-border">
            <img
              src="/assets/odontogram.svg"
              alt="Odontogram — full-mouth tooth chart with AI findings"
              className="w-full h-auto select-none"
              draggable={false}
            />
          </div>
          <div className="flex-1 min-h-0 p-4 space-y-5 overflow-auto">
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Summary</h3>
              {subtitle && (
                <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Bone Level
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {BONE_LEVELS.map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1.5 text-xs">
                    <span className="text-foreground">{b.label}</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", b.tone)}>
                      {b.severity}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Tooth Damage
              </div>
              {toothDamage.map((t) => (
                <div key={t.tooth} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-muted-foreground tabular-nums">{t.tooth}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">
                    {t.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky footer actions. The viewer root carries `dark imaging-surface`,
              so these design-system Buttons resolve to their dark token values. */}
          <div className="shrink-0 flex items-center gap-3 p-4 border-t border-border">
            <Button
              variant="outline-accent"
              className="flex-1 cursor-pointer"
              onClick={() => setEduOpen(true)}
            >
              Patient Education
            </Button>
            <Button
              variant="default"
              className="flex-1 cursor-pointer"
              onClick={() => setShareOpen(true)}
            >
              Share Report
              <i className="fa-regular fa-share text-xs" aria-hidden />
            </Button>
          </div>
        </div>
      </aside>

      {/* Full-screen takeovers — kept outside the collapsing wrapper so they
          never inherit its clipping. Both render null while closed. */}
      <ShareReportModal patient={patient} open={shareOpen} onClose={() => setShareOpen(false)} />
      <PatientEducationModal open={eduOpen} onClose={() => setEduOpen(false)} />
    </>
  );
}
