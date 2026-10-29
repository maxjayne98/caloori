import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePortion, foods, mealForTime, scorePortion, type ScorableFood } from './index';

const yogurt = foods.find((food) => food.id === 'whole-milk-yogurt') as unknown as ScorableFood;
const serving = (grams: number) => ({
  ...yogurt,
  ...calculatePortion(yogurt, grams, 'g'),
  gramsPerServing: grams,
});

test('a normal bowl of yogurt is a good portion, a kilo is too much at once', () => {
  assert.equal(scorePortion(serving(150), 2300)?.level, 'good');
  const kilo = scorePortion(serving(1000), 2300)!;
  assert.equal(kilo.level, 'large');
  assert.equal(kilo.driver, 'satFat');
  assert.ok(kilo.percent > 50);
  assert.equal(scorePortion(serving(1500), 2300)?.level, 'tooMuch');
});

test('salty foods are judged on sodium even at modest calories', () => {
  const kashk = foods.find((food) => food.id === 'kashk-liquid-whey') as unknown as ScorableFood;
  const score = scorePortion({ ...kashk, ...calculatePortion(kashk, 100, 'g') }, 2300)!;
  assert.equal(score.driver, 'sodium');
  assert.equal(score.level, 'large');
});

test('works without a calorie goal or extra nutrients', () => {
  const quick = scorePortion({ cal: 900, p: 30, c: 100, f: 40 });
  assert.ok(quick);
  assert.equal(quick.confidence, 'low');
  assert.equal(scorePortion({ cal: 0, p: 0, c: 0, f: 0 }), null);
});

test('default meal follows the time of day', () => {
  const at = (hour: number) => mealForTime(new Date(2026, 9, 29, hour));
  assert.equal(at(7), 'Breakfast');
  assert.equal(at(13), 'Lunch');
  assert.equal(at(17), 'Snacks');
  assert.equal(at(19), 'Dinner');
  assert.equal(at(23), 'Snacks');
  assert.equal(at(3), 'Snacks');
});
