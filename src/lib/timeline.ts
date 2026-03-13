export const START_HOUR = 7;
export const END_HOUR = 19;
export const PIXELS_PER_HOUR = 400;
export const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * PIXELS_PER_HOUR;
export const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
export const START_MINUTES = START_HOUR * 60;
export const END_MINUTES = END_HOUR * 60;

export const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i
);

export function minutesToY(minutes: number): number {
  return ((minutes - START_MINUTES) / 60) * PIXELS_PER_HOUR;
}

export function yToMinutes(y: number): number {
  return START_MINUTES + (y / PIXELS_PER_HOUR) * 60;
}

export function durationToHeight(durationMinutes: number): number {
  return (durationMinutes / 60) * PIXELS_PER_HOUR;
}

export function formatHour(hour: number): string {
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const meridiem = hour >= 12 ? "pm" : "am";
  return `${h.toString().padStart(2, "0")}:00${meridiem}`;
}

export function formatTimeLabel(mins: number): string {
  const rounded = Math.round(mins);
  const h24 = Math.floor(rounded / 60);
  const m = rounded % 60;
  const h = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
  const meridiem = h24 >= 12 ? "pm" : "am";
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}${meridiem}`;
}

export function clampTime(minutes: number): number {
  return Math.max(START_MINUTES, Math.min(END_MINUTES, minutes));
}

export function snapToIncrement(minutes: number, increment = 5): number {
  return Math.round(minutes / increment) * increment;
}

export function cardOpacity(cardMidpointMinutes: number, scrubberTime: number): number {
  const distance = Math.abs(cardMidpointMinutes - scrubberTime);
  return Math.max(0.25, 1 - distance / 180);
}
