import { savedDayGoal } from './meals';
export function iso(d) {
  return new Date(d).toLocaleDateString('en-CA');
}
export const today = iso(new Date());
export function chartDays(end, count) {
  const days = [];
  const finish = new Date(end + 'T12:00:00');
  for (let i = count - 1; i >= 0; i--) {
    let d = new Date(finish);
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-CA'));
  }
  return days;
}
export function buildProgressDays(entries, activities, end, count, activityType = 'all') {
  return chartDays(end, count).map((date) => {
    let foods = entries[date] || [],
      workouts = (activities[date] || []).filter(
        (x) => activityType === 'all' || x.type === activityType,
      );
    return {
      date,
      intake: foods.reduce((s, x) => s + x.cal * x.qty, 0),
      hasFood: foods.length > 0,
      goal: savedDayGoal(foods),
      minutes: workouts.reduce((s, x) => s + x.minutes, 0),
      burned: workouts.reduce((s, x) => s + x.cal, 0),
      sessions: workouts.length,
    };
  });
}
