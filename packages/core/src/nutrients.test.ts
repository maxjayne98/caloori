import test from 'node:test';
import assert from 'node:assert/strict';
import {
  barcodeProductToFood,
  calculatePortion,
  emptyState,
  extraNutrientsFromInput,
  saltToSodiumMg,
  sumExtraNutrients,
  validateState,
  foods,
  EXTRA_NUTRIENT_KEYS,
  type ExtraNutrients,
} from './index';

test('extra nutrients are optional and old foods stay valid', () => {
  const state = emptyState();
  const food = { id: 'a', name: 'Apple', serving: '1', cal: 95, p: 0.5, c: 25, f: 0.3, qty: 1 };
  const withExtras = { ...food, id: 'b', sugar: 19, fiber: 4.4, sodium: 2 };
  const valid = validateState({ ...state, entries: { '2026-10-29': [food, withExtras] } });
  assert.equal(valid.entries['2026-10-29'][0].sodium, undefined);
  assert.equal(valid.entries['2026-10-29'][1].fiber, 4.4);
  assert.throws(() =>
    validateState({ ...state, entries: { '2026-10-29': [{ ...food, sodium: -1 }] } }),
  );
});

test('totals treat missing values as unknown, not zero', () => {
  const totals = sumExtraNutrients([
    { sodium: 200, qty: 2 },
    { sodium: 100, qty: 1, cholesterol: 50 },
    { qty: 3 },
  ]);
  assert.deepEqual(totals.sodium, { amount: 500, known: 2, of: 3 });
  assert.deepEqual(totals.cholesterol, { amount: 50, known: 1, of: 3 });
  assert.deepEqual(totals.fiber, { amount: 0, known: 0, of: 3 });
});

test('portions scale known extras and leave unknown ones out', () => {
  const food = {
    id: 'x',
    serving: '100 g',
    gramsPerServing: 100,
    cal: 100,
    p: 1,
    c: 1,
    f: 1,
    sodium: 300,
  };
  const portion = calculatePortion(food, 2, 'serving');
  assert.equal(portion.sodium, 600);
  assert.equal('fiber' in portion, false);
});

test('form input keeps blanks unknown and accepts zero', () => {
  assert.deepEqual(extraNutrientsFromInput({ sugar: '', fiber: '0', sodium: '120', satFat: 'x' }), {
    fiber: 0,
    sodium: 120,
  });
  assert.equal(saltToSodiumMg(2.5), 1000);
});

test('Open Food Facts products bring extras in mg where needed', () => {
  const food = barcodeProductToFood(
    {
      product_name: 'Crackers',
      nutriments: {
        'energy-kcal_100g': 450,
        proteins_100g: 9,
        carbohydrates_100g: 70,
        fat_100g: 15,
        sugars_100g: 4,
        fiber_100g: 3,
        'saturated-fat_100g': 6,
        salt_100g: 1.2,
        cholesterol_100g: 0.01,
      },
    },
    '12345678',
  ) as ExtraNutrients;
  assert.equal(food.sugar, 4);
  assert.equal(food.satFat, 6);
  assert.equal(Math.round(food.sodium ?? 0), 480);
  assert.equal(food.cholesterol, 10);
});

test('every built-in catalog food carries all extra nutrients per serving', () => {
  for (const food of foods as Array<Record<string, unknown>>) {
    for (const key of EXTRA_NUTRIENT_KEYS)
      assert.equal(typeof food[key], 'number', `${food.id} is missing ${key}`);
  }
  const egg = foods.find((f) => f.id === 'egg-whole-raw') as ExtraNutrients;
  assert.equal(egg.cholesterol, 186);
});
