import { useCallback, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/data/mockPatients";
import { computeAge, timeToMinutes } from "@/data/mockPatients";
import type { ClinicalTab } from "@/types/clinical";
import { useAiView } from "@/context/AiViewContext";
import { getProviderColor } from "@/lib/providerColors";
import {
  allergyLabel,
  FALLBACK_UNSCHEDULED,
  ODONTOGRAM_OPPORTUNITIES,
  patientPhone,
  procedureTooth,
  tasksFor,
  unscheduledTxFor,
} from "@/lib/patientSheet";
import { cn } from "@/lib/utils";

interface PatientDetailDrawerProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  onPatientChange: (patient: Patient) => void;
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
}

const ALERT_TONE = {
  success: {
    chip: "bg-success-muted text-success-emphasis",
    dot: "bg-success",
  },
  accent: {
    chip: "bg-accent-muted text-accent-emphasis",
    dot: "bg-accent-muted-foreground",
  },
  warning: {
    chip: "bg-warning-muted-hover text-warning",
    dot: "bg-warning",
  },
  error: {
    chip: "bg-error-muted text-error-emphasis",
    dot: "bg-destructive",
  },
} as const;

function sortForChartPrep(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => {
    const byTime =
      timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime);
    if (byTime !== 0) return byTime;
    return a.operatory - b.operatory;
  });
}

function formatBenefit(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-normal uppercase leading-none text-muted-foreground">
      {children}
    </p>
  );
}

