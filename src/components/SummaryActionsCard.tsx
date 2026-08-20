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

function PerioIcon({ className }: { className?: string }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      className={cn("shrink-0", className)}
    >
      <path d="M13.2009 11.4583V17.6705C13.2009 18.0588 12.8723 18.3873 12.4841 18.3873C12.0958 18.3873 11.7673 18.0588 11.7673 17.6705V11.4583C11.7673 11.07 12.0958 10.7415 12.4841 10.7415C12.8723 10.7415 13.2009 11.07 13.2009 11.4583ZM15.5902 12.414V16.7148C15.5902 17.1031 15.2617 17.4316 14.8734 17.4316C14.4851 17.4316 14.1566 17.1031 14.1566 16.7148V12.414C14.1566 12.0257 14.4851 11.6972 14.8734 11.6972C15.2617 11.6972 15.5902 12.0257 15.5902 12.414ZM10.8115 12.8919V16.2369C10.8115 16.6252 10.483 16.9537 10.0947 16.9537C9.70646 16.9537 9.37793 16.6252 9.37793 16.2369V12.8919C9.37793 12.5036 9.70646 12.1751 10.0947 12.1751C10.483 12.1751 10.8115 12.5036 10.8115 12.8919ZM17.9795 13.8476V15.2812C17.9795 15.6695 17.651 15.998 17.2627 15.998C16.8745 15.998 16.5459 15.6695 16.5459 15.2812V13.8476C16.5459 13.4593 16.8745 13.1308 17.2627 13.1308C17.651 13.1308 17.9795 13.4593 17.9795 13.8476Z" fill="currentColor"/>
      <path d="M11.7666 3C13.7675 3.00011 15.3797 4.61241 15.3799 6.61328V8.79395C15.3799 9.25833 15.3098 9.73566 15.1641 10.1904C14.8589 10.3374 14.2119 10.4671 13.8018 9.70801C13.8944 9.41403 13.9463 9.10429 13.9463 8.79395V6.61328C13.9461 5.41881 12.9611 4.4337 11.7666 4.43359C11.4383 4.43359 11.0798 4.52269 10.7812 4.67188L9.01855 5.56836C8.80952 5.6579 8.57035 5.65794 8.36133 5.56836L6.59961 4.67188C6.30106 4.5226 5.97249 4.43366 5.61426 4.43359C4.41968 4.43359 3.43375 5.41874 3.43359 6.61328V8.79395C3.43361 9.27177 3.55267 9.74987 3.76172 10.168L4.47852 11.6016C4.7174 12.1092 4.86701 12.6465 4.92676 13.2139L5.22559 16.3799C5.25545 16.6487 5.49487 16.8574 5.76367 16.8574C6.00245 16.8572 6.24066 16.6782 6.27051 16.4395L7.13672 12.4072C7.15117 12.335 7.17175 12.2652 7.19531 12.1973C7.54125 12.0297 8.34446 12.1311 8.53809 12.6855L7.6748 16.7383C7.49563 17.6341 6.68934 18.2908 5.76367 18.291C4.7482 18.291 3.91187 17.5145 3.82227 16.499L3.49316 13.334C3.4633 12.9457 3.37354 12.5869 3.19434 12.2285L2.47754 10.8252C2.14902 10.198 2.00002 9.48084 2 8.79395V6.61328C2.00015 4.61234 3.61328 3 5.61426 3C6.18151 3.00005 6.719 3.11903 7.22656 3.3877L8.69043 4.10449L10.1533 3.3877C10.6611 3.1189 11.1991 3 11.7666 3Z" fill="currentColor"/>
    </svg>
  );
}

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
        <button
          type="button"
          onClick={onMore}
          className="mt-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
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

type ActionSlot = "avatar" | "voice" | "perio" | "images" | "review";

const ACTION_VISUAL_ORDER: ActionSlot[] = [
  "avatar",
  "voice",
  "perio",
  "images",
  "review",
];

// First to leave as the action row narrows. Review never drops.
const ACTION_DROP_ORDER: Exclude<ActionSlot, "review">[] = [
  "perio",
  "voice",
  "avatar",
  "images",
];

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) if (!b.has(item)) return false;
  return true;
}

