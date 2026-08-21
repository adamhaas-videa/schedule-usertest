import { memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/data/mockPatients";
import { computeAge, isHygieneProcedure } from "@/data/mockPatients";
import type { ClinicalTab } from "@/types/clinical";
import { getProviderColor } from "@/lib/providerColors";
import { DEFAULT_CARD_VERSION, type CardVersion } from "@/lib/cardVersions";
import { useAiView } from "@/context/AiViewContext";
import { cn } from "@/lib/utils";
import SummaryActionsCard from "@/components/SummaryActionsCard";

interface PatientCardProps {
  patient: Patient;
  variant: "full" | "compact" | "calendar";
  isPeek?: boolean;
  privacyMode?: boolean;
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
  onSelectPatient?: (patient: Patient) => void;
  cardVersion?: CardVersion;
}

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

type StatusKind = "active" | "in-chair" | "ready" | "completed" | "pending" | "inactive";

function deriveStatus(patient: Patient): StatusKind {
  if (patient.status === "in-chair") return "in-chair";
  if (patient.readyForChair) return "ready";
  if (patient.status === "completed") return "completed";
  if (patient.insurance?.status === "Pending") return "pending";
  return "active";
}

interface StatusCfg {
  label: string;
  icon: string;
  className: string;
  iconClass: string;
}

const STATUS_CFG: Partial<Record<StatusKind, StatusCfg>> = {
  completed: {
    label: "Completed",
    icon: "fa-solid fa-check",
    className: "bg-muted text-muted-foreground border-border",
    iconClass: "text-muted-foreground",
  },
};

function StatusBadge({ kind }: { kind: StatusKind }) {
  const cfg = STATUS_CFG[kind];
  if (!cfg) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-[18px] px-2 rounded-full whitespace-nowrap shrink-0 border",
        cfg.className
      )}
    >
      <i className={cn(cfg.icon, "text-[10px]", cfg.iconClass)} aria-hidden />
      <span className="text-[10px] font-medium leading-none">{cfg.label}</span>
    </span>
  );
}

function ProviderChip({ patient }: { patient: Patient }) {
  const provider = patient.provider;
  if (!provider) return <div className="h-[22px]" />;
  const color = getProviderColor(provider.id);
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Avatar
        size="sm"
        className="size-[22px] after:border-transparent shrink-0"
        style={{ backgroundColor: color.bg }}
      >
        <AvatarFallback
          className="text-[10px] font-semibold"
          style={{ backgroundColor: color.bg, color: color.fg }}
        >
          {provider.initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-[11px] font-medium text-muted-foreground truncate">
        {provider.name}
      </span>
    </div>
  );
}

function ActionStrip({
  hoverOnly,
  gapClass,
  children,
}: {
  hoverOnly: boolean;
  gapClass: "gap-2" | "gap-1.5";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 flex items-center justify-end px-2.5 pt-3 pb-2.5",
        gapClass,
        "bg-gradient-to-t from-card from-60% via-card via-80% to-transparent group-hover/card:from-stone-50 group-hover/card:via-stone-50",
        hoverOnly &&
          "opacity-0 pointer-events-none transition-opacity duration-150 group-hover/card:opacity-100 group-hover/card:pointer-events-auto group-focus-within/card:opacity-100 group-focus-within/card:pointer-events-auto"
      )}
    >
      {children}
    </div>
  );
}

function TertiaryIconButton({
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
    <Button
      variant="outline"
      size="icon"
      className={cn(
        muted && "text-muted-foreground hover:text-foreground"
      )}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </Button>
  );
}

// V2: Voice + Perio (tertiary icons) then Review (primary, right). Clicking
// Review opens the patient workflow and flips the CTA to Reviewed.
function AlwaysOnReviewActions({
  reviewed,
  onAction,
  onReview,
  muted = false,
  hoverOnly = false,
  showPerio = false,
}: {
  reviewed: boolean;
  onAction: (e: React.MouseEvent, tab: ClinicalTab) => void;
  onReview: (e: React.MouseEvent) => void;
  muted?: boolean;
  hoverOnly?: boolean;
  showPerio?: boolean;
}) {
  return (
    <ActionStrip hoverOnly={hoverOnly} gapClass="gap-1.5">
      {/* Two-stage collapse as the operatory column (the @container/card)
          narrows. Measured against the card, not the viewport, so 8-up
          columns shed icons even on a wide display.
            ≤200px: Perio drops (Voice + Review)
            ≤156px: Voice drops (Review only) */}
      <div className="@max-[156px]/card:hidden">
        <TertiaryIconButton
          label="Voice note"
          muted={muted}
          onClick={(e) => onAction(e, "voice")}
        >
          <i className="fa-regular fa-microphone w-4 h-4" aria-hidden />
        </TertiaryIconButton>
      </div>
      {showPerio && (
        <div className="@max-[200px]/card:hidden">
          <TertiaryIconButton
            label="Perio"
            muted={muted}
            onClick={(e) => onAction(e, "perio")}
          >
            <PerioIcon className="w-4 h-4" />
          </TertiaryIconButton>
        </div>
      )}
      {reviewed ? (
        <button
          type="button"
          onClick={(e) => onAction(e, "xray")}
          aria-label="Reviewed"
          className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-full bg-success-muted text-success-muted-foreground border border-success-muted-border text-sm font-medium whitespace-nowrap hover:bg-success-muted-hover transition-colors cursor-pointer"
        >
          Reviewed
          <i className="fa-solid fa-check text-[11px]" aria-hidden />
        </button>
      ) : (
        <Button size="default" onClick={onReview}>
          Review
          <i
            className="fa-regular fa-arrow-right text-sm"
            data-icon="inline-end"
            aria-hidden
          />
        </Button>
      )}
    </ActionStrip>
  );
}

