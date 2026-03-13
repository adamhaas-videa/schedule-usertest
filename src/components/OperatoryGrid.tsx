import { useRef, useEffect, useState, useCallback } from "react";
import type { Patient } from "@/data/mockPatients";
import OperatoryColumn from "./OperatoryColumn";
import OperatoryHeader from "./OperatoryHeader";
import {
  TOTAL_HEIGHT,
  HOURS,
  minutesToY,
  yToMinutes,
  clampTime,
  formatHour,
} from "@/lib/timeline";

interface OperatoryGridProps {
  patients: Patient[];
  viewMode: "rightnow" | "fullday";
  snapshotTime: number;
  privacyMode: boolean;
  onSelectPatient: (patient: Patient) => void;
  onScrollTimeChange?: (time: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const OPERATORIES = [1, 2, 3, 4];

export default function OperatoryGrid({
  patients,
  viewMode,
  snapshotTime,
  privacyMode,
  onSelectPatient,
  onScrollTimeChange,
  scrollRef,
}: OperatoryGridProps) {
  const [containerHeight, setContainerHeight] = useState(600);
  const isProgrammaticScroll = useRef(false);

  const measureContainer = useCallback(() => {
    if (scrollRef.current) {
      setContainerHeight(scrollRef.current.clientHeight);
    }
  }, [scrollRef]);

  useEffect(() => {
    measureContainer();
    const observer = new ResizeObserver(measureContainer);
    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, [measureContainer, scrollRef]);

  const scrubberY = minutesToY(snapshotTime);

  useEffect(() => {
    if (!scrollRef.current) return;
    const target = Math.max(0, scrubberY - containerHeight / 2);
    const current = scrollRef.current.scrollTop;
    if (Math.abs(current - target) < 2) return;
    isProgrammaticScroll.current = true;
    scrollRef.current.scrollTo({ top: target, behavior: "instant" });
    requestAnimationFrame(() => {
      isProgrammaticScroll.current = false;
    });
  }, [scrubberY, containerHeight, scrollRef]);

  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current || !scrollRef.current) return;
    const centerY = scrollRef.current.scrollTop + containerHeight / 2;
    const time = clampTime(Math.round(yToMinutes(centerY)));
    onScrollTimeChange?.(time);
  }, [containerHeight, onScrollTimeChange, scrollRef]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="flex gap-3 pr-3" style={{ height: TOTAL_HEIGHT }}>
        {/* Time labels gutter */}
        <div className="w-[88px] shrink-0 relative">
          {HOURS.map((hour) => (
            <span
              key={hour}
              className="absolute left-0 right-0 text-xs font-medium text-muted-foreground text-center leading-none whitespace-nowrap -translate-y-1/2"
              style={{ top: minutesToY(hour * 60) }}
            >
              {formatHour(hour)}
            </span>
          ))}
        </div>

        {/* Operatory columns as cards */}
        {OPERATORIES.map((op) => {
          const opPatients = patients.filter((p) => p.operatory === op);
          const inChairPatient = opPatients.find((p) => p.status === "in-chair");

          return (
            <div
              key={op}
              className="flex-1 min-w-0 border border-slate-200 rounded-t-xl bg-[#E8F0F4] relative"
            >
              <div className="sticky top-0 z-20">
                <OperatoryHeader
                  operatory={op}
                  occupied={!!inChairPatient}
                  activePatientName={inChairPatient?.name}
                  className="rounded-t-[11px]"
                />
              </div>

              <div className="absolute inset-0 bg-white rounded-t-xl">
                <OperatoryColumn
                  operatory={op}
                  patients={opPatients}
                  viewMode={viewMode}
                  snapshotTime={snapshotTime}
                  privacyMode={privacyMode}
                  onSelectPatient={onSelectPatient}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
