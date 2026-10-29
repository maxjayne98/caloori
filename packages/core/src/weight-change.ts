import type { Activity, Profile } from './models';

const KCAL_PER_KG = 7700;
const KCAL_PER_DAY = 1440;
const DAY_MS = 24 * 60 * 60 * 1000;

const DAILY_ACTIVITY_FACTOR: Record<NonNullable<Profile['activity']>, number> = {
  'Not very active': 1.2,
  'Lightly active': 1.25,
  Active: 1.32,
  'Very active': 1.37,
};

function dayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

function dateFromDayNumber(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function caloriesForDay(items: Array<{ cal: number; qty?: number }>): number {
  return items.reduce((total, item) => total + item.cal * (item.qty ?? 1), 0);
}

export function estimateBmr(profile: Profile, weight = profile.weight): number | null {
  if (!weight || !profile.height || !profile.age) return null;
  const sexOffset = profile.sex === 'male' ? 5 : -161;
  return 10 * weight + 6.25 * profile.height - 5 * profile.age + sexOffset;
}

export function estimateNetActivityCalories(
  activities: readonly Activity[],
  profile: Profile,
  fallbackBmr?: number,
): number {
  return activities.reduce((total, activity) => {
    const bmr = estimateBmr(profile, activity.weight) ?? fallbackBmr ?? 0;
    return total + Math.max(0, activity.cal - (bmr / KCAL_PER_DAY) * activity.minutes);
  }, 0);
}

export interface WeightChangeEstimate {
  changeKg: number;
  bmr: number;
  baselineKcal: number;
  activityKcal: number;
  thermicKcal: number;
  adaptive: boolean;
}

export function estimateDailyWeightChange({
  profile,
  intake,
  weight = profile.weight,
  activities = [],
  adaptiveBaselineKcal,
}: {
  profile: Profile;
  intake: number;
  weight?: number | null;
  activities?: readonly Activity[];
  adaptiveBaselineKcal?: number | null;
}): WeightChangeEstimate | null {
  const bmr = estimateBmr(profile, weight);
  const activityFactor = profile.activity ? DAILY_ACTIVITY_FACTOR[profile.activity] : null;
  if (bmr === null || activityFactor === null || !Number.isFinite(intake) || intake < 0)
    return null;

  const adaptive = adaptiveBaselineKcal != null && Number.isFinite(adaptiveBaselineKcal);
  const baselineKcal = adaptive ? adaptiveBaselineKcal : bmr * activityFactor;
  const activityKcal = estimateNetActivityCalories(activities, profile, bmr);
  const thermicKcal = intake * 0.1;
  const expenditure = baselineKcal + activityKcal + thermicKcal;

  return {
    changeKg: (intake - expenditure) / KCAL_PER_KG,
    bmr,
    baselineKcal,
    activityKcal,
    thermicKcal,
    adaptive,
  };
}

export function estimateAdaptiveBaselineKcal({
  entries,
  activities,
  weights,
  profile,
  throughDate,
}: {
  entries: Record<string, Array<{ cal: number; qty?: number }>>;
  activities: Record<string, Activity[]>;
  weights: Array<{ date: string; weight: number }>;
  profile: Profile;
  throughDate: string;
}): number | null {
  const recentWeights = weights
    .filter(
      (point) => point.date <= throughDate && dayNumber(point.date) >= dayNumber(throughDate) - 35,
    )
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  if (recentWeights.length < 4) return null;

  const firstDay = dayNumber(recentWeights[0].date);
  const lastDay = dayNumber(recentWeights.at(-1)!.date);
  if (lastDay - firstDay < 14 || dayNumber(throughDate) - lastDay > 7) return null;

  const firstWindow = recentWeights.filter((point) => dayNumber(point.date) <= firstDay + 6);
  const lastWindow = recentWeights.filter((point) => dayNumber(point.date) >= lastDay - 6);
  if (firstWindow.length < 2 || lastWindow.length < 2) return null;

  const firstMeanDay = average(firstWindow.map((point) => dayNumber(point.date)));
  const lastMeanDay = average(lastWindow.map((point) => dayNumber(point.date)));
  const observedSpan = lastMeanDay - firstMeanDay;
  if (observedSpan < 7) return null;

  const firstDate = dateFromDayNumber(Math.ceil(firstMeanDay));
  const lastDate = dateFromDayNumber(Math.floor(lastMeanDay));
  const periodDays = Math.floor(lastMeanDay) - Math.ceil(firstMeanDay) + 1;
  if (periodDays <= 0) return null;

  const loggedDays = Object.entries(entries)
    .filter(([date, items]) => date >= firstDate && date <= lastDate && items.length > 0)
    .map(([date, items]) => ({ date, intake: caloriesForDay(items) }));
  if (loggedDays.length < 10 || loggedDays.length < Math.ceil(periodDays * 0.7)) return null;

  const averageIntake = average(loggedDays.map((day) => day.intake));
  const averageActivity =
    Array.from({ length: periodDays }, (_, index) => {
      const date = dateFromDayNumber(Math.ceil(firstMeanDay) + index);
      return estimateNetActivityCalories(activities[date] ?? [], profile);
    }).reduce((total, calories) => total + calories, 0) / periodDays;

  const weightChangePerDay =
    (average(lastWindow.map((point) => point.weight)) -
      average(firstWindow.map((point) => point.weight))) /
    observedSpan;
  const observedTotalExpenditure = averageIntake - weightChangePerDay * KCAL_PER_KG;
  const baselineKcal = observedTotalExpenditure - averageActivity - averageIntake * 0.1;
  const referenceBmr = estimateBmr(
    profile,
    average([...firstWindow, ...lastWindow].map((x) => x.weight)),
  );
  if (
    referenceBmr === null ||
    !Number.isFinite(baselineKcal) ||
    baselineKcal < referenceBmr * 0.9 ||
    baselineKcal > referenceBmr * 2
  )
    return null;

  return baselineKcal;
}

export function estimateRecentWeightTrend({
  entries,
  activities,
  weights,
  profile,
  throughDate,
  days = 28,
}: {
  entries: Record<string, Array<{ cal: number; qty?: number }>>;
  activities: Record<string, Activity[]>;
  weights: Array<{ date: string; weight: number }>;
  profile: Profile;
  throughDate: string;
  days?: number;
}): {
  weeklyKg: number;
  fourWeekKg: number;
  estimatedSoFarKg: number;
  loggedDays: number;
  adaptive: boolean;
} | null {
  const endDay = dayNumber(throughDate);
  const startDay = endDay - days + 1;
  const adaptiveBaselineKcal = estimateAdaptiveBaselineKcal({
    entries,
    activities,
    weights,
    profile,
    throughDate,
  });
  const chronologicalWeights = weights.slice().sort((a, b) => a.date.localeCompare(b.date));
  const changes = Object.entries(entries)
    .filter(([date, items]) => {
      const day = dayNumber(date);
      return day >= startDay && day <= endDay && items.length > 0;
    })
    .map(([date, items]) => {
      const weight =
        chronologicalWeights.filter((point) => point.date <= date).at(-1)?.weight ?? profile.weight;
      return estimateDailyWeightChange({
        profile,
        intake: caloriesForDay(items),
        weight,
        activities: activities[date] ?? [],
        adaptiveBaselineKcal,
      })?.changeKg;
    })
    .filter((change): change is number => change !== undefined);
  if (!changes.length) return null;

  const averageDailyChange = average(changes);
  return {
    weeklyKg: averageDailyChange * 7,
    fourWeekKg: averageDailyChange * 28,
    estimatedSoFarKg: changes.reduce((total, change) => total + change, 0),
    loggedDays: changes.length,
    adaptive: adaptiveBaselineKcal !== null,
  };
}
