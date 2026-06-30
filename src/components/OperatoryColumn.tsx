import type { Patient } from "@/data/mockPatients";
import { timeToMinutes, minutesToTime } from "@/data/mockPatients";
import PatientCard from "./PatientCard";
import {
  minutesToY,
  durationToHeight,
  START_HOUR,
  END_HOUR,
} from "@/lib/timeline";

interface OperatoryColumnProps {
  operatory: number;
  patients: Patient[];
  privacyMode: boolean;
  onSelectPatient: (patient: Patient) => void;
}

const CARD_GAP = 2;
const DAY_START = START_HOUR * 60;
const DAY_END = END_HOUR * 60;
const MIN_OPEN_SLOT = 15;

interface OpenSlot {
  startMin: number;
  durationMin: number;
}

function getOpenSlots(patients: Patient[]): OpenSlot[] {
  const sorted = [...patients].sort(
    (a, b) => timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime)
  );

  const slots: OpenSlot[] = [];
  let cursor = DAY_START;

  for (const p of sorted) {
    const start = timeToMinutes(p.appointmentTime);
    if (start > cursor && start - cursor >= MIN_OPEN_SLOT) {
      slots.push({ startMin: cursor, durationMin: start - cursor });
    }
    cursor = Math.max(cursor, start + p.durationMinutes);
  }

  if (DAY_END > cursor && DAY_END - cursor >= MIN_OPEN_SLOT) {
    slots.push({ startMin: cursor, durationMin: DAY_END - cursor });
  }

  return slots;
}

export default function OperatoryColumn({
  patients,
  privacyMode,
  onSelectPatient,
}: OperatoryColumnProps) {
  const sorted = [...patients].sort(
    (a, b) => timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime)
  );

  const openSlots = getOpenSlots(patients);

  return (
    <div className="relative h-full">
      {/* Open slots */}
      {openSlots.map((slot) => {
        const top = minutesToY(slot.startMin);
        const height = durationToHeight(slot.durationMin) - CARD_GAP;
        return (
          <div
            key={`open-${slot.startMin}`}
            className="absolute left-2 right-2"
            style={{ top: top + 1, height }}
          >
            <div className="h-full flex items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-border bg-muted/30 text-[12px] font-medium text-muted-foreground">
              {minutesToTime(slot.startMin)} &mdash; Open
            </div>
          </div>
        );
      })}

      {/* Patient cards */}
      {sorted.map((patient) => {
        const startMin = timeToMinutes(patient.appointmentTime);
        const top = minutesToY(startMin);
        const height = durationToHeight(patient.durationMinutes) - CARD_GAP;

        return (
          <div
            key={patient.id}
            className="absolute left-2 right-2"
            style={{
              top: top + 1,
              height,
              contentVisibility: "auto",
              containIntrinsicSize: `auto ${Math.max(0, height)}px`,
            }}
          >
            <PatientCard
              patient={patient}
              variant="calendar"
              privacyMode={privacyMode}
              onClick={onSelectPatient}
            />
          </div>
        );
      })}
    </div>
  );
}
