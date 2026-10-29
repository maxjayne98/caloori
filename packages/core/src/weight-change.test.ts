import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyState,
  estimateAdaptiveBaselineKcal,
  estimateBmr,
  estimateDailyWeightChange,
  estimateNetActivityCalories,
  estimateRecentWeightTrend,
} from './index';

const profile = {
  ...emptyState().profile,
  age: 30,
  height: 180,
  weight: 80,
  activity: 'Not very active' as const,
};

function dateAt(day: number): string {
  return new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10);
}

test('Mifflin–St Jeor uses the selected profile sex', () => {
  assert.equal(estimateBmr(profile), 1780);
  assert.equal(estimateBmr({ ...profile, sex: 'female' }), 1614);
  assert.equal(estimateBmr({ ...profile, age: null }), null);
});

test('daily weight change adds thermic effect and only net workout calories', () => {
  const bmr = estimateBmr(profile)!;
  const activity = {
    key: 'run',
    type: 'running' as const,
    name: 'Run',
    level: 'Moderate' as const,
    minutes: 60,
    weight: 80,
    met: 8.5,
    cal: 500,
  };
  assert.equal(estimateNetActivityCalories([activity], profile, bmr), 500 - (1780 / 1440) * 60);
  const estimate = estimateDailyWeightChange({ profile, intake: 2000, activities: [activity] });
  assert.ok(estimate);
  assert.equal(estimate.baselineKcal, 1780 * 1.2);
  assert.equal(estimate.thermicKcal, 200);
  assert.ok(estimate.activityKcal < activity.cal);
  assert.ok(estimate.changeKg < 0);
});

test('daily weight estimate is unavailable without required profile inputs', () => {
  assert.equal(
    estimateDailyWeightChange({
      profile: { ...profile, height: null },
      intake: 2000,
    }),
    null,
  );
  assert.equal(
    estimateDailyWeightChange({
      profile: { ...profile, activity: null },
      intake: 2000,
    }),
    null,
  );
});

test('a 78 kg, 175 cm, 28-year-old active man estimates about 0.45 kg loss per week at 2000 kcal', () => {
  const activeProfile = {
    ...profile,
    age: 28,
    height: 175,
    weight: 78,
    activity: 'Active' as const,
  };
  const estimate = estimateDailyWeightChange({ profile: activeProfile, intake: 2000 });
  assert.ok(estimate);
  assert.ok(Math.abs(estimate.changeKg - -0.0643) < 0.001);
  assert.ok(Math.abs(estimate.changeKg * 7 - -0.45) < 0.01);
});

test('adaptive baseline needs sustained weigh-ins and enough logged food days', () => {
  const weights = [
    { date: dateAt(1), weight: 80 },
    { date: dateAt(3), weight: 80 },
    { date: dateAt(6), weight: 80 },
    { date: dateAt(15), weight: 79 },
    { date: dateAt(18), weight: 79 },
    { date: dateAt(21), weight: 79 },
  ];
  const entries = Object.fromEntries(
    Array.from({ length: 15 }, (_, index) => [dateAt(index + 4), [{ cal: 2000, qty: 1 }]]),
  );
  const input = {
    entries,
    activities: {},
    weights,
    profile,
    throughDate: dateAt(21),
  };
  const adaptive = estimateAdaptiveBaselineKcal(input);
  assert.ok(adaptive);
  assert.ok(Math.abs(adaptive - 2325) < 1);
  assert.equal(
    estimateAdaptiveBaselineKcal({
      ...input,
      entries: Object.fromEntries(Object.entries(entries).slice(0, 5)),
    }),
    null,
  );
});

test('recent trend excludes days with no food logs from its average', () => {
  const entries = {
    [dateAt(20)]: [{ cal: 2000, qty: 1 }],
    [dateAt(22)]: [{ cal: 1800, qty: 1 }],
  };
  const trend = estimateRecentWeightTrend({
    entries,
    activities: {},
    weights: [],
    profile,
    throughDate: dateAt(22),
    days: 7,
  });
  assert.ok(trend);
  assert.equal(trend.loggedDays, 2);
  assert.equal(trend.adaptive, false);
  assert.equal(trend.fourWeekKg, trend.weeklyKg * 4);
  assert.ok(Math.abs(trend.estimatedSoFarKg - trend.weeklyKg * (2 / 7)) < 1e-12);
});
