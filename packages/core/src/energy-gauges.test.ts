import test from 'node:test';
import assert from 'node:assert/strict';
import { macroSegments, macroTargetBand, mealSegments } from './index';

test('segments fill in meal order and only where a meal covers their middle', () => {
  const { segments, overKcal } = mealSegments(
    [
      { cal: 500, meal: 'Breakfast' },
      { cal: 300, qty: 2, meal: 'Lunch' },
      { cal: 40, meal: 'Snacks' },
    ],
    2000,
    20,
  );
  // 100 kcal per segment: 5 breakfast, 6 lunch; the 40 kcal snack does not reach a segment middle.
  assert.deepEqual(segments.slice(0, 12), [
    ...Array(5).fill('Breakfast'),
    ...Array(6).fill('Lunch'),
    null,
  ]);
  assert.equal(segments.filter(Boolean).length, 11);
  assert.equal(overKcal, 0);
});

test('going past the goal fills every segment and reports the extra', () => {
  const { segments, overKcal } = mealSegments([{ cal: 2300, meal: 'Dinner' }], 2000, 20);
  assert.equal(
    segments.every((meal) => meal === 'Dinner'),
    true,
  );
  assert.equal(overKcal, 300);
});

test('items without a meal count as snacks; no goal means an empty dial', () => {
  assert.equal(mealSegments([{ cal: 200 }], 2000, 20).segments[0], 'Snacks');
  assert.deepEqual(mealSegments([{ cal: 200 }], 0, 4).segments, [null, null, null, null]);
});

test('macro target band is 10% around the goal', () => {
  assert.deepEqual(macroTargetBand(130), { low: 117, high: 143 });
  assert.equal(macroTargetBand(0), null);
});

test('macro segments follow where the calories came from', () => {
  // 100 g protein (400) + 100 g carbs (400) + 22.2 g fat (~200) = 1,000 kcal of a 2,000 goal.
  const { segments, overKcal } = macroSegments({ cal: 1000, p: 100, c: 100, f: 200 / 9 }, 2000, 20);
  assert.deepEqual(segments, [
    ...Array(4).fill('p'),
    ...Array(4).fill('c'),
    ...Array(2).fill('f'),
    ...Array(10).fill(null),
  ]);
  assert.equal(overKcal, 0);
});

test('macro segments scale to logged calories and handle over, empty and missing goals', () => {
  // Macros add up to 800 kcal but 1,000 were logged: shares are kept, total follows the log.
  const scaled = macroSegments({ cal: 1000, p: 100, c: 100, f: 0 }, 2000, 20).segments;
  assert.equal(scaled.filter((m) => m === 'p').length, 5);
  assert.equal(scaled.filter((m) => m === 'c').length, 5);
  const over = macroSegments({ cal: 2500, p: 0, c: 500, f: 0 }, 2000, 10);
  assert.equal(over.segments.every((m) => m === 'c'), true);
  assert.equal(over.overKcal, 500);
  assert.deepEqual(macroSegments({ cal: 0, p: 0, c: 0, f: 0 }, 2000, 3).segments, [null, null, null]);
  assert.deepEqual(macroSegments({ cal: 300, p: 10, c: 10, f: 10 }, 0, 2).segments, [null, null]);
});
