import { mockPatients, applySimulatedTime } from "@/data/mockPatients";
import type { Patient } from "@/data/mockPatients";
import {
  getSimulatedNowMinutes,
  READY_FOR_CHAIR_WINDOW_MIN,
} from "@/lib/timeline";

/**
 * Returns the mock patients enriched with simulated-time state (status,
 * readyForChair, generated provider/insurance/conditionAlert). Enrichment is
 * deterministic per patient id, so calling this from multiple routes yields a
 * consistent record for the same patient.
 */
export function getEnrichedPatients(): Patient[] {
  const now = getSimulatedNowMinutes();
  return mockPatients.map((p) =>
    applySimulatedTime(p, now, READY_FOR_CHAIR_WINDOW_MIN)
  );
}

export function getPatientById(id: string | undefined): Patient | undefined {
  if (!id) return undefined;
  return getEnrichedPatients().find((p) => p.id === id);
}
