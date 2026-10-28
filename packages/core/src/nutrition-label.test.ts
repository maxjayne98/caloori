import assert from 'node:assert/strict';
import test from 'node:test';
import { parseNutritionLabel } from './nutrition-label';

test('parses the pasted per-100-gram label and ignores unsupported subcategories', () => {
  const parsed = parseNutritionLabel(`Kind\tPer 100 Gram
Energy\t1,036 kJ (245 kcal)
Fat\t1.2 g
of which saturated\t0.4 g
of which unsaturated\t0.4 g
Carbohydrates\t48 g
of which sugars\t1.3 g
Dietary fiber\t4.3 g
Proteins\t8.3 g
Salty\t0.6 g`);

  assert.equal(parsed?.serving, '100 g');
  assert.equal(parsed?.gramsPerServing, 100);
  assert.deepEqual(parsed?.values, { cal: 245, f: 1.2, c: 48, p: 8.3 });
});

test('reads a name and scales per-100-gram nutrition to a serving weight', () => {
  const parsed = parseNutritionLabel(`Name: Seeded loaf
Serving size: 2 slices (50 g)
Kind\tPer 100 Gram
Energy\t1,036 kJ (245 kcal)
Fat\t1.2 g
Carbohydrates\t48 g
Proteins\t8.3 g`);

  assert.equal(parsed?.name, 'Seeded loaf');
  assert.equal(parsed?.serving, '2 slices');
  assert.equal(parsed?.gramsPerServing, 50);
  assert.deepEqual(parsed?.values, { cal: 122.5, f: 0.6, c: 24, p: 4.15 });
});

test('uses kilojoules when kcal is not included and handles decimal commas', () => {
  const parsed = parseNutritionLabel(`Per serving
Energy: 418.4 kJ
Fat: 1,2 g`);

  assert.deepEqual(parsed?.values, { cal: 100, f: 1.2 });
  assert.equal(parsed?.serving, '1 serving');
});

test('returns null when no supported nutrition values are present', () => {
  assert.equal(parseNutritionLabel('A bowl of soup with extra fiber'), null);
});
