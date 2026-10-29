import test from 'node:test';
import assert from 'node:assert/strict';
import { foods, scoreDay, suggestFoods, suggestionPrompt, type ScorableFood } from './index';

type Food = ScorableFood & { id: string; name: string };
const library = foods as unknown as Food[];
const item = (id: string, qty = 1) => ({ ...library.find((f) => f.id === id)!, qty });
const goals = { cal: 2000, p: 100 };

test('suggestions raise the day score and fit the calories left', () => {
  const day = [item('lighvan-feta-cheese', 2), item('barbari-flatbread', 1)];
  const suggestions = suggestFoods(day, library, goals);
  assert.ok(suggestions.length > 0 && suggestions.length <= 3);
  const eaten = day.reduce((s, x) => s + x.cal * x.qty, 0);
  for (const s of suggestions) {
    assert.ok(s.after > s.before);
    assert.ok(eaten + s.food.cal * s.qty <= goals.cal * 1.05);
    const real = scoreDay([...day, { ...s.food, qty: s.qty }], goals, { complete: false })!;
    assert.equal(real.score, s.after);
  }
  // Each food appears once, at its best portion.
  assert.equal(new Set(suggestions.map((s) => s.food.id)).size, suggestions.length);
});

test('no suggestions when the day has no room left', () => {
  assert.deepEqual(suggestFoods([{ cal: 2100, p: 80, c: 250, f: 80, qty: 1 }], library, goals), []);
});

test('familiar foods get a small edge between similar options', () => {
  const day = [item('f0')];
  const plain = suggestFoods(day, library, goals, { limit: 10 });
  const target = plain.at(-1)!.food.id;
  const withRecent = suggestFoods(day, library, goals, { limit: 10, recentIds: [target] });
  assert.ok(
    withRecent.findIndex((s) => s.food.id === target) <=
      plain.findIndex((s) => s.food.id === target),
  );
});

test('assistant prompt carries score, factors and calories left', () => {
  const text = suggestionPrompt({
    score: 62,
    reasons: ['low in fiber'],
    remaining: 812.4,
    eatenNames: ['Toast'],
  });
  assert.match(text, /62\/100/);
  assert.match(text, /low in fiber/);
  assert.match(text, /812 kcal/);
});

test('cooking ingredients are never suggested', () => {
  const suggestions = suggestFoods([item('f14')], library, goals, { limit: 20 });
  assert.ok(suggestions.every((s) => !(s.food as { ingredient?: boolean }).ingredient));
  assert.ok(!suggestions.some((s) => s.food.id === 'brown-lentils-dry'));
});
