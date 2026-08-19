import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button, Checkbox, ConfirmDialog } from "./ui";
import {
  QUAD_TREATMENT_OPTIONS,
  QUADRANT_LABELS,
  QUADRANT_SHORT_LABELS,
  TREATMENT_COLUMNS,
  XRAY_IMAGES,
} from "./constants";
import type {
  QuadrantData,
  QuadrantId,
  QuadTreatment,
  ToothData,
  ToothNumber,
  Treatment,
} from "./types";

interface TreatmentPickerProps {
  activeTooth: ToothNumber | null;
  tooth: ToothData | undefined;
  activeQuadrants: Set<QuadrantId>;
  quadrants: Map<QuadrantId, QuadrantData>;
  onToggleTreatment: (treatment: Treatment, checked: boolean) => void;
  onToggleQuadTreatment: (
    treatment: QuadTreatment,
    checked: boolean,
  ) => void;
  onRemove: () => void;
  onSaveToReport: () => void;
  onClearQuadrant: (id: QuadrantId) => void;
}

function ImageThumbnail({
  src,
  isSelected,
  onSelect,
}: {
  src: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label="X-ray image"
      className={cn(
        "aspect-[123/92] w-full overflow-hidden rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-periwinkle-500)]",
        isSelected
          ? "border-4 border-solid border-[var(--base-outline-accent-border)]"
          : "border border-transparent hover:border hover:border-border",
      )}
    >
      <img alt="" src={src} className="h-full w-full object-cover" />
    </button>
  );
}

