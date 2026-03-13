export const START_HOUR = 7;
export const END_HOUR = 19;
export const PIXELS_PER_HOUR = 250;
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

export function getNowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getCurrentHour(): number {
  return 9;
}
