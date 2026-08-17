import { useState } from "react";

import type { Patient } from "@/data/mockPatients";

import {
  createInitialQuadrants,
  createInitialTeeth,
  DEFAULT_CLINICAL_NOTE,
} from "./constants";
import { Odontogram } from "./Odontogram";
import { ReportPreviewRail } from "./ReportPreviewRail";
import { TreatmentPicker } from "./TreatmentPicker";
import { Textarea } from "./ui";
import type {
  ChartMode,
  PreviewTab,
  QuadrantData,
  QuadrantId,
  QuadTreatment,
  ToothData,
  ToothNumber,
  Treatment,
} from "./types";

interface ShareReportExperienceProps {
  patient: Patient;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function hasToothContent(tooth: ToothData): boolean {
  return tooth.treatments.length > 0;
}

function hasQuadContent(quad: QuadrantData): boolean {
  return quad.treatments.length > 0;
}

export function ShareReportExperience({
  patient,
  open = true,
  onOpenChange,
}: ShareReportExperienceProps) {
  const [teeth, setTeeth] = useState(() => createInitialTeeth());
  const [quadrants, setQuadrants] = useState(() => createInitialQuadrants());
  const [activeTooth, setActiveTooth] = useState<ToothNumber | null>(20);
  const [activeQuadrants, setActiveQuadrants] = useState<Set<QuadrantId>>(
    () => new Set(),
  );
  const [chartMode, setChartMode] = useState<ChartMode>("adult");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("qr");
  const [clinicalNote, setClinicalNote] = useState(DEFAULT_CLINICAL_NOTE);

  const activeToothData = activeTooth ? teeth.get(activeTooth) : undefined;
  const savedToothCount = Array.from(teeth.values()).filter(
    (tooth) => tooth.state === "saved",
  ).length;
  const savedQuadCount = Array.from(quadrants.values()).filter(
    (quad) => quad.state === "saved",
  ).length;
  const savedCount = savedToothCount + savedQuadCount;

  function handleToothClick(number: ToothNumber) {
    setActiveQuadrants(new Set());

    if (number === activeTooth) {
      const tooth = teeth.get(number);
      if (tooth?.state !== "saved") {
        setActiveTooth(null);
        return;
      }
    }

    setActiveTooth(number);
  }

  function handleQuadrantClick(id: QuadrantId) {
    setActiveTooth(null);
    setActiveQuadrants((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleClearQuadrant(id: QuadrantId) {
    setActiveQuadrants((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  function updateActiveTooth(updater: (tooth: ToothData) => ToothData) {
    if (!activeTooth) {
      return;
    }

    setTeeth((current) => {
      const next = new Map(current);
      const tooth: ToothData = next.get(activeTooth) ?? {
        number: activeTooth,
        state: "normal",
        treatments: [],
        imageIds: [],
      };
      const updated = updater(tooth);

      next.set(activeTooth, {
        ...updated,
        state: hasToothContent(updated)
          ? updated.state === "saved"
            ? "saved"
            : "unsaved"
          : "normal",
      });

      return next;
    });
  }

  function handleToggleTreatment(treatment: Treatment, checked: boolean) {
    updateActiveTooth((tooth) => ({
      ...tooth,
      state: tooth.state === "saved" ? "unsaved" : tooth.state,
      treatments: checked
        ? Array.from(new Set([...tooth.treatments, treatment]))
        : tooth.treatments.filter((item) => item !== treatment),
    }));
  }

  function handleToggleQuadTreatment(
    treatment: QuadTreatment,
    checked: boolean,
  ) {
    if (activeQuadrants.size === 0) {
      return;
    }

    setQuadrants((current) => {
      const next = new Map(current);

      activeQuadrants.forEach((id) => {
        const quad: QuadrantData = next.get(id) ?? {
          id,
          state: "normal",
          treatments: [],
        };

        const treatments = checked
          ? Array.from(new Set([...quad.treatments, treatment]))
          : quad.treatments.filter((item) => item !== treatment);

        const baseState =
          quad.state === "saved" ? "unsaved" : quad.state;

        next.set(id, {
          ...quad,
          treatments,
          state: treatments.length === 0 ? "normal" : baseState,
        });
      });

      return next;
    });
  }

  function handleRemove() {
    if (activeQuadrants.size > 0) {
      setQuadrants((current) => {
        const next = new Map(current);
        activeQuadrants.forEach((id) => {
          next.set(id, { id, state: "normal", treatments: [] });
        });
        return next;
      });
      setActiveQuadrants(new Set());
      return;
    }

    if (!activeTooth) {
      return;
    }

    setTeeth((current) => {
      const next = new Map(current);
      next.set(activeTooth, {
        number: activeTooth,
        state: "normal",
        treatments: [],
        imageIds: [],
      });
      return next;
    });

    setActiveTooth(null);
  }

  function handleSaveToReport() {
    if (activeQuadrants.size > 0) {
      setQuadrants((current) => {
        const next = new Map<QuadrantId, QuadrantData>();

        current.forEach((quad, id) => {
          const shouldSave =
            activeQuadrants.has(id) && hasQuadContent(quad);

          next.set(id, {
            ...quad,
            state: shouldSave ? "saved" : quad.state,
          });
        });

        return next;
      });
      setActiveQuadrants(new Set());
      return;
    }

    if (!activeTooth) {
      return;
    }

    setTeeth((current) => {
      const next = new Map<ToothNumber, ToothData>();

      current.forEach((tooth, number) => {
        const shouldSave =
          number === activeTooth && hasToothContent(tooth);

        next.set(number, {
          ...tooth,
          state: shouldSave ? "saved" : tooth.state,
        });
      });

      return next;
    });

    setActiveTooth(null);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="relative flex h-screen w-full min-w-[900px] flex-col bg-[#0a0a0a]">
      <header className="flex w-full shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border bg-[var(--base-popover)] px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="whitespace-nowrap text-[16px] font-semibold leading-none text-[var(--stone-50)]">
            {patient.name}
          </p>
          <p className="text-[13px] leading-none text-[var(--stone-400)]">
            DOB {patient.dob}
            {patient.provider?.name ? (
              <>&nbsp;·&nbsp; Dr. {patient.provider.name}</>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close share report"
          onClick={() => onOpenChange?.(false)}
          className="flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-xl leading-none" aria-hidden />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 items-stretch">
        <main className="flex min-w-0 flex-1 flex-col items-stretch gap-4 overflow-y-auto px-6 py-4">
            <section className="w-full overflow-hidden rounded-md border border-border bg-[var(--dark-panels)] p-4">
              <div className="flex w-full flex-col gap-1.5">
                <label
                  className="text-[14px] font-medium leading-none text-foreground"
                  htmlFor="clinical-note"
                >
                  Clinical note{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Textarea
                  id="clinical-note"
                  value={clinicalNote}
                  placeholder="Add a clinical note for this patient. It will appear in the report your patient sees."
                  onChange={(event) => setClinicalNote(event.target.value)}
                />
              </div>
            </section>

            <section className="flex w-full flex-col overflow-hidden rounded-md border border-border bg-[var(--dark-panels)]">
              <Odontogram
                teeth={teeth}
                quadrants={quadrants}
                activeTooth={activeTooth}
                activeQuadrants={activeQuadrants}
                chartMode={chartMode}
                onChartModeChange={setChartMode}
                onToothClick={handleToothClick}
                onQuadrantClick={handleQuadrantClick}
              />

              <TreatmentPicker
                activeTooth={activeTooth}
                tooth={activeToothData}
                activeQuadrants={activeQuadrants}
                quadrants={quadrants}
                onRemove={handleRemove}
                onSaveToReport={handleSaveToReport}
                onToggleTreatment={handleToggleTreatment}
                onToggleQuadTreatment={handleToggleQuadTreatment}
                onClearQuadrant={handleClearQuadrant}
              />
            </section>
        </main>

        <ReportPreviewRail
          previewTab={previewTab}
          onPreviewTabChange={setPreviewTab}
          onClose={() => onOpenChange?.(false)}
          savedToothCount={savedCount}
          clinicalNote={clinicalNote}
        />
      </div>
    </div>
  );
}
