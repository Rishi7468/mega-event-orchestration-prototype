/**
 * Minute-arithmetic helpers for journey times.
 *
 * Everything in the prototype is derived from fixed clock strings — never
 * `Date.now()`. That keeps the demo repeatable (docs/12_SIMULATION_ENGINE.md
 * "Do not use uncontrolled randomness") and avoids server/client hydration
 * mismatches on times rendered during SSR.
 */

const MINUTES_PER_DAY = 24 * 60;

/** "09:05 AM" -> 545 (minutes since midnight). */
export function parseTime(value: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value.trim());
  if (!match) return 0;

  const [, rawHour, rawMinute, meridiem] = match;
  const minute = Number(rawMinute);
  let hour = Number(rawHour) % 12;
  if (meridiem.toUpperCase() === "PM") hour += 12;

  return hour * 60 + minute;
}

/** 545 -> "9:05 AM". */
export function formatTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const meridiem = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

export function addMinutes(time: string, delta: number): string {
  return formatTime(parseTime(time) + delta);
}

/** "1 h 12 min" style label for durations shown as a headline value. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}
