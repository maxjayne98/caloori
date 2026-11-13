import test from 'node:test';
import assert from 'node:assert/strict';
import { foodUsage, matchesFoodQuery, normalizeSearch, rankFoods } from './food-ranking';

const library = [
  { id: 'yog', name: 'Greek yogurt' },
  { id: 'oat', name: 'Oatmeal' },
  { id: 'kip', name: 'Kipfilet', brand: 'AH' },
  { id: 'cre', name: 'Crème fraîche' },
  { id: 'app', name: 'Apple' },
];
const entries = {
  '2026-11-01': [
    { id: 'oat', meal: 'Breakfast', qty: 1 },
    { id: 'kip', meal: 'Dinner', qty: 1.5 },
  ],
  '2026-11-12': [
    { id: 'yog', meal: 'Breakfast', qty: 2, portion: { unit: 'g', amount: 200 } },
    { id: 'yog', meal: 'Snacks', qty: 1 },
  ],
};

test('usage counts logs per meal and remembers the latest amount', () => {
  const usage = foodUsage(entries);
  assert.equal(usage.get('yog')?.count, 2);
  assert.deepEqual(usage.get('yog')?.meals, { Breakfast: 1, Snacks: 1 });
  assert.deepEqual(usage.get('yog')?.last, { qty: 1, portion: undefined });
  assert.equal(usage.get('kip')?.last.qty, 1.5);
  assert.equal(usage.has('app'), false);
});

test('suggestions put foods used at this meal and recently first; the rest follow by name', () => {
  const usage = foodUsage(entries);
  const breakfast = rankFoods(library, usage, { meal: 'Breakfast', today: '2026-11-13' });
  assert.deepEqual(
    breakfast.suggested.map((f) => f.id),
    ['yog', 'oat', 'kip'],
  );
  assert.deepEqual(
    breakfast.others.map((f) => f.id),
    ['app', 'cre'],
  );
  const dinner = rankFoods(library, usage, { meal: 'Dinner', today: '2026-11-13' });
  assert.equal(dinner.suggested[0].id, 'yog'); // recent use outweighs one old dinner log
  assert.equal(
    rankFoods(library, usage, { meal: 'Dinner', today: '2026-12-30' }).suggested[0].id,
    'kip',
  );
});

test('search matches every word in any order, ignores accents and checks the brand', () => {
  assert.equal(normalizeSearch(' Crème  '), 'creme');
  assert(matchesFoodQuery(library[3], 'creme fraiche'));
  assert(matchesFoodQuery(library[2], 'ah kip'));
  assert(!matchesFoodQuery(library[2], 'kip jumbo'));
  const usage = foodUsage(entries);
  const result = rankFoods(library, usage, { meal: 'Lunch', query: 'e', today: '2026-11-13' });
  assert.equal(result.suggested.length, 0);
  // Recently used foods first, unused ones by name.
  assert.deepEqual(
    result.others.map((f) => f.id),
    ['yog', 'kip', 'oat', 'app', 'cre'],
  );
  // A name that starts with the query beats an equally (un)used one.
  const apple = rankFoods(library, usage, { meal: 'Lunch', query: 'ap', today: '2026-11-13' });
  assert.deepEqual(
    apple.others.map((f) => f.id),
    ['app'],
  );
});