export default function PatientDetailDrawer({
  patient,
  open,
  onOpenChange,
  patients,
  onPatientChange,
  onOpenClinical,
}: PatientDetailDrawerProps) {
  const { privacyMode, markReviewed } = useAiView();

  const queue = useMemo(() => sortForChartPrep(patients), [patients]);
  const index = patient
    ? queue.findIndex((p) => p.id === patient.id)
    : -1;
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < queue.length - 1;

  const goBy = useCallback(
    (delta: number) => {
      const next = queue[index + delta];
      if (next) onPatientChange(next);
    },
    [queue, index, onPatientChange]
  );

  useEffect(() => {
    if (!open || !patient) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        goBy(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        goBy(1);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, patient, goBy]);

  if (!patient) return null;

  const age = computeAge(patient.dob);
  const phone = patientPhone(patient.id);
  const tooth = procedureTooth(patient);
  const tasks = tasksFor(patient);
  const derivedUnscheduled = unscheduledTxFor(patient);
  const unscheduled =
    derivedUnscheduled.length > 0
      ? derivedUnscheduled
      : FALLBACK_UNSCHEDULED;
  const hasAllergies = Boolean(
    patient.allergies && patient.allergies.length > 0
  );
  const privateText = privacyMode ? "blur-sm select-none" : "";
  const providerColor = patient.provider
    ? getProviderColor(patient.provider.id)
    : null;

  const openClinical = (tab: ClinicalTab) => {
    onOpenChange(false);
    onOpenClinical(patient, tab);
  };

  const handleReview = () => {
    markReviewed(patient.id);
    openClinical("xray");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!w-[520px] !max-w-[520px] gap-6 overflow-hidden p-6 sm:!max-w-[520px]"
      >
        <SheetClose
          aria-label="Close"
          className="absolute top-[15px] right-[15px] flex size-4 items-center justify-center text-foreground opacity-70 transition-opacity hover:opacity-100"
        >
          <i
            className="fa-regular fa-xmark text-[10px] leading-none"
            aria-hidden
          />
        </SheetClose>
        <SheetHeader className="shrink-0 gap-1.5 p-0 pr-8">
          <SheetTitle
            className={cn(
              "text-xl font-semibold leading-none text-foreground",
              privateText
            )}
          >
            {patient.name}
          </SheetTitle>
          <SheetDescription
            className={cn("text-sm text-muted-foreground", privateText)}
          >
            Age {age} • DOB {patient.dob} • {phone}
          </SheetDescription>
          {(hasAllergies || patient.conditionAlert) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {hasAllergies &&
                patient.allergies!.map((allergy) => (
                  <Badge key={allergy} variant="destructive" className="border-muted">
                    <i
                      className="fa-regular fa-triangle-exclamation text-[12px]"
                      data-icon="inline-start"
                      aria-hidden
                    />
                    {allergyLabel(allergy)}
                  </Badge>
                ))}
              {patient.conditionAlert && (
                <span
                  className={cn(
                    "inline-flex h-[19px] w-fit shrink-0 items-center gap-[5px] rounded-full px-2 text-[11px] font-medium leading-none",
                    ALERT_TONE[patient.conditionAlert.severity].chip
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      ALERT_TONE[patient.conditionAlert.severity].dot
                    )}
                  />
                  {patient.conditionAlert.label}
                </span>
              )}
            </div>
          )}
        </SheetHeader>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            className="bg-button-outline-bg"
            onClick={() => openClinical("xray")}
          >
            <i
              className="fa-regular fa-images text-base"
              data-icon="inline-start"
              aria-hidden
            />
            Images
          </Button>
          <Button
            variant="outline"
            className="bg-button-outline-bg"
            onClick={() => openClinical("voice")}
          >
            <i
              className="fa-regular fa-microphone text-base"
              data-icon="inline-start"
              aria-hidden
            />
            Voice Notes
          </Button>
          <Button
            variant="outline"
            className="bg-button-outline-bg"
            onClick={() => openClinical("perio")}
          >
            <i
              className="fa-regular fa-waveform-lines text-base"
              data-icon="inline-start"
              aria-hidden
            />
            Voice Perio
          </Button>
        </div>

        <div
          key={patient.id}
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto"
        >
          {patient.insurance && (
            <section className="flex flex-col gap-1.5">
              <SectionLabel>Insurance</SectionLabel>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  className={cn(
                    "border",
                    patient.insurance.status === "Active" &&
                      "border-success-muted-border bg-success-muted text-success",
                    patient.insurance.status === "Pending" &&
                      "border-warning-muted-border bg-warning-muted text-warning",
                    patient.insurance.status === "Inactive" &&
                      "border-error-muted-border bg-error-muted text-destructive"
                  )}
                >
                  {patient.insurance.status === "Active" && (
                    <i
                      className="fa-solid fa-shield-check text-[12px]"
                      data-icon="inline-start"
                      aria-hidden
                    />
                  )}
                  {patient.insurance.status}
                </Badge>
                <p className="text-sm text-foreground">
                  {patient.insurance.carrier} •{" "}
                  {formatBenefit(patient.insurance.remainingBenefit)} remaining
                  benefits
                </p>
              </div>
            </section>
          )}

          <section className="flex flex-col gap-1.5">
            <SectionLabel>Today</SectionLabel>
            <p className="text-base font-medium leading-6 text-foreground">
              {tooth != null ? `${tooth} • ${patient.procedure}` : patient.procedure}
            </p>
            {patient.provider && providerColor && (
              <div className="flex items-center gap-1.5">
                <Avatar
                  size="sm"
                  className="size-6 after:border-transparent"
                  style={{ backgroundColor: providerColor.bg }}
                >
                  <AvatarFallback
                    className="text-xs font-semibold"
                    style={{
                      backgroundColor: providerColor.bg,
                      color: providerColor.fg,
                    }}
                  >
                    {patient.provider.initials}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">
                  {patient.provider.name} • {patient.appointmentTime} • Op{" "}
                  {patient.operatory}
                </p>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <SectionLabel>AI Opportunities</SectionLabel>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                {ODONTOGRAM_OPPORTUNITIES.map((item) => (
                  <Badge key={item.label} variant="outline">
                    {item.count} {item.label}
                  </Badge>
                ))}
              </div>
              <img
                src="/assets/patient-sheet-odontogram.svg"
                alt="Odontogram with marked treatment"
                width={472}
                height={145}
                className="block h-[145px] w-full"
              />
            </div>
          </section>

          <div className="flex gap-3">
            <section className="flex min-w-0 flex-1 flex-col gap-1.5">
              <SectionLabel>Tasks</SectionLabel>
              {tasks.map((task) => (
                <div
                  key={task}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                >
                  <i
                    className="fa-regular fa-circle text-base text-success"
                    aria-hidden
                  />
                  <i
                    className="fa-regular fa-xmark text-base text-destructive"
                    aria-hidden
                  />
                  <span>{task}</span>
                </div>
              ))}
            </section>
            <section className="flex min-w-0 flex-1 flex-col gap-1.5">
              <SectionLabel>Unscheduled tx</SectionLabel>
              {unscheduled.map((item) => (
                <p
                  key={`${item.tooth}-${item.label}`}
                  className="text-sm text-muted-foreground"
                >
                  {item.tooth} • {item.label}
                </p>
              ))}
            </section>
          </div>
        </div>

        <SheetFooter className="mt-auto min-h-0 shrink-0 flex-row items-center justify-between gap-2.5 p-0">
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="icon"
              className="bg-button-outline-bg"
              disabled={!hasPrev}
              aria-label="Previous patient"
              title="Previous patient (↑)"
              onClick={(e) => {
                e.stopPropagation();
                goBy(-1);
              }}
            >
              <i className="fa-regular fa-angle-up text-base" aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-button-outline-bg"
              disabled={!hasNext}
              aria-label="Next patient"
              title="Next patient (↓)"
              onClick={(e) => {
                e.stopPropagation();
                goBy(1);
              }}
            >
              <i className="fa-regular fa-angle-down text-base" aria-hidden />
            </Button>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              className="bg-button-outline-bg"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button onClick={handleReview}>
              Review
              <i
                className="fa-regular fa-arrow-right text-base"
                data-icon="inline-end"
                aria-hidden
              />
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