function ToothTreatmentGrid({
  treatments,
  onToggleTreatment,
}: {
  treatments: Treatment[];
  onToggleTreatment: (treatment: Treatment, checked: boolean) => void;
}) {
  return (
    <div className="flex w-full flex-col items-stretch overflow-hidden">
      <div className="grid grid-cols-2 border-b border-solid border-[var(--base-border)] xl:grid-cols-4">
        {TREATMENT_COLUMNS.map((column) => {
          const option = column[0];
          const checked = treatments.includes(option.value);

          return (
            <div
              key={option.value}
              className="flex h-[52px] items-center p-4"
            >
              <label className="flex flex-1 cursor-pointer items-start gap-2">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) =>
                    onToggleTreatment(option.value, value === true)
                  }
                />
                <span className="flex-1 text-[14px] font-medium leading-tight text-[var(--base-foreground)]">
                  {option.label}
                </span>
              </label>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4">
        {TREATMENT_COLUMNS.map((column) => {
          const option = column[1];
          const checked = treatments.includes(option.value);

          return (
            <div
              key={option.value}
              className="flex h-[52px] items-center p-4"
            >
              <label className="flex flex-1 cursor-pointer items-start gap-2">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) =>
                    onToggleTreatment(option.value, value === true)
                  }
                />
                <span className="flex-1 text-[14px] font-medium leading-tight text-[var(--base-foreground)]">
                  {option.label}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuadTreatmentGrid({
  treatments,
  onToggleTreatment,
}: {
  treatments: QuadTreatment[];
  onToggleTreatment: (treatment: QuadTreatment, checked: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 overflow-hidden xl:grid-cols-4">
      {QUAD_TREATMENT_OPTIONS.map((option) => {
        const checked = treatments.includes(option.value);

        return (
          <div
            key={option.value}
            className="flex h-[52px] items-center p-4"
          >
            <label className="flex flex-1 cursor-pointer items-start gap-2">
              <Checkbox
                checked={checked}
                onCheckedChange={(value) =>
                  onToggleTreatment(option.value, value === true)
                }
              />
              <span className="flex-1 text-[14px] font-medium leading-tight text-[var(--base-foreground)]">
                {option.label}
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}

function QuadrantPills({
  activeQuadrants,
  onClear,
}: {
  activeQuadrants: QuadrantId[];
  onClear: (id: QuadrantId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeQuadrants.map((id) => (
        <span
          key={id}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-periwinkle-400)] bg-[var(--color-periwinkle-950)] px-2.5 py-1 text-[12px] font-medium leading-none text-[var(--color-periwinkle-100,#e0e7ff)]"
        >
          <span className="font-semibold">
            {QUADRANT_SHORT_LABELS[id]}
          </span>
          <span className="text-[var(--stone-400)]">
            {QUADRANT_LABELS[id]}
          </span>
          <button
            type="button"
            aria-label={`Remove ${QUADRANT_LABELS[id]} quadrant`}
            onClick={() => onClear(id)}
            className="-mr-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[var(--stone-400)] hover:bg-[color-mix(in_oklab,var(--color-periwinkle-500)_25%,transparent)] hover:text-foreground cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-[10px] leading-none" aria-hidden />
          </button>
        </span>
      ))}
    </div>
  );
}

function quadrantsAllSaved(
  ids: QuadrantId[],
  quadrants: Map<QuadrantId, QuadrantData>,
): boolean {
  if (ids.length === 0) {
    return false;
  }

  return ids.every((id) => quadrants.get(id)?.state === "saved");
}

function quadrantsAnyHaveContent(
  ids: QuadrantId[],
  quadrants: Map<QuadrantId, QuadrantData>,
): boolean {
  return ids.some((id) => (quadrants.get(id)?.treatments.length ?? 0) > 0);
}

function unionQuadTreatments(
  ids: QuadrantId[],
  quadrants: Map<QuadrantId, QuadrantData>,
): QuadTreatment[] {
  const set = new Set<QuadTreatment>();
  ids.forEach((id) => {
    quadrants.get(id)?.treatments.forEach((t) => set.add(t));
  });
  return Array.from(set);
}

export function TreatmentPicker({
  activeTooth,
  tooth,
  activeQuadrants,
  quadrants,
  onToggleTreatment,
  onToggleQuadTreatment,
  onRemove,
  onSaveToReport,
  onClearQuadrant,
}: TreatmentPickerProps) {
  const activeQuadList = Array.from(activeQuadrants);
  const hasQuadSelection = activeQuadList.length > 0;
  const hasToothSelection = Boolean(activeTooth && tooth);

  const mode: "tooth" | "quadrant" | "empty" = hasQuadSelection
    ? "quadrant"
    : hasToothSelection
      ? "tooth"
      : "empty";

  const isSavedTooth =
    mode === "tooth" && tooth ? tooth.state === "saved" : false;
  const isSavedQuad =
    mode === "quadrant"
      ? quadrantsAllSaved(activeQuadList, quadrants)
      : false;
  const isSaved = mode === "tooth" ? isSavedTooth : isSavedQuad;

  const toothTreatments = tooth?.treatments ?? [];
  const quadTreatments = unionQuadTreatments(activeQuadList, quadrants);

  const canSave =
    mode === "tooth"
      ? hasToothSelection && (tooth?.treatments.length ?? 0) > 0 && !isSavedTooth
      : mode === "quadrant"
        ? hasQuadSelection &&
          quadrantsAnyHaveContent(activeQuadList, quadrants) &&
          !isSavedQuad
        : false;

  const canRemove =
    mode === "tooth"
      ? hasToothSelection
      : mode === "quadrant"
        ? hasQuadSelection
        : false;

  const [selectedImage, setSelectedImage] = useState<string>(XRAY_IMAGES[0]);
  const [imageTooth, setImageTooth] = useState(activeTooth);
  const [removeOpen, setRemoveOpen] = useState(false);

  if (imageTooth !== activeTooth) {
    setImageTooth(activeTooth);
    setSelectedImage(XRAY_IMAGES[0]);
  }

  const heading =
    mode === "tooth"
      ? `Treatments and images for Tooth ${activeTooth}`
      : mode === "quadrant"
        ? `Treatments for ${activeQuadList.length === 1 ? "quadrant" : "quadrants"}`
        : "Treatments and images";

  const removeDialogTitle =
    mode === "tooth"
      ? `Remove Tooth ${activeTooth ?? ""}?`
      : `Remove ${activeQuadList.length} quadrant${activeQuadList.length === 1 ? "" : "s"}?`;

  const removeDialogDescription =
    mode === "tooth"
      ? "This clears every treatment, image, and clinical note for this tooth."
      : "This clears every quadrant-level treatment for the selected quadrants.";

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex min-h-7 items-center gap-3 px-6">
        <p className="text-[14px] font-semibold leading-none text-[#fafafa]">
          {heading}
        </p>
        {mode === "quadrant" ? (
          <QuadrantPills
            activeQuadrants={activeQuadList}
            onClear={onClearQuadrant}
          />
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-2 px-6">
        {mode === "empty" ? (
          <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-[var(--dark-panels)] px-6 py-12 text-center">
            <i className="fa-solid fa-teeth text-[32px] leading-none text-muted-foreground" aria-hidden />
            <div className="flex flex-col items-center gap-1">
              <p className="text-[15px] font-medium leading-tight text-foreground">
                Select a tooth or quadrant to begin
              </p>
              <p className="max-w-[420px] text-[13px] leading-snug text-muted-foreground">
                Choose a tooth from the chart to assign treatments and review
                imaging for that site, or click a quadrant outline to assign
                arch-level treatments.
              </p>
            </div>
          </div>
        ) : mode === "tooth" ? (
          <>
            <ToothTreatmentGrid
              treatments={toothTreatments}
              onToggleTreatment={onToggleTreatment}
            />

            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {XRAY_IMAGES.map((src) => (
                <ImageThumbnail
                  key={src}
                  src={src}
                  isSelected={src === selectedImage}
                  onSelect={() => setSelectedImage(src)}
                />
              ))}
            </div>
          </>
        ) : (
          <QuadTreatmentGrid
            treatments={quadTreatments}
            onToggleTreatment={onToggleQuadTreatment}
          />
        )}
      </div>

      <div className="flex items-end justify-end gap-4 px-6 pb-4">
        <Button
          variant="outline"
          disabled={!canRemove}
          onClick={() => setRemoveOpen(true)}
        >
          Remove
        </Button>
        <ConfirmDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          title={removeDialogTitle}
          description={
            <>
              {removeDialogDescription}
              {isSaved
                ? " It will also be removed from the saved patient report."
                : ""}{" "}
              This action can&rsquo;t be undone.
            </>
          }
          actionLabel="Remove selections"
          onConfirm={onRemove}
        />
        <Button
          onClick={onSaveToReport}
          disabled={!canSave}
          aria-label={isSaved ? "Added to report" : "Add to report"}
          className={cn(
            isSaved &&
              "bg-green-600 text-white hover:bg-green-600 disabled:opacity-100",
          )}
        >
          {isSaved && <i className="fa-solid fa-check text-sm" aria-hidden />}
          {isSaved ? "Added" : "Add to Report"}
        </Button>
      </div>
    </div>
  );
}
