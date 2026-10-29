import test from 'node:test';
import assert from 'node:assert/strict';
import { foods, gradeFromPoints, scoreFood, type ScorableFood } from './index';

const byId = (id: string) => foods.find((food) => food.id === id) as unknown as ScorableFood;

test('grade boundaries follow Nutri-Score', () => {
  assert.equal(gradeFromPoints(-5), 'A');
  assert.equal(gradeFromPoints(-1), 'A');
  assert.equal(gradeFromPoints(0), 'B');
  assert.equal(gradeFromPoints(2), 'B');
  assert.equal(gradeFromPoints(3), 'C');
  assert.equal(gradeFromPoints(11), 'D');
  assert.equal(gradeFromPoints(19), 'E');
});

test('realistic catalog grades with full data and high confidence', () => {
  const lentils = scoreFood(byId('brown-lentils-dry'));
  assert.equal(lentils.grade, 'A');
  assert.equal(lentils.confidence, 'high');
  assert.ok(lentils.reasons.includes('goodFiber'));

  const sugar = scoreFood(byId('granulated-sugar'));
  // Classic thresholds cap sugar at 10 points, so pure sugar lands on D or E.
  assert.ok(['D', 'E'].includes(sugar.grade));
  assert.ok(sugar.reasons.includes('highSugar'));

  const feta = scoreFood(byId('lighvan-feta-cheese'));
  assert.ok(['D', 'E'].includes(feta.grade));
  assert.equal(feta.reasons[0], 'highSodium');

  assert.ok(['A', 'B'].includes(scoreFood(byId('chicken-breast-raw')).grade));
  assert.ok(['A', 'B'].includes(scoreFood(byId('tomato-raw')).grade));
});

test('missing data is estimated instead of refusing to score', () => {
  // A quick add: only calories and macros, no weight or extras.
  const score = scoreFood({ cal: 250, p: 10, c: 30, f: 10 });
  assert.ok(['A', 'B', 'C', 'D', 'E'].includes(score.grade));
  assert.equal(score.confidence, 'low');
  assert.deepEqual(score.estimated.sort(), ['fiber', 'grams', 'satFat', 'sodium', 'sugar']);

  // Known weight, only sodium missing: still a fair score with medium confidence.
  const partial = scoreFood({
    cal: 120,
    p: 22.5,
    c: 0,
    f: 2.6,
    gramsPerServing: 100,
    sugar: 0,
    fiber: 0,
    satFat: 0.6,
  });
  assert.equal(partial.confidence, 'medium');
  assert.deepEqual(partial.estimated, ['sodium']);
});

test('more sodium never improves a score', () => {
  const base = { cal: 200, p: 8, c: 30, f: 5, gramsPerServing: 100, sugar: 3, fiber: 3, satFat: 1 };
  const low = scoreFood({ ...base, sodium: 50 });
  const high = scoreFood({ ...base, sodium: 900 });
  assert.ok(high.points > low.points);
  assert.ok(high.reasons.includes('highSodium'));
});

test('oils are judged on their saturated share, so olive oil beats butter', () => {
  const olive = scoreFood(byId('f13'));
  const butter = scoreFood(byId('unsalted-butter'));
  assert.ok(olive.points < butter.points);
  assert.ok(['C', 'D'].includes(olive.grade));
  assert.ok(['D', 'E'].includes(butter.grade));
});
