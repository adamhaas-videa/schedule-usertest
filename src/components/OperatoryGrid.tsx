import { useEffect, useState } from "react";
import type { Patient } from "@/data/mockPatients";
import { minutesToTime, timeToMinutes } from "@/data/mockPatients";
import OperatoryColumn from "./OperatoryColumn";
import OperatoryHeader from "./OperatoryHeader";
import {
  TOTAL_HEIGHT,
  HOURS,
  START_MINUTES,
  END_MINUTES,
  minutesToY,
  formatHour,
  getSimulatedNowMinutes,
} from "@/lib/timeline";
import type { ClinicalTab, OperatoryFilter } from "@/App";
import { cn } from "@/lib/utils";

interface OperatoryGridProps {
  patients: Patient[];
  privacyMode: boolean;
  operatoryFilter: OperatoryFilter;
  onOperatoryFilterChange: (op: OperatoryFilter) => void;
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const ALL_OPERATORIES = [1, 2, 3, 4];
const HALF_HOURS = HOURS.slice(0, -1);
const GUTTER = 64;
const TOP_PAD = 24;

export default function OperatoryGrid({
  patients,
  privacyMode,
  operatoryFilter,
  onOperatoryFilterChange,
  onOpenClinical,
  scrollRef,
}: OperatoryGridProps) {
  const [nowMinutes, setNowMinutes] = useState(getSimulatedNowMinutes);

  // Scroll the timeline so the given patient's card is centered. Used by the
  // operatory header shortcut (click the in-chair patient name).
  const scrollToPatient = (patient: Patient) => {
    if (!scrollRef.current) return;
    const y = TOP_PAD + minutesToY(timeToMinutes(patient.appointmentTime));
    const halfHeight = scrollRef.current.clientHeight / 2;
    scrollRef.current.scrollTo({
      top: Math.max(0, y - halfHeight),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const interval = setInterval(
      () => setNowMinutes(getSimulatedNowMinutes()),
      60_000
    );
    return () => clearInterval(interval);
  }, []);

  const isWithinHours = nowMinutes >= START_MINUTES && nowMinutes <= END_MINUTES;
  const focused = operatoryFilter !== "all";
  const operatories = focused ? [operatoryFilter as number] : ALL_OPERATORIES;

  useEffect(() => {
    if (!scrollRef.current) return;
    const scrollTarget = isWithinHours ? nowMinutes : START_MINUTES;
    const y = minutesToY(scrollTarget);
    const halfHeight = scrollRef.current.clientHeight / 2;
    scrollRef.current.scrollTo({
      top: Math.max(0, y - halfHeight),
      behavior: "instant",
    });
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Focused-op banner */}
      {focused && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-info-muted border-b border-info-muted-border">
          <button
            onClick={() => onOperatoryFilterChange("all")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-info-emphasis hover:text-primary transition-colors"
          >
            <i className="fa-regular fa-chevron-left text-[10px]" aria-hidden />
            Back to all operatories
          </button>
          <span className="text-[12px] text-info-muted-foreground">
            Focused on <span className="font-semibold">Op {operatoryFilter}</span>
          </span>
        </div>
      )}

      {/* Fixed header row — outside scroll, never moves */}
      <div className="shrink-0 flex border-b border-border bg-card">
        <div className="shrink-0" style={{ width: GUTTER }} />
        {operatories.map((op, i) => {
          const opPatients = patients.filter((p) => p.operatory === op);
          const inChairPatient = opPatients.find((p) => p.status === "in-chair");
          return (
            <div
              key={op}
              className={cn(
                "flex-1 min-w-0",
                i > 0 ? "border-l border-border" : ""
              )}
            >
              <OperatoryHeader
                operatory={op}
                occupied={!!inChairPatient}
                activePatientName={inChairPatient?.name}
                onClick={
                  focused ? undefined : () => onOperatoryFilterChange(op)
                }
                onPatientNameClick={
                  inChairPatient
                    ? () => scrollToPatient(inChairPatient)
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>

      {/* Scrollable timeline body */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex relative" style={{ height: TOTAL_HEIGHT + TOP_PAD }}>
          {/* Now indicator — spans full width */}
          {isWithinHours && (
            <div
              className="group/now absolute left-0 right-0 z-20"
              style={{ top: TOP_PAD + minutesToY(nowMinutes) }}
            >
              <div className="absolute -top-2 left-0 right-0 h-4" />
              <div
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-end pr-1.5 opacity-0 group-hover/now:opacity-100 transition-opacity duration-150"
                style={{ left: 0, width: GUTTER }}
              >
                <span className="text-[9px] font-semibold text-primary bg-info-muted px-1 py-px rounded-full whitespace-nowrap border border-info-muted-border leading-tight">
                  {minutesToTime(nowMinutes)}
                </span>
              </div>
              <div
                className="flex items-center"
                style={{ marginLeft: GUTTER - 4 }}
              >
                <div className="w-2 h-2 rounded-full bg-deep-teal-400 shrink-0" />
                <div className="flex-1 border-t-2 border-deep-teal-400" />
              </div>
            </div>
          )}
          {/* Time labels gutter */}
          <div className="shrink-0 relative" style={{ width: GUTTER }}>
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="absolute right-2 text-[11px] font-medium text-muted-foreground/60 leading-none whitespace-nowrap -translate-y-1/2"
                style={{ top: TOP_PAD + minutesToY(hour * 60) }}
              >
                {formatHour(hour)}
              </span>
            ))}
          </div>

          {/* Operatory columns — bg flush to header, content offset by TOP_PAD */}
          {operatories.map((op, i) => {
            const opPatients = patients.filter((p) => p.operatory === op);
            return (
              <div
                key={op}
                className={cn(
                  "flex-1 min-w-0 bg-card",
                  i > 0 ? "border-l border-border" : ""
                )}
              >
                <div
                  className="relative"
                  style={{ marginTop: TOP_PAD, height: TOTAL_HEIGHT }}
                >
                  {HOURS.map((hour) => (
                    <div
                      key={`h-${hour}`}
                      className="absolute left-0 right-0 border-t border-border/50"
                      style={{ top: minutesToY(hour * 60) }}
                    />
                  ))}
                  {HALF_HOURS.map((hour) => (
                    <div
                      key={`hh-${hour}`}
                      className="absolute left-0 right-0 border-t border-dashed border-border/30"
                      style={{ top: minutesToY(hour * 60 + 30) }}
                    />
                  ))}

                  <OperatoryColumn
                    operatory={op}
                    patients={opPatients}
                    privacyMode={privacyMode}
                    onOpenClinical={onOpenClinical}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
