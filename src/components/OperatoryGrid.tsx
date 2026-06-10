import { useEffect, useState } from "react";
import type { Patient } from "@/data/mockPatients";
import { minutesToTime } from "@/data/mockPatients";
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

interface OperatoryGridProps {
  patients: Patient[];
  privacyMode: boolean;
  onSelectPatient: (patient: Patient) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const OPERATORIES = [1, 2, 3, 4];
const HALF_HOURS = HOURS.slice(0, -1);
const GUTTER = 52;
const TOP_PAD = 24;

export default function OperatoryGrid({
  patients,
  privacyMode,
  onSelectPatient,
  scrollRef,
}: OperatoryGridProps) {
  const [nowMinutes, setNowMinutes] = useState(getSimulatedNowMinutes);

  useEffect(() => {
    const interval = setInterval(
      () => setNowMinutes(getSimulatedNowMinutes()),
      60_000
    );
    return () => clearInterval(interval);
  }, []);

  const isWithinHours = nowMinutes >= START_MINUTES && nowMinutes <= END_MINUTES;

  useEffect(() => {
    if (!scrollRef.current) return;
    const scrollTarget = isWithinHours ? nowMinutes : START_MINUTES;
    const y = minutesToY(scrollTarget);
    const halfHeight = scrollRef.current.clientHeight / 2;
    scrollRef.current.scrollTo({ top: Math.max(0, y - halfHeight), behavior: "instant" });
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Fixed header row — outside scroll, never moves */}
      <div className="shrink-0 flex border-b border-slate-200 bg-white">
        <div className="shrink-0" style={{ width: GUTTER }} />
        {OPERATORIES.map((op, i) => {
          const opPatients = patients.filter((p) => p.operatory === op);
          const inChairPatient = opPatients.find((p) => p.status === "in-chair");
          return (
            <div
              key={op}
              className={`flex-1 min-w-0 ${i > 0 ? "border-l border-slate-200" : ""}`}
            >
              <OperatoryHeader
                operatory={op}
                occupied={!!inChairPatient}
                activePatientName={inChairPatient?.name}
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
                <span className="text-[9px] font-semibold text-[#2552EB] bg-[#EEF4FF] px-1 py-px rounded-full whitespace-nowrap border border-[#BFD6FE]/60 leading-tight">
                  {minutesToTime(nowMinutes)}
                </span>
              </div>
              <div className="flex items-center" style={{ marginLeft: GUTTER - 4 }}>
                <div className="w-2 h-2 rounded-full bg-[#6098FA] shrink-0" />
                <div className="flex-1 border-t-2 border-[#6098FA]" />
              </div>
            </div>
          )}
          {/* Time labels gutter */}
          <div className="shrink-0 relative" style={{ width: GUTTER }}>
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="absolute right-2 text-[11px] font-medium text-gray-400 leading-none whitespace-nowrap -translate-y-1/2"
                style={{ top: TOP_PAD + minutesToY(hour * 60) }}
              >
                {formatHour(hour)}
              </span>
            ))}
          </div>

          {/* Operatory columns — bg flush to header, content offset by TOP_PAD */}
          {OPERATORIES.map((op, i) => {
            const opPatients = patients.filter((p) => p.operatory === op);
            return (
              <div
                key={op}
                className={`flex-1 min-w-0 bg-white ${i > 0 ? "border-l border-slate-200" : ""}`}
              >
                <div className="relative" style={{ marginTop: TOP_PAD, height: TOTAL_HEIGHT }}>
                  {HOURS.map((hour) => (
                    <div
                      key={`h-${hour}`}
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: minutesToY(hour * 60) }}
                    />
                  ))}
                  {HALF_HOURS.map((hour) => (
                    <div
                      key={`hh-${hour}`}
                      className="absolute left-0 right-0 border-t border-dashed border-gray-50"
                      style={{ top: minutesToY(hour * 60 + 30) }}
                    />
                  ))}

                  <OperatoryColumn
                    operatory={op}
                    patients={opPatients}
                    privacyMode={privacyMode}
                    onSelectPatient={onSelectPatient}
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