// V3: Images / Voice / Perio icon buttons. Reveal on hover. Muted on completed.
function HoverIconActions({
  onAction,
  muted = false,
  hoverOnly = false,
  showPerio = false,
}: {
  onAction: (e: React.MouseEvent, tab: ClinicalTab) => void;
  muted?: boolean;
  hoverOnly?: boolean;
  showPerio?: boolean;
}) {
  const mutedClass = muted
    ? "bg-muted text-muted-foreground hover:bg-muted-hover hover:text-foreground"
    : "";
  return (
    <ActionStrip hoverOnly={hoverOnly} gapClass="gap-1.5">
      <Button
        size="icon"
        className={mutedClass}
        onClick={(e) => onAction(e, "xray")}
        aria-label="Images"
      >
        <i className="fa-regular fa-images w-4 h-4" aria-hidden />
      </Button>
      <Button
        size="icon"
        className={mutedClass}
        onClick={(e) => onAction(e, "voice")}
        aria-label="Voice note"
      >
        <i className="fa-regular fa-microphone w-4 h-4" aria-hidden />
      </Button>
      {showPerio && (
        <Button
          size="icon"
          className={mutedClass}
          onClick={(e) => onAction(e, "perio")}
          aria-label="Perio"
        >
          <PerioIcon className="w-4 h-4" />
        </Button>
      )}
    </ActionStrip>
  );
}

interface CardChromeProps {
  patient: Patient;
  privacyMode: boolean;
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
  onSelectPatient?: (patient: Patient) => void;
  cardVersion: CardVersion;
  className?: string;
}

