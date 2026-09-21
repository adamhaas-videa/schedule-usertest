import { FIXED_NOW_MINUTES } from "@/lib/timeline";

/**
 * Clock in minutes since midnight. User-test build: pinned to
 * `FIXED_NOW_MINUTES` rather than ticking, so the schedule never shifts under a
 * participant mid-session. Kept as a hook so call sites are unchanged from the
 * internal build and the two can be diffed cleanly.
 */
export function useNowMinutes(): number {
  return FIXED_NOW_MINUTES;
}
