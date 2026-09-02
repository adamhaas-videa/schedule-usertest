import { useLayoutEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Patient, Insurance, ConditionAlertSeverity } from "@/data/mockPatients";
import { computeAge } from "@/data/mockPatients";
import {
  buildCardSummary,
  getCardMedicalAlerts,
} from "@/data/patientSummary";
import type { ClinicalTab } from "@/types/clinical";
import {
  formatTreatmentHeader,
  getCardTone,
  getProviderHoverName,
} from "@/lib/appointmentColors";
import type { CardColorMode } from "@/lib/cardVersions";
import { getProviderColor } from "@/lib/providerColors";
import { getSummaryVersion, type SummaryVersion } from "@/lib/summaryVersions";
import { cn } from "@/lib/utils";

type ChipTone = "red" | "amber" | "orange" | "green" | "muted";

const CHIP_TONE: Record<ChipTone, string> = {
  red: "bg-red-100 text-destructive",
  amber: "bg-amber-100 text-amber-700",
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-600",
  muted: "bg-muted text-muted-foreground",
};

function StatusChip({
  tone,
  icon,
  label,
  tooltip,
}: {
  tone: ChipTone;
  icon: string;
  label: string;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-full border-0 p-0 cursor-default",
          CHIP_TONE[tone]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <i className={cn(icon, "text-[10px] leading-none")} aria-hidden />
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function perioTone(severity: ConditionAlertSeverity | undefined): ChipTone {
  if (severity === "success") return "green";
  if (severity === "accent") return "amber";
  if (severity === "warning") return "orange";
  if (severity === "error") return "red";
  return "muted";
}

function insuranceTone(status: Insurance["status"]): ChipTone {
  if (status === "Active") return "green";
  if (status === "Pending") return "amber";
  return "muted";
}

function InsuranceBadge({ insurance }: { insurance: Insurance }) {
  const tone =
    insurance.status === "Active"
      ? "border-success-muted-border bg-success-muted text-success"
      : insurance.status === "Pending"
        ? "border-warning-muted-border bg-warning-muted text-warning-emphasis"
        : "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center gap-1 rounded-full border px-1.5 shrink-0",
        tone
      )}
    >
      <i className="fa-solid fa-shield-check text-[10px] leading-none" aria-hidden />
      <span className="text-[10px] font-medium leading-none">
        {insurance.status}
      </span>
    </span>
  );
}