function ReviewButton({
  reviewed,
  fullWidth,
  onReview,
  onOpenChart,
}: {
  reviewed: boolean;
  fullWidth?: boolean;
  onReview: (e: React.MouseEvent) => void;
  onOpenChart: (e: React.MouseEvent) => void;
}) {
  if (reviewed) {
    return (
      <button
        type="button"
        onClick={onOpenChart}
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
  showVoiceActions,
  reviewed,
  isCompleted,
  hoverIcons,
  onOpenTab,
  onReview,
}: {
  patient: Patient;
  showVoiceActions: boolean;
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

    const present = new Set<ActionSlot>(["images", "review"]);
    if (hasAvatar) present.add("avatar");
    if (showVoiceActions) {
      present.add("voice");
      present.add("perio");
    }

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
  }, [hasAvatar, showVoiceActions, reviewed]);

  const visible = (slot: ActionSlot) => {
    if (dropped.has(slot) && slot !== "review") return false;
    if (slot === "avatar") return hasAvatar;
    if (slot === "voice" || slot === "perio") return showVoiceActions;
    return true;
  };

  const reviewOnly =
    visible("review") &&
    !visible("avatar") &&
    !visible("voice") &&
    !visible("perio") &&
    !visible("images");

  const voiceIcon = () => (
    <IconAction
      label="Voice note"
      muted={isCompleted}
      onClick={(e) => onOpenTab(e, "voice")}
    >
      <i className="fa-regular fa-microphone text-base" aria-hidden />
    </IconAction>
  );
  const perioIcon = () => (
    <IconAction
      label="Perio"
      muted={isCompleted}
      onClick={(e) => onOpenTab(e, "perio")}
    >
      <PerioIcon className="size-4 text-base" />
    </IconAction>
  );
  const imagesIcon = () => (
    <IconAction
      label="Images"
      muted={isCompleted}
      onClick={(e) => onOpenTab(e, "xray")}
    >
      <i className="fa-regular fa-images text-base" aria-hidden />
    </IconAction>
  );
  const reviewButton = (fullWidth?: boolean) => (
    <ReviewButton
      reviewed={reviewed}
      fullWidth={fullWidth}
      onReview={onReview}
      onOpenChart={(e) => onOpenTab(e, "chart")}
    />
  );

  const slot = (id: ActionSlot, node: React.ReactNode) => (
    <div data-action-slot={id} className="shrink-0">
      {node}
    </div>
  );

  return (
    <div className="relative w-full min-w-0">
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
        {showVoiceActions && (
          <>
            {slot("voice", voiceIcon())}
            {slot("perio", perioIcon())}
          </>
        )}
        {slot("images", imagesIcon())}
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
          {visible("perio") && <div className="shrink-0">{perioIcon()}</div>}
          {visible("images") && <div className="shrink-0">{imagesIcon()}</div>}
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
  reviewed,
  onOpenClinical,
  onSelectPatient,
  onReview,
  className,
}: SummaryActionsCardProps) {
  const { sections } = getSummaryVersion(summaryVersion);
  const showInsurance = sections.insurance && Boolean(patient.insurance);
  const showVoiceActions = sections.shortcuts;
  const isSmall = patient.durationMinutes <= 30;
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

  const openSummary = (e: React.MouseEvent) => {
    e.stopPropagation();
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
          "group/card @container/card relative flex h-full flex-col overflow-hidden rounded-[10px] border-[1.5px] bg-card transition-colors",
          "hover:bg-stone-50 dark:hover:bg-foreground/[0.07]",
          isCompleted && "border-border",
          className
        )}
        style={isCompleted ? undefined : { borderColor: tone.border }}
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
              <button
                type="button"
                onClick={openSummary}
                className={cn(
                  "text-left text-sm font-semibold text-foreground truncate leading-[16.8px] tracking-[-0.084px] hover:underline focus-visible:underline outline-none cursor-pointer",
                  nameClass
                )}
              >
                {patient.name}
              </button>
              <span className="mt-0.5 text-[11px] leading-[15px] text-zinc-600 tabular-nums whitespace-nowrap">
                {patient.appointmentTime} · Age {age}
              </span>
              {!isSmall && showInsurance && patient.insurance && (
                <div className="mt-0.5 flex items-center gap-1.5 py-0.5 min-w-0">
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
              <div className="py-1.5">
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
                <TruncatedSummary text={blurb} onMore={openSummary} />
              </div>
              <div className="pt-1.5">
                <CardActionBar
                  patient={patient}
                  showVoiceActions={showVoiceActions}
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
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-20 px-3 pb-2.5 pt-1.5",
                "bg-gradient-to-t from-stone-100 from-[38%] to-transparent",
                "dark:from-muted",
                hoverActions && HOVER_REVEAL
              )}
            >
              <CardActionBar
                patient={patient}
                showVoiceActions={showVoiceActions}
                reviewed={reviewed}
                isCompleted={isCompleted}
                hoverIcons={false}
                onOpenTab={openTab}
                onReview={onReview}
              />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
