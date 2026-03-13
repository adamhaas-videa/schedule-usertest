import type { Patient } from "@/data/mockPatients";
import { timeToMinutes } from "@/data/mockPatients";
import PatientCard from "./PatientCard";
import {
  minutesToY,
  cardOpacity,
} from "@/lib/timeline";

interface OperatoryColumnProps {
  operatory: number;
  patients: Patient[];
  viewMode: "rightnow" | "fullday";
  snapshotTime: number;
  privacyMode: boolean;
  onSelectPatient: (patient: Patient) => void;
}

export default function OperatoryColumn({
  patients,
  viewMode,
  snapshotTime,
  privacyMode,
  onSelectPatient,
}: OperatoryColumnProps) {
  const sorted = [...patients].sort(
    (a, b) => timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime)
  );

  return (
    <div className="relative h-full">
      {sorted.map((patient) => {
        const startMin = timeToMinutes(patient.appointmentTime);
        const midpoint = startMin + patient.durationMinutes / 2;
        const top = minutesToY(startMin);
        const opacity = viewMode === "fullday" ? cardOpacity(midpoint, snapshotTime) : 1;

        return (
          <div
            key={patient.id}
            className="absolute left-2 right-2 transition-opacity duration-200"
            style={{ top, opacity }}
          >
            <PatientCard
              patient={patient}
              variant="full"
              privacyMode={privacyMode}
              onClick={onSelectPatient}
            />
          </div>
        );
      })}

      {sorted.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
      )}
    </div>
  );
}