function TruncatedSummary({
  text,
  onMore,
}: {
  text: string;
  /** Opens the patient summary panel — the "more" link's target. */
  onMore: (e: React.MouseEvent) => void;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setTruncated(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div className="relative min-h-0">
      <p
        ref={ref}
        className="text-[11px] leading-[15px] text-foreground line-clamp-2"
      >
        {text}
      </p>
      {truncated && (
        // Link-styled so the overflow reads as a hit target. The card itself
        // already opens the summary on click; this stops the bubble so the
        // panel opens once, from the link.
        <button
          type="button"
          onClick={onMore}
          aria-label="Read the full patient summary"
          // Block at the blurb's own 11px/15px rhythm so it reads as the next
          // line of the summary rather than a detached tag.
          className="block cursor-pointer text-[11px] font-medium leading-[15px] text-periwinkle-600 underline underline-offset-2 decoration-periwinkle-600/60 hover:text-periwinkle-700 hover:decoration-periwinkle-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-sm"
        >
          more
        </button>
      )}
    </div>
  );
}

function IconAction({
  label,
  muted,
  onClick,
  children,
}: {
  label: string;
  muted?: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label={label}
            className={cn(muted && "text-muted-foreground hover:text-foreground")}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

type ActionSlot = "avatar" | "voice" | "review";

const ACTION_VISUAL_ORDER: ActionSlot[] = ["avatar", "voice", "review"];

// First to leave as the action row narrows. Review never drops.
const ACTION_DROP_ORDER: Exclude<ActionSlot, "review">[] = ["voice", "avatar"];

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) if (!b.has(item)) return false;
  return true;
}

function ReviewButton({
  reviewed,
  fullWidth,
  onReview,
}: {
  reviewed: boolean;
  fullWidth?: boolean;
  onReview: (e: React.MouseEvent) => void;
}) {
  if (reviewed) {
    return (
      <button
        type="button"
        onClick={onReview}
        aria-label="Reviewed"
        className={cn(
          "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-success-muted-border bg-success-muted px-2.5 text-sm font-medium whitespace-nowrap text-success-muted-foreground transition-colors hover:bg-success-muted-hover cursor-pointer",
          fullWidth && "w-full"
        )}
      >
        Reviewed
        <i className="fa-solid fa-check text-[11px]" aria-hidden />
      </button>
    );
  }
  return (
    <Button size="default" className={cn(fullWidth && "w-full")} onClick={onReview}>
      Review
      <i
        className="fa-regular fa-arrow-right text-sm"
        data-icon="inline-end"
        aria-hidden
      />
    </Button>
  );
}

function ProviderAvatar({
  patient,
  isCompleted,
}: {
  patient: Patient;
  isCompleted: boolean;
}) {
  if (!patient.provider) return null;
  const color = getProviderColor(patient.provider.id);
  return (
    <div className={cn("shrink-0", isCompleted && "opacity-60")}>
      <Tooltip>
        <TooltipTrigger
          aria-label={getProviderHoverName(patient.provider)}
          className="inline-flex shrink-0 rounded-full border-0 bg-transparent p-0 cursor-default"
        >
          <Avatar
            size="sm"
            className="size-6 after:border-transparent"
            style={{ backgroundColor: color.bg }}
          >
            <AvatarFallback
              className="text-[10px] font-semibold"
              style={{ backgroundColor: color.bg, color: color.fg }}
            >
              {patient.provider.initials}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="top">
          {getProviderHoverName(patient.provider)}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

const HOVER_REVEAL =
  "opacity-0 pointer-events-none transition-opacity duration-150 group-hover/card:opacity-100 group-hover/card:pointer-events-auto group-focus-within/card:opacity-100 group-focus-within/card:pointer-events-auto";

function CardActionBar({
  patient,
  reviewed,
  isCompleted,
  hoverIcons,
  onOpenTab,
  onReview,
}: {
  patient: Patient;
  reviewed: boolean;
  isCompleted: boolean;
  hoverIcons: boolean;
  onOpenTab: (e: React.MouseEvent, tab: ClinicalTab) => void;
  onReview: (e: React.MouseEvent) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [dropped, setDropped] = useState<Set<ActionSlot>>(new Set());
  const hasAvatar = Boolean(patient.provider);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;

    const present = new Set<ActionSlot>(["voice", "review"]);
    if (hasAvatar) present.add("avatar");

    const fit = () => {
      const available = row.clientWidth;
      const reviewEl = measure.querySelector<HTMLElement>(
        '[data-action-slot="review"]'
      );
      if (available <= 0 || !reviewEl || reviewEl.getBoundingClientRect().width <= 0) {
        return;
      }

      const gap =
        Number.parseFloat(getComputedStyle(measure).columnGap || "0") || 0;
      const widths: Partial<Record<ActionSlot, number>> = {};
      for (const el of measure.querySelectorAll<HTMLElement>("[data-action-slot]")) {
        const slot = el.dataset.actionSlot as ActionSlot;
        widths[slot] = el.getBoundingClientRect().width;
      }

      const hidden = new Set<ActionSlot>();
      const packedWidth = (skip: Set<ActionSlot>) => {
        const shown = ACTION_VISUAL_ORDER.filter(
          (slot) => present.has(slot) && !skip.has(slot)
        );
        if (shown.length === 0) return 0;
        const content = shown.reduce((sum, slot) => sum + (widths[slot] ?? 0), 0);
        return content + gap * (shown.length - 1);
      };

      for (const slot of ACTION_DROP_ORDER) {
        if (!present.has(slot)) continue;
        if (Math.ceil(packedWidth(hidden)) <= Math.floor(available)) break;
        hidden.add(slot);
      }

      setDropped((prev) => (setsEqual(prev, hidden) ? prev : hidden));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [hasAvatar, reviewed]);

  const visible = (slot: ActionSlot) => {
    if (dropped.has(slot) && slot !== "review") return false;
    if (slot === "avatar") return hasAvatar;
    return true;
  };

  const reviewOnly =
    visible("review") && !visible("avatar") && !visible("voice");

  const voiceIcon = () => (
    <IconAction
      label="Voice notes"
      muted={isCompleted}
      onClick={(e) => onOpenTab(e, "voice")}
    >
      <i className="fa-regular fa-microphone text-base" aria-hidden />
    </IconAction>
  );
  const reviewButton = (fullWidth?: boolean) => (
    <ReviewButton
      reviewed={reviewed}
      fullWidth={fullWidth}
      onReview={onReview}
    />
  );

  const slot = (id: ActionSlot, node: React.ReactNode) => (
    <div data-action-slot={id} className="shrink-0">
      {node}
    </div>
  );

  return (
    <div
      className="relative w-full min-w-0"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={measureRef}
        aria-hidden
        inert
        className="pointer-events-none invisible absolute top-0 left-0 flex items-center gap-1.5 whitespace-nowrap"
      >
        {hasAvatar &&
          slot(
            "avatar",
            <ProviderAvatar patient={patient} isCompleted={isCompleted} />
          )}
        {slot("voice", voiceIcon())}
        {slot("review", reviewButton())}
      </div>

      <div
        ref={rowRef}
        className="flex w-full min-w-0 items-center justify-end gap-1.5 overflow-hidden"
      >
        {visible("avatar") && (
          <div className="mr-auto shrink-0">
            <ProviderAvatar patient={patient} isCompleted={isCompleted} />
          </div>
        )}
        <div
          className={cn(
            "flex items-center justify-end gap-1.5",
            hoverIcons && HOVER_REVEAL,
            reviewOnly ? "min-w-0 w-full flex-1" : "shrink-0"
          )}
        >
          {visible("voice") && <div className="shrink-0">{voiceIcon()}</div>}
          <div className={cn("shrink-0", reviewOnly && "min-w-0 w-full flex-1")}>
            {reviewButton(reviewOnly)}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface SummaryActionsCardProps {
  patient: Patient;
  privacyMode: boolean;
  summaryVersion: SummaryVersion;
  cardColorMode: CardColorMode;
  /** Demo toggle: render the Patient Summary blurb and the divider above it. */
  showSummary: boolean;
  reviewed: boolean;
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
  onSelectPatient?: (patient: Patient) => void;
  onReview: (e: React.MouseEvent) => void;
  className?: string;
}

export default function SummaryActionsCard({
  patient,
  privacyMode,
  summaryVersion,
  cardColorMode,
  showSummary,
  reviewed,
  onOpenClinical,
  onSelectPatient,
  onReview,
  className,
}: SummaryActionsCardProps) {
  const { sections } = getSummaryVersion(summaryVersion);
  const showInsurance = sections.insurance && Boolean(patient.insurance);
  const isSmall = patient.durationMinutes <= 30;
  // A full-hour card (228px) has spare height once the header, insurance row,
  // divider, summary, and footer are laid out; a 45-min card does not.
  const isTall = patient.durationMinutes >= 60;
  // Each grouping (header / insurance / divider / summary) gets 4px more
  // breathing room where the card can afford it: every tall card, and any
  // non-small card once the summary is off and its rows are gone.
  const roomy = !isSmall && (isTall || !showSummary);
  const isCompleted = patient.status === "completed";
  const isInChair = patient.status === "in-chair";
  // Same interaction as V2: in-chair keeps CTAs on; every other card
  // (upcoming, ready, completed) reveals them on hover/focus.
  const hoverActions = !isInChair;
  const tone = getCardTone(patient, cardColorMode);
  const age = computeAge(patient.dob);
  const treatment = formatTreatmentHeader(patient);
  const medical = getCardMedicalAlerts(patient);
  const blurb = buildCardSummary(patient);
  const nameClass = privacyMode ? "blur-sm select-none" : "";

  const openSummary = () => {
    onSelectPatient?.(patient);
  };

  const openTab = (e: React.MouseEvent, tab: ClinicalTab) => {
    e.stopPropagation();
    onOpenClinical(patient, tab);
  };

  const showMedical = medical.length > 0;
  const perioLabel = patient.conditionAlert?.label ?? "No bone loss detected";
  const perioChip = perioTone(patient.conditionAlert?.severity);

  const statusIcons = (
    <div className="flex items-center gap-1 shrink-0">
      {showMedical && (
        <StatusChip
          tone="red"
          icon="fa-solid fa-plus"
          label="Medical history"
          tooltip={medical.join(" · ")}
        />
      )}
      <StatusChip
        tone={perioChip}
        icon="fa-solid fa-tooth"
        label="Perio health"
        tooltip={perioLabel}
      />
      {isSmall && showInsurance && patient.insurance && (
        <StatusChip
          tone={insuranceTone(patient.insurance.status)}
          icon="fa-solid fa-shield-check"
          label="Insurance"
          tooltip={`${patient.insurance.status} · ${patient.insurance.carrier} · $${patient.insurance.remainingBenefit} left`}
        />
      )}
    </div>
  );

  return (
    <TooltipProvider delay={150}>
      <div
        className={cn(
          "group/card @container/card relative flex h-full flex-col overflow-hidden rounded-[10px] border-[1.5px] bg-card transition-colors cursor-pointer",
          "hover:bg-stone-50 dark:hover:bg-foreground/[0.07]",
          isCompleted && "border-border",
          className
        )}
        style={isCompleted ? undefined : { borderColor: tone.border }}
        onClick={openSummary}
      >
        <div
          className={cn(
            "flex h-7 shrink-0 items-center justify-between gap-1.5 border-b px-3",
            isCompleted && "opacity-60"
          )}
          style={{
            backgroundColor: tone.bg,
            borderBottomColor: isCompleted ? undefined : tone.border,
            color: tone.fg,
          }}
        >
          <p className="min-w-0 truncate text-[11px] font-semibold uppercase leading-[17px] tracking-[0.22px]">
            {treatment.prefix ? (
              <>
                <span className="text-foreground">{treatment.prefix}</span>
                <span className="text-foreground"> · </span>
              </>
            ) : null}
            <span>{treatment.procedure}</span>
          </p>
          <span className="shrink-0 text-[10px] font-semibold leading-[15.5px] tracking-[0.4px] opacity-85 tabular-nums">
            {patient.durationMinutes} min
          </span>
        </div>

        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col px-3 pt-2 pb-2.5",
            isSmall &&
              "group-hover/card:bg-stone-100 dark:group-hover/card:bg-foreground/[0.04]"
          )}
        >
          <div
            className={cn(
              "flex items-start justify-between gap-2",
              isCompleted && "opacity-60"
            )}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <p
                className={cn(
                  "text-sm font-semibold text-foreground truncate leading-[16.8px] tracking-[-0.084px]",
                  nameClass
                )}
              >
                {patient.name}
              </p>
              <span className="mt-0.5 text-[11px] leading-[15px] text-zinc-600 tabular-nums whitespace-nowrap">
                {patient.appointmentTime} · Age {age}
              </span>
              {!isSmall && showInsurance && patient.insurance && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 py-0.5 min-w-0",
                    roomy ? "mt-1.5" : "mt-0.5"
                  )}
                >
                  <InsuranceBadge insurance={patient.insurance} />
                  <span className="text-[10px] text-muted-foreground truncate">
                    {patient.insurance.carrier} · $
                    {patient.insurance.remainingBenefit} left
                  </span>
                </div>
              )}
            </div>
            {statusIcons}
          </div>

          {!isSmall && (
            <>
              {showSummary && (
                <>
                  <div className={roomy ? "py-2.5" : "py-1.5"}>
                    <div className="h-px w-full bg-border" />
                  </div>
                  <div
                    className={cn(
                      "flex min-h-0 flex-1 flex-col gap-1",
                      isCompleted && "opacity-60"
                    )}
                  >
                    <p className="text-[10px] uppercase leading-none text-muted-foreground">
                      Patient Summary
                    </p>
                    <TruncatedSummary
                      text={blurb}
                      onMore={(e) => {
                        e.stopPropagation();
                        openSummary();
                      }}
                    />
                  </div>
                </>
              )}
              {/* mt-auto pins the footer to the card's bottom edge when the
                  summary (the only flex-1 row) is toggled off. */}
              <div className="mt-auto pt-1.5">
                <CardActionBar
                  patient={patient}
                  reviewed={reviewed}
                  isCompleted={isCompleted}
                  hoverIcons={hoverActions}
                  onOpenTab={openTab}
                  onReview={onReview}
                />
              </div>
            </>
          )}

          {isSmall && (
            <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-2.5 pt-1.5">
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-100 from-[38%] to-transparent dark:from-muted",
                  hoverActions && HOVER_REVEAL
                )}
              />
              <div className="relative">
                <CardActionBar
                  patient={patient}
                  reviewed={reviewed}
                  isCompleted={isCompleted}
                  hoverIcons={hoverActions}
                  onOpenTab={openTab}
                  onReview={onReview}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
