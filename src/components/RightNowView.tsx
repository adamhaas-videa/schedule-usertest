import type { Patient } from "@/data/mockPatients";
import { timeToMinutes, minutesToTime } from "@/data/mockPatients";
import PatientCard from "./PatientCard";
import OperatoryHeader from "./OperatoryHeader";
import { cn } from "@/lib/utils";

interface RightNowViewProps {
  patients: Patient[];
  windowHour: number;
  onWindowHourChange: (hour: number) => void;
  privacyMode: boolean;
  onSelectPatient: (patient: Patient) => void;
}

const OPERATORIES = [1, 2, 3, 4];
const WINDOW_HOURS = 1;
const MIN_HOUR = 7;
const MAX_HOUR = 19;
const PEEK_HEIGHT = 56;
const VIEWPORT_MASK =
  "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)";

type TimeSlot =
  | { type: "patient"; patient: Patient }
  | { type: "open"; startTime: number };

function getVisibleSlots(
  patients: Patient[],
  windowStart: number,
  windowEnd: number
): TimeSlot[] {
  const sorted = [...patients]
    .sort(
      (a, b) =>
        timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime)
    )
    .filter((p) => {
      const start = timeToMinutes(p.appointmentTime);
      const end = start + p.durationMinutes;
      return start < windowEnd && end > windowStart;
    });

  const slots: TimeSlot[] = [];
  let cursor = windowStart;

  for (const patient of sorted) {
    const apptStart = timeToMinutes(patient.appointmentTime);
    const apptEnd = apptStart + patient.durationMinutes;
    const visibleStart = Math.max(apptStart, windowStart);

    if (visibleStart > cursor) {
      slots.push({ type: "open", startTime: cursor });
    }

    slots.push({ type: "patient", patient });
    cursor = Math.max(cursor, apptEnd);
  }

  if (cursor < windowEnd) {
    slots.push({ type: "open", startTime: cursor });
  }

  return slots;
}

function getPeekPatients(
  patients: Patient[],
  windowStart: number,
  windowEnd: number,
  direction: "before" | "after"
): Patient[] {
  const peekStart = direction === "before" ? windowStart - 60 : windowEnd;
  const peekEnd = direction === "before" ? windowStart : windowEnd + 60;

  return patients
    .filter((p) => {
      const start = timeToMinutes(p.appointmentTime);
      const end = start + p.durationMinutes;
      const overlapsMain = start < windowEnd && end > windowStart;
      const overlapsPeek = start < peekEnd && end > peekStart;
      return overlapsPeek && !overlapsMain;
    })
    .sort((a, b) => {
      const aStart = timeToMinutes(a.appointmentTime);
      const bStart = timeToMinutes(b.appointmentTime);
      return direction === "before" ? bStart - aStart : aStart - bStart;
    });
}

function PeekZone({
  patients,
  direction,
  privacyMode,
}: {
  patients: Patient[];
  direction: "top" | "bottom";
  privacyMode: boolean;
}) {
  const isTop = direction === "top";
  const maskGradient = isTop
    ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%)"
    : "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)";

  return (
    <div
      className="shrink-0 overflow-hidden pointer-events-none relative"
      style={{ height: PEEK_HEIGHT }}
    >
      {patients.length > 0 && (
        <div
          className={cn(
            "px-2 blur-[3px]",
            isTop && "absolute inset-x-0 bottom-0"
          )}
          style={{
            maskImage: maskGradient,
            WebkitMaskImage: maskGradient,
          }}
        >
          {patients.slice(0, 1).map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              variant="full"
              privacyMode={privacyMode}
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function formatWindowHour(hour: number): string {
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const meridiem = hour >= 12 ? "PM" : "AM";
  return `${h}:00 ${meridiem}`;
}

export default function RightNowView({
  patients,
  windowHour,
  onWindowHourChange,
  privacyMode,
  onSelectPatient,
}: RightNowViewProps) {
  const windowStart = windowHour * 60;
  const windowEnd = (windowHour + WINDOW_HOURS) * 60;

  const visiblePatientCount = patients.filter((p) => {
    const start = timeToMinutes(p.appointmentTime);
    const end = start + p.durationMinutes;
    return start < windowEnd && end > windowStart;
  }).length;

  const canGoUp = windowHour > MIN_HOUR;
  const canGoDown = windowHour + WINDOW_HOURS < MAX_HOUR;

  return (
    <div className="h-full flex flex-col px-5 pt-4 pb-5 gap-3">
      {/* Info bar */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-sm text-muted-foreground">
          Right Now &middot; {visiblePatientCount} patients across{" "}
          {OPERATORIES.length} operatories
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => canGoUp && onWindowHourChange(windowHour - 1)}
            disabled={!canGoUp}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md border border-zinc-200 transition-colors",
              canGoUp
                ? "hover:bg-gray-50 text-foreground"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            <i className="fa-regular fa-chevron-up text-xs" />
          </button>
          <span className="text-sm font-medium tabular-nums min-w-[150px] text-center">
            {formatWindowHour(windowHour)} &ndash;{" "}
            {formatWindowHour(windowHour + WINDOW_HOURS)}
          </span>
          <button
            onClick={() => canGoDown && onWindowHourChange(windowHour + 1)}
            disabled={!canGoDown}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md border border-zinc-200 transition-colors",
              canGoDown
                ? "hover:bg-gray-50 text-foreground"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            <i className="fa-regular fa-chevron-down text-xs" />
          </button>
        </div>
      </div>

      {/* Operatory columns — slot-machine viewport */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {OPERATORIES.map((op) => {
          const opPatients = patients.filter((p) => p.operatory === op);
          const slots = getVisibleSlots(opPatients, windowStart, windowEnd);
          const hasPatientInWindow = slots.some((s) => s.type === "patient");
          const peekBefore = getPeekPatients(
            opPatients,
            windowStart,
            windowEnd,
            "before"
          );
          const peekAfter = getPeekPatients(
            opPatients,
            windowStart,
            windowEnd,
            "after"
          );

          return (
            <div
              key={op}
              className="flex flex-col rounded-xl overflow-hidden border border-slate-200 bg-slate-100/60 max-h-[calc(100vh-200px)]"
            >
              <OperatoryHeader operatory={op} occupied={hasPatientInWindow} />

              <div className="flex flex-col min-h-0">
                <PeekZone
                  patients={peekBefore}
                  direction="top"
                  privacyMode={privacyMode}
                />

                {/* Clear viewport window */}
                <div
                  className="bg-white px-3 py-4 space-y-3 overflow-y-auto flex-1 min-h-0"
                  style={{
                    maskImage: VIEWPORT_MASK,
                    WebkitMaskImage: VIEWPORT_MASK,
                  }}
                >
                  {slots.map((slot) => {
                    if (slot.type === "open") {
                      return (
                        <div
                          key={`open-${slot.startTime}`}
                          className="px-3 py-2.5 rounded-lg border border-dashed border-slate-200 text-xs text-muted-foreground"
                        >
                          {minutesToTime(slot.startTime)} &mdash; Open
                        </div>
                      );
                    }
                    return (
                      <PatientCard
                        key={slot.patient.id}
                        patient={slot.patient}
                        variant="full"
                        privacyMode={privacyMode}
                        onClick={onSelectPatient}
                      />
                    );
                  })}

                  {slots.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <span className="text-sm text-muted-foreground">
                        No appointments
                      </span>
                    </div>
                  )}
                </div>

                <PeekZone
                  patients={peekAfter}
                  direction="bottom"
                  privacyMode={privacyMode}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
