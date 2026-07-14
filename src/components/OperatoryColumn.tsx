import type { Patient, ScheduleBlock } from "@/data/mockPatients";
import { timeToMinutes, minutesToTime, mockBlocks } from "@/data/mockPatients";
import PatientCard from "./PatientCard";
import type { ClinicalTab } from "@/App";
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
  onOpenClinical: (patient: Patient, tab: ClinicalTab) => void;
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

interface Occupied {
  startMin: number;
  endMin: number;
}

// Open slots are gaps not covered by an appointment OR a schedule block (lunch).
function getOpenSlots(occupied: Occupied[]): OpenSlot[] {
  const sorted = [...occupied].sort((a, b) => a.startMin - b.startMin);

  const slots: OpenSlot[] = [];
  let cursor = DAY_START;

  for (const o of sorted) {
    if (o.startMin > cursor && o.startMin - cursor >= MIN_OPEN_SLOT) {
      slots.push({ startMin: cursor, durationMin: o.startMin - cursor });
    }
    cursor = Math.max(cursor, o.endMin);
  }

  if (DAY_END > cursor && DAY_END - cursor >= MIN_OPEN_SLOT) {
    slots.push({ startMin: cursor, durationMin: DAY_END - cursor });
  }

  return slots;
}

export default function OperatoryColumn({
  operatory,
  patients,
  privacyMode,
  onOpenClinical,
  onSelectPatient,
}: OperatoryColumnProps) {
  const sorted = [...patients].sort(
    (a, b) => timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime)
  );

  const blocks: ScheduleBlock[] = mockBlocks.filter(
    (b) => b.operatory === operatory
  );

  const occupied: Occupied[] = [
    ...patients.map((p) => {
      const start = timeToMinutes(p.appointmentTime);
      return { startMin: start, endMin: start + p.durationMinutes };
    }),
    ...blocks.map((b) => {
      const start = timeToMinutes(b.startTime);
      return { startMin: start, endMin: start + b.durationMinutes };
    }),
  ];

  const openSlots = getOpenSlots(occupied);

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

      {/* Lunch / schedule blocks — hatched, distinct from open slots */}
      {blocks.map((block) => {
        const startMin = timeToMinutes(block.startTime);
        const top = minutesToY(startMin);
        const height = durationToHeight(block.durationMinutes) - CARD_GAP;
        return (
          <div
            key={block.id}
            className="absolute left-2 right-2"
            style={{ top: top + 1, height }}
          >
            <div
              className="h-full flex items-center justify-center rounded-[10px] border border-border text-[12px] font-medium text-muted-foreground"
              style={{
                backgroundColor: "var(--muted)",
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 6px, color-mix(in srgb, var(--muted-foreground) 14%, transparent) 6px, color-mix(in srgb, var(--muted-foreground) 14%, transparent) 12px)",
              }}
            >
              <span className="px-2 py-0.5 rounded bg-card/80 text-foreground/80">
                {block.label}
              </span>
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
            id={`appt-${patient.id}`}
            data-patient-id={patient.id}
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
              onOpenClinical={onOpenClinical}
              onSelectPatient={onSelectPatient}
            />
          </div>
        );
      })}
    </div>
  );
}
