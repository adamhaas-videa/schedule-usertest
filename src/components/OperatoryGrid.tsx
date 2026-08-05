import { useEffect, useMemo, useState } from "react";
import type { Patient, Provider, ScheduleBlock } from "@/data/mockPatients";
import { minutesToTime, timeToMinutes, mockBlocks } from "@/data/mockPatients";
import OperatoryColumn from "./OperatoryColumn";
import OperatoryHeader from "./OperatoryHeader";
import ColumnModeMenu, { type ColumnMode } from "./ColumnModeMenu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProviderColor } from "@/lib/providerColors";
import {
  TOTAL_HEIGHT,
  HOURS,
  START_MINUTES,
  END_MINUTES,
  minutesToY,
  formatHour,
  getSimulatedNowMinutes,
} from "@/lib/timeline";
import type { ClinicalTab } from "@/App";
import type { CardVersion } from "@/lib/cardVersions";
import { cn } from "@/lib/utils";

interface OperatoryGridProps {
  patients: Patient[];
  privacyMode: boolean;
  operatories: number[];
  onOperatoriesChange: (ops: number[]) => void;
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
  onSelectPatient: (patient: Patient) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  cardVersion: CardVersion;
}

const ALL_OPERATORIES = [1, 2, 3, 4, 5, 6, 7, 8];
const HALF_HOURS = HOURS.slice(0, -1);
const GUTTER = 64;
const TOP_PAD = 24;

// A single timeline column — either an operatory (with its lunch blocks) or a
// provider (aggregating that provider's appointments across operatories).
interface GridColumn {
  key: string;
  operatory?: number;
  provider?: Provider;
  patients: Patient[];
  blocks: ScheduleBlock[];
}

// In-chair pill shown in a provider column header, mirroring OperatoryHeader.
function ProviderColumnHeader({
  provider,
  activePatientName,
  onPatientNameClick,
}: {
  provider: Provider;
  activePatientName?: string;
  onPatientNameClick?: () => void;
}) {
  const color = getProviderColor(provider.id);
  return (
    <div className="w-full h-12 px-3 flex items-center gap-2 text-left">
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
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-semibold text-foreground leading-tight truncate">
          {provider.name}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground leading-tight">
          {provider.role}
        </span>
      </div>
      {activePatientName && (
        <button
          type="button"
          onClick={onPatientNameClick}
          disabled={!onPatientNameClick}
          aria-label={
            onPatientNameClick ? `Scroll to ${activePatientName}` : undefined
          }
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 h-[21px] px-2 py-1 rounded-full bg-card border border-border max-w-[50%] transition-colors",
            onPatientNameClick
              ? "cursor-pointer hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              : "cursor-default"
          )}
        >
          <span className="size-1.5 rounded-full bg-success shrink-0" />
          <span className="text-[11px] font-medium text-foreground truncate">
            {activePatientName}
          </span>
        </button>
      )}
    </div>
  );
}

