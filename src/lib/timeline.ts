export const START_HOUR = 7;
export const END_HOUR = 19;
// Prototype's minimum card size: no appointment is shorter than 30 minutes, so
// any card renders at least a 30-min slot's height. Only clamps VISUAL height —
// schedule geometry (top position, open-slot/occupied math) uses real durations.
export const MIN_CARD_MINUTES = 30;
// 230px/hour → 115px per 30-min slot → 113px card after CARD_GAP (=2). A 60-min
// appointment lands at 228px, which is the Summary actions (V1) full-suite
// card in Figma (treatment header + insurance + two-line summary + footer).
// The previous 180px/hour scale clipped that layout. Legacy V2–V5 cards just
// get more breathing room.
export const PIXELS_PER_HOUR = 230;
export const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * PIXELS_PER_HOUR;
export const START_MINUTES = START_HOUR * 60;
export const END_MINUTES = END_HOUR * 60;

export const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i
);

export function minutesToY(minutes: number): number {
  return ((minutes - START_MINUTES) / 60) * PIXELS_PER_HOUR;
}

export function durationToHeight(durationMinutes: number): number {
  return (durationMinutes / 60) * PIXELS_PER_HOUR;
}

export function formatHour(hour: number): string {
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const meridiem = hour >= 12 ? "PM" : "AM";
  return `${h} ${meridiem}`;
}

export const READY_FOR_CHAIR_WINDOW_MIN = 15;

/**
 * User-test build: the clock is pinned instead of tracking wall time, so every
 * participant opens an identical board no matter when they run the session.
 * This single constant drives the now-line, the grid's initial scroll, and the
 * in-chair / completed / ready-for-chair statuses derived in `mockPatients.ts`.
 *
 * At 8:00 AM the day has not started moving yet: six patients are in the chair,
 * nothing is completed, and nothing is inside the ready-for-chair window. Nudge
 * it later (8:30 gives 5 in-chair and 3 completed; 10:45 gives 7 and 14) if a
 * test needs a board with history on it.
 */
export const FIXED_NOW_MINUTES = 8 * 60;

/** Minutes since local midnight, used for the calendar now-line and appointment status. */
export function getNowMinutes(): number {
  return FIXED_NOW_MINUTES;
}

export function getCurrentHour(): number {
  return Math.floor(FIXED_NOW_MINUTES / 60);
}
