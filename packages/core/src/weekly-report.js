import { buildProgressDays, iso } from './progress';

// Completed calendar week, Monday through Sunday, in the device's local time.
export function buildWeeklyReport(entries, activities, weights, now = new Date()) {
  const end = new Date(now);
  end.setHours(12, 0, 0, 0);
  end.setDate(end.getDate() - ((end.getDay() + 6) % 7) - 1);
  const days = buildProgressDays(entries, activities, iso(end), 7);
  const logged = days.filter((day) => day.hasFood);
  const compared = logged.filter((day) => day.goal > 0);
  const checkIns = weights
    .filter((item) => item.date >= days[0].date && item.date <= days[6].date)
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    days,
    ready: logged.length > 0 || days.some((day) => day.sessions > 0) || checkIns.length > 0,
    loggedDays: logged.length,
    average: logged.length
      ? logged.reduce((sum, day) => sum + day.intake, 0) / logged.length
      : null,
    comparedDays: compared.length,
    averageDifference: compared.length
      ? compared.reduce((sum, day) => sum + day.intake - day.goal, 0) / compared.length
      : null,
    minutes: days.reduce((sum, day) => sum + day.minutes, 0),
    burned: days.reduce((sum, day) => sum + day.burned, 0),
    sessions: days.reduce((sum, day) => sum + day.sessions, 0),
    checkIns,
  };
}

export function balanceStatus(consumed, goal, day, now = new Date()) {
  if (!goal) return 'neutral';
  if (consumed > goal) return 'over';
  if (consumed === goal) return 'reached';
  if (day === iso(now) && now.getHours() >= 20 && consumed < goal * 0.8) return 'low';
  return 'neutral';
}
