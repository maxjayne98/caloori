import test from 'node:test';
import assert from 'node:assert/strict';
import {
  foods,
  calculatePortion,
  fractionDisplay,
  formatPortion,
  appendDiaryEntries,
  savedDayGoal,
  buildProgressDays,
  chartDays,
  scaleMealItem,
  sumMealItems,
  estimateActivity,
  barcodeIsValid,
  barcodeProductToFood,
  emptyState,
  validateState,
  importState,
} from './index';

test('gram and fraction conversions retain precise nutrition', () => {
  const yogurt = foods[0],
    banana = foods[7];
  assert.equal(calculatePortion(yogurt, 85, 'g').cal, 50);
  assert(Math.abs(calculatePortion(yogurt, 150.5, 'g').p - 15.05) < 1e-9);
  assert.equal(calculatePortion(banana, 1.5, 'serving').cal, 157.5);
  assert.equal(calculatePortion(banana, 1 / 3, 'serving').c, 9);
  assert.equal(fractionDisplay(1.5), '1 ½');
  assert.equal(fractionDisplay(1 / 3), '⅓');
});
test('saved meals expand separate foods without mutating the template', () => {
  const egg = { ...foods[9], qty: 3 },
    toast = { ...foods[14], qty: 2 };
  const scaled = [egg, toast].map((food) => scaleMealItem(food, 0.5));
  assert.equal(scaled.length, 2);
  assert.equal(scaled[0].qty, 1.5);
  assert.equal(scaled[1].qty, 1);
  assert.equal(sumMealItems(scaled).cal, 188);
  assert.equal(egg.qty, 3);
  assert.equal(formatPortion(toast), '2 slices');
});
test('historical goals survive subsequent changes and copy logs take the new goal', () => {
  const profile = { ...emptyState().profile, cal: 2000, p: 120, c: 250, f: 65 };
  let diary = appendDiaryEntries(
    {},
    '2026-10-24',
    [{ ...foods[0], qty: 1, meal: 'Breakfast' }],
    profile,
  );
  const changed = { ...profile, cal: 2400 };
  diary = appendDiaryEntries(
    diary,
    '2026-10-25',
    [{ ...foods[0], qty: 1, meal: 'Lunch' }],
    changed,
  );
  diary = appendDiaryEntries(diary, '2026-10-26', diary['2026-10-24'], { ...profile, cal: 1800 });
  assert.equal(savedDayGoal(diary['2026-10-24']), 2000);
  assert.equal(savedDayGoal(diary['2026-10-25']), 2400);
  assert.equal(savedDayGoal(diary['2026-10-26']), 1800);
  assert.equal(savedDayGoal([{ ...foods[0], qty: 1 }]), null);
});
test('progress periods do not count unlogged days as zero intake', () => {
  const entries = { '2026-10-26': [{ ...foods[0], qty: 1.5 }] };
  const workouts = {
    '2026-10-26': [
      { type: 'padel', minutes: 60, cal: 454 },
      { type: 'gym', minutes: 30, cal: 132 },
    ],
  };
  const days = buildProgressDays(entries, workouts, '2026-10-26', 7);
  assert.equal(days.length, 7);
  assert.equal(days[0].date, '2026-10-20');
  assert.equal(days.filter((x) => x.hasFood).length, 1);
  assert.equal(days.at(-1)?.intake, 150);
  assert.equal(days.at(-1)?.minutes, 90);
  assert.equal(buildProgressDays(entries, workouts, '2026-10-26', 7, 'padel').at(-1)?.burned, 454);
  assert.equal(chartDays('2026-10-26', 30)[0], '2026-09-27');
});
test('workout estimates and barcode validation match original behavior', () => {
  assert.equal(estimateActivity(6, 72, 30), 227);
  assert(estimateActivity(8, 72, 60) > estimateActivity(4.5, 72, 60));
  assert(barcodeIsValid('3017620422003'));
  assert(!barcodeIsValid('3017620422004'));
  assert.throws(() => barcodeProductToFood({ nutriments: {} }, '3017620422003'));
  const food = barcodeProductToFood(
    {
      product_name: 'Example',
      nutriments: {
        'energy-kcal_100g': 100,
        proteins_100g: 10,
        carbohydrates_100g: 12,
        fat_100g: 0,
      },
    },
    '3017620422003',
  );
  assert.equal(food.cal, 100);
  assert.equal(food.f, 0);
});
test('backup validation rejects malformed data and migrates six-key legacy exports', () => {
  assert.throws(() =>
    validateState({ ...emptyState(), profile: { ...emptyState().profile, cal: -100 } }),
  );
  const imported = importState({
    'nourish-profile': emptyState().profile,
    'nourish-diary': { '2026-10-26': [{ ...foods[0], qty: 1 }] },
    'nourish-weights': [],
    'nourish-foods': [],
    'nourish-meal-templates': [],
    'nourish-activities': {},
  });
  assert.equal(imported.entries['2026-10-26'][0].name, 'Greek yogurt');
  assert.equal(savedDayGoal(imported.entries['2026-10-26']), null);
});
