import type { Diary } from './models';

/** Calendar arithmetic uses local noon so daylight-saving changes cannot skip a day. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function shiftDay(day: string, offset: number): string {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}
export function hasFoodLog(entries: Diary, day: string): boolean {
  return (entries[day] ?? []).some((food) => (food.qty ?? 1) > 0);
}
/** A logging streak is anchored to today or, before today's first log, yesterday. */
export function getLoggingStreak(entries: Diary, referenceDay: string): number {
  let cursor = hasFoodLog(entries, referenceDay) ? referenceDay : shiftDay(referenceDay, -1);
  let count = 0;
  while (hasFoodLog(entries, cursor)) {
    count += 1;
    cursor = shiftDay(cursor, -1);
  }
  return count;
}
export function monthCells(month: string): Array<string | null> {
  const first = new Date(`${month}-01T12:00:00`);
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0, 12).getDate();
  const padding = (first.getDay() + 6) % 7;
  const cells: Array<string | null> = Array(padding).fill(null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(dateKey(new Date(first.getFullYear(), first.getMonth(), day, 12)));
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}
export function shiftMonth(month: string, offset: number): string {
  const date = new Date(`${month}-01T12:00:00`);
  date.setMonth(date.getMonth() + offset);
  return dateKey(date).slice(0, 7);
}
