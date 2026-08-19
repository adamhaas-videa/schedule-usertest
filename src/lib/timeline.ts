export const START_HOUR = 7;
export const END_HOUR = 19;
// Prototype's minimum card size: no appointment is shorter than 30 minutes, so
// any card renders at least a 30-min slot's height. Only clamps VISUAL height —
// schedule geometry (top position, open-slot/occupied math) uses real durations.
export const MIN_CARD_MINUTES = 30;
// 180px/hour → 90px per 30-min slot → 88px card height after CARD_GAP (=2),
// which fits the FullCard content floor (p-2.5 padding + gap-2 + ~34px top
// row + 22px provider chip ≈ 84–86px) with a ~2px buffer. Lowering this
// re-introduces clipping of the provider chip on 30-min appointments.
export const PIXELS_PER_HOUR = 180;
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

/** Minutes since local midnight, used for the calendar now-line and appointment status. */
export function getNowMinutes(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function getCurrentHour(): number {
  return Math.floor(getNowMinutes() / 60);
}