export default function OperatoryGrid({
  patients,
  privacyMode,
  operatories: selectedOps,
  onOperatoriesChange,
  onOpenClinical,
  onSelectPatient,
  scrollRef,
  cardVersion,
}: OperatoryGridProps) {
  const [nowMinutes, setNowMinutes] = useState(getSimulatedNowMinutes);
  const [columnMode, setColumnMode] = useState<ColumnMode>("operatory");

  // Scroll the timeline so the given patient's card is centered. Used by the
  // column header shortcut (click the in-chair patient name).
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
  const focused = columnMode === "operatory" && selectedOps.length > 0;
  const operatories = focused
    ? [...selectedOps].sort((a, b) => a - b)
    : ALL_OPERATORIES;

  const columns: GridColumn[] = useMemo(() => {
    if (columnMode === "provider") {
      const byProvider = new Map<
        string,
        { provider: Provider; patients: Patient[] }
      >();
      for (const p of patients) {
        if (!p.provider) continue;
        const entry = byProvider.get(p.provider.id) ?? {
          provider: p.provider,
          patients: [],
        };
        entry.patients.push(p);
        byProvider.set(p.provider.id, entry);
      }
      return [...byProvider.values()]
        .sort((a, b) => a.provider.name.localeCompare(b.provider.name))
        .map((e) => ({
          key: `prov-${e.provider.id}`,
          provider: e.provider,
          patients: e.patients,
          blocks: [],
        }));
    }
    return operatories.map((op) => ({
      key: `op-${op}`,
      operatory: op,
      patients: patients.filter((p) => p.operatory === op),
      blocks: mockBlocks.filter((b) => b.operatory === op),
    }));
  }, [columnMode, patients, operatories]);

  // Don't let a small set of columns stretch across the whole container (cards
  // get too wide). This applies in the focused operatory view AND the provider
  // view: pin each column to (container - gutter) / max(2, N) based on the
  // actual rendered columns, so 1 column → ~half the width, 2 → half each, 3+
  // scale down further. The non-focused operatory view keeps filling via flex.
  const constrainColumns = focused || columnMode === "provider";
  const columnWidthDivisor = Math.max(2, columns.length);
  const columnStyle: React.CSSProperties | undefined = constrainColumns
    ? {
        flex: "0 0 auto",
        width: `calc((100% - ${GUTTER}px) / ${columnWidthDivisor})`,
      }
    : undefined;
  const columnGrowClass = constrainColumns ? "min-w-0" : "flex-1 min-w-0";

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
      {/* Focused-op banner (operatory mode only) */}
      {focused && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-info-muted border-b border-info-muted-border">
          <button
            onClick={() => onOperatoriesChange([])}
            className="flex items-center gap-1.5 text-[12px] font-medium text-info-emphasis hover:text-primary transition-colors"
          >
            <i className="fa-regular fa-chevron-left text-[10px]" aria-hidden />
            Back to all operatories
          </button>
          <span className="text-[12px] text-info-muted-foreground">
            Showing{" "}
            <span className="font-semibold">Op {operatories.join(", ")}</span>
          </span>
        </div>
      )}

      {/* Fixed header row — outside scroll, never moves */}
      <div className="shrink-0 flex border-b border-border bg-card">
        <div
          className="shrink-0 flex items-center justify-center"
          style={{ width: GUTTER }}
        >
          <ColumnModeMenu value={columnMode} onChange={setColumnMode} />
        </div>
        {columns.map((col, i) => {
          const inChairPatient = col.patients.find(
            (p) => p.status === "in-chair"
          );
          return (
            <div
              key={col.key}
              className={cn(
                columnGrowClass,
                i > 0 ? "border-l border-border" : ""
              )}
              style={columnStyle}
            >
              {col.operatory !== undefined ? (
                <OperatoryHeader
                  operatory={col.operatory}
                  occupied={!!inChairPatient}
                  activePatientName={inChairPatient?.name}
                  onClick={
                    focused
                      ? undefined
                      : () => onOperatoriesChange([col.operatory!])
                  }
                  onPatientNameClick={
                    inChairPatient
                      ? () => scrollToPatient(inChairPatient)
                      : undefined
                  }
                />
              ) : (
                <ProviderColumnHeader
                  provider={col.provider!}
                  activePatientName={inChairPatient?.name}
                  onPatientNameClick={
                    inChairPatient
                      ? () => scrollToPatient(inChairPatient)
                      : undefined
                  }
                />
              )}
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

          {/* Columns — bg flush to header, content offset by TOP_PAD */}
          {columns.map((col, i) => (
            <div
              key={col.key}
              className={cn(
                columnGrowClass,
                "bg-card",
                i > 0 ? "border-l border-border" : ""
              )}
              style={columnStyle}
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
                  patients={col.patients}
                  blocks={col.blocks}
                  privacyMode={privacyMode}
                  onOpenClinical={onOpenClinical}
                  onSelectPatient={onSelectPatient}
                  cardVersion={cardVersion}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
