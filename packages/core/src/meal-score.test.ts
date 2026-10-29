import test from 'node:test';
import assert from 'node:assert/strict';
import { foods, scoreDay, scoreMeal, type ScorableFood } from './index';

const item = (id: string, qty = 1) => ({
  ...(foods.find((food) => food.id === id) as unknown as ScorableFood),
  qty,
});

test('meal score is energy-weighted and empty meals have none', () => {
  assert.equal(scoreMeal([]), null);
  const salad = scoreMeal([item('tomato-raw', 2), item('zucchini-raw', 2), item('f13', 0.3)]);
  const butterOnly = scoreMeal([item('unsalted-butter', 2)]);
  assert.ok(salad && butterOnly);
  assert.ok(salad.points < butterOnly.points);
  assert.ok(['A', 'B', 'C'].includes(salad.grade));
});

test('quick adds without any extras still get a meal score', () => {
  const meal = scoreMeal([{ cal: 600, p: 20, c: 70, f: 25, qty: 1 }]);
  assert.ok(meal);
  assert.equal(meal.confidence, 'low');
});

test('day score rewards a balanced complete day and flags salt', () => {
  const goals = { cal: 2000, p: 100 };
  const balanced = [
    item('f0', 1),
    item('f1', 1),
    item('chicken-breast-raw', 2),
    item('basmati-rice-dry', 1),
    item('brown-lentils-dry', 1),
    item('tomato-raw', 2),
    item('f10', 1),
    item('f13', 1),
  ];
  const day = scoreDay(balanced, goals, { complete: true })!;
  assert.ok(day.score >= 70, `balanced day scored ${day.score}`);

  const salty = scoreDay(
    [item('lighvan-feta-cheese', 8), item('reshteh-soup-noodle-dry', 2)],
    goals,
    {
      complete: true,
    },
  )!;
  assert.ok(salty.score < day.score);
  assert.ok(salty.reasons.includes('sodiumHigh'));
});

test('an unfinished day is not penalised for energy or protein yet', () => {
  const breakfast = [item('f0'), item('f1')];
  const morning = scoreDay(breakfast, { cal: 2000, p: 100 }, { complete: false })!;
  const sameDayFinished = scoreDay(breakfast, { cal: 2000, p: 100 }, { complete: true })!;
  assert.ok(morning.score > sameDayFinished.score);
  assert.ok(!morning.reasons.includes('energyUnder'));
  assert.equal(scoreDay([], { cal: 2000 }, { complete: true }), null);
});

test('missing goals drop out instead of breaking the day score', () => {
  const day = scoreDay([item('chicken-breast-raw')], {}, { complete: true });
  assert.ok(day && day.score >= 0 && day.score <= 100);
});

test('meal score is 0–100 and agrees with the grade direction', () => {
  const good = scoreMeal([item('brown-lentils-dry'), item('tomato-raw', 2)])!;
  const poor = scoreMeal([item('unsalted-butter', 3), item('granulated-sugar', 2)])!;
  assert.ok(good.score > poor.score);
  for (const meal of [good, poor]) assert.ok(meal.score >= 0 && meal.score <= 100);
});