function FullCard({
  patient,
  privacyMode,
  onOpenClinical,
  onSelectPatient,
  cardVersion,
  className,
}: CardChromeProps) {
  const { reviewedIds, markReviewed, summaryVersion, cardColorMode } =
    useAiView();
  const status = deriveStatus(patient);
  const age = computeAge(patient.dob);
  const nameClass = privacyMode ? "blur-sm select-none" : "";
  const reviewed = reviewedIds.has(patient.id);

  // A 30-min appointment renders at ~88px (durationToHeight(30) - CARD_GAP),
  // which is only just tall enough for the top row + provider chip — the
  // bottom-pinned action strip lands directly on top of the provider row. At
  // 45 min (~133px) there is room for both, so those cards behave like tall
  // ones. Threshold is duration-based so the layout is identical in every view
  // (operatory or provider grouping, focused or not) — the grid computes card
  // height purely from durationMinutes.
  const isSmall = patient.durationMinutes <= 30;

  // Per-version interaction model (demo switcher):
  //   V1: Summary actions — handled by SummaryActionsCard
  //   V2: Voice + Perio (tertiary) + Review (primary, right); name → summary
  //   V3: Images / Note / Perio revealed on hover/focus; name → summary drawer
  //   V4: no buttons; whole card → Images tab (name is not separately clickable)
  //   V5: no buttons; whole card → Images tab; name → summary drawer
  const showActions = cardVersion === 2 || cardVersion === 3;
  // V2 keeps actions always-on only for the patient currently in the chair;
  // every other card (upcoming, ready, completed, etc.) reveals them on hover.
  // V3 is always hover-reveal.
  const hoverActions =
    cardVersion === 3 || (cardVersion === 2 && status !== "in-chair");
  const cardOpensImages = cardVersion === 4 || cardVersion === 5;
  const nameOpensSummary =
    cardVersion === 2 || cardVersion === 3 || cardVersion === 5;

  const handleAction = (e: React.MouseEvent, tab: ClinicalTab) => {
    e.stopPropagation();
    onOpenClinical(patient, tab);
  };

  const handleReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    markReviewed(patient.id);
    onOpenClinical(patient, "xray");
  };

  const handleSummaryReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    markReviewed(patient.id);
    onOpenClinical(patient, "chart");
  };

  if (cardVersion === 1) {
    return (
      <SummaryActionsCard
        patient={patient}
        privacyMode={privacyMode}
        summaryVersion={summaryVersion}
        cardColorMode={cardColorMode}
        reviewed={reviewed}
        onOpenClinical={onOpenClinical}
        onSelectPatient={onSelectPatient}
        onReview={handleSummaryReview}
        className={className}
      />
    );
  }

  const handleCardActivate = () => {
    if (cardOpensImages) onOpenClinical(patient, "xray");
  };

  // Active (in-chair) and future cards borrow their provider's avatar tone as a
  // subtle outline — a splash of color to differentiate columns in the grid.
  // Completed cards keep the neutral border.
  const isCompleted = status === "completed";
  const providerTone =
    patient.provider && !isCompleted
      ? getProviderColor(patient.provider.id).bg
      : undefined;

  return (
    <div
      className={cn(
        "group/card @container/card relative flex h-full flex-col gap-2 rounded-[10px] border-[1.5px] bg-card p-2.5 overflow-hidden transition-colors hover:bg-stone-50 dark:hover:bg-foreground/[0.07]",
        providerTone ? "border-transparent" : "border-border",
        cardOpensImages &&
          // Inset rings (not outer): the card wrapper in OperatoryColumn sets
          // content-visibility:auto, whose paint containment clips descendant
          // painting to the wrapper's square box. An outer ring (box-shadow
          // drawn outside the border-box) gets chopped square at the rounded
          // corners; an inset ring stays inside the border-box, follows the
          // 10px radius, and is clipped cleanly by overflow-hidden.
          "cursor-pointer hover:inset-ring-2 hover:inset-ring-stone-300 focus-visible:outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-stone-400",
        className
      )}
      style={providerTone ? { borderColor: providerTone } : undefined}
      {...(cardOpensImages
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-label": `Open ${patient.name} images`,
            onClick: handleCardActivate,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardActivate();
              }
            },
          }
        : {})}
    >
      {/* Top — patient + optional status */}
      <div
        className={cn(
          "flex items-start justify-between gap-2 min-w-0",
          status === "completed" && "opacity-60"
        )}
      >
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {nameOpensSummary ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPatient?.(patient);
              }}
              className={cn(
                "text-left text-sm font-semibold text-foreground truncate leading-tight hover:underline focus-visible:underline outline-none cursor-pointer",
                nameClass
              )}
            >
              {patient.name}
            </button>
          ) : (
            <span
              className={cn(
                "text-sm font-semibold text-foreground truncate leading-tight",
                nameClass
              )}
            >
              {patient.name}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
            {patient.appointmentTime} <span className="px-1">·</span> Age {age}
          </span>
        </div>
        <StatusBadge kind={status} />
      </div>

      {/* Provider chip — sits directly beneath the top row. On a small card the
          action strip occupies this same row, so the chip yields to the actions:
          it fades out while the actions are revealed (hover/focus) and is hidden
          outright when the actions are always-on (V2 in-chair). Tall cards keep
          the chip permanently visible. */}
      <div
        className={cn(
          "min-w-0",
          status === "completed" && "opacity-60",
          isSmall && showActions && "transition-opacity duration-150",
          isSmall && showActions && !hoverActions && "opacity-0",
          isSmall &&
            showActions &&
            hoverActions &&
            "group-hover/card:opacity-0 group-focus-within/card:opacity-0"
        )}
      >
        <ProviderChip patient={patient} />
      </div>

      {showActions &&
        (cardVersion === 2 ? (
          <AlwaysOnReviewActions
            reviewed={reviewed}
            onAction={handleAction}
            onReview={handleReview}
            muted={status === "completed"}
            hoverOnly={hoverActions}
            showPerio={isHygieneProcedure(patient.procedure)}
          />
        ) : (
          <HoverIconActions
            onAction={handleAction}
            muted={status === "completed"}
            hoverOnly={hoverActions}
            showPerio={isHygieneProcedure(patient.procedure)}
          />
        ))}
    </div>
  );
}

function PatientCard({
  patient,
  variant,
  isPeek = false,
  privacyMode = false,
  onOpenClinical,
  onSelectPatient,
  cardVersion = DEFAULT_CARD_VERSION,
}: PatientCardProps) {
  if (variant === "compact") {
    const status = deriveStatus(patient);
    const nameClass = privacyMode ? "blur-sm select-none" : "";
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-[10px] border-[1.5px] border-border bg-card px-3 py-2 transition-colors",
          isPeek && "opacity-50",
          status === "completed" && "opacity-60"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-sm font-medium text-foreground truncate",
              nameClass
            )}
          >
            {patient.name}
          </span>
          {patient.allergies && patient.allergies.length > 0 && (
            <i
              className="fa-solid fa-triangle-exclamation text-warning text-[10px] shrink-0"
              aria-hidden
            />
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground truncate">
            {patient.procedure}
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {patient.appointmentTime}
          </span>
        </div>
      </div>
    );
  }

  return (
    <FullCard
      patient={patient}
      privacyMode={privacyMode}
      onOpenClinical={onOpenClinical}
      onSelectPatient={onSelectPatient}
      cardVersion={cardVersion}
      className={variant === "calendar" ? "h-full" : ""}
    />
  );
}

export default memo(PatientCard);
