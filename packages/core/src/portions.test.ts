import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePortion,
  defaultFoodUnit,
  formatPortion,
  getFoodUnits,
  parseServing,
  roundAmount,
} from './index';

const chocolate = { id: 'u1', name: 'Chocolate', serving: '100 g', cal: 540, p: 7, c: 57, f: 31 };

test('a named unit on a per-100 g food uses its own weight', () => {
  const food = { ...chocolate, units: [{ name: 'block', grams: 6 }] };
  assert.equal(defaultFoodUnit(food), 'u:block');
  assert.equal(Math.round(calculatePortion(food, 1, 'u:block').cal * 10) / 10, 32.4);
  assert.equal(Math.round(calculatePortion(food, 6, 'g').cal * 10) / 10, 32.4);
  assert.equal(
    formatPortion({
      ...food,
      qty: 0.12,
      portion: { unit: 'u:block', amount: 2, mode: 'decimal', text: '' },
    }),
    '2 block',
  );
});

test('measure foods hide the "1 × 100 g" serving and offer grams or ml', () => {
  const units = getFoodUnits(chocolate);
  assert.equal(units[0].hidden, true);
  assert.equal(defaultFoodUnit(chocolate), 'g');
  const drink = { ...chocolate, serving: '100 ml', units: [{ name: 'can', grams: 330 }] };
  assert.equal(getFoodUnits(drink).find((unit) => unit.id === 'g')?.label, 'ml');
  assert.equal(calculatePortion(drink, 1, 'u:can').cal, 540 * 3.3);
  assert.equal(formatPortion({ ...drink, qty: 2.5 }), '250 ml');
});

test('named servings drop the count and weight from the label', () => {
  assert.deepEqual(parseServing('1 tbsp (20 g)'), {
    kind: 'serving',
    amount: 1,
    label: 'tbsp',
    grams: 20,
    measure: 'g',
  });
  const units = getFoodUnits({ ...chocolate, serving: '1 tbsp (20 g)', gramsPerServing: 20 });
  assert.equal(units[0].label, 'tbsp');
  assert.equal(formatPortion({ ...chocolate, serving: '1 tbsp (20 g)', qty: 2 }), '2 tbsps');
});

test('personal edits of catalog foods drop household estimates that no longer fit', () => {
  const banana = { id: 'f7', name: 'Banana', serving: '1 medium', cal: 105, p: 1, c: 27, f: 0 };
  assert(getFoodUnits(banana).some((unit) => unit.id === 'small'));
  assert(
    !getFoodUnits({ ...banana, edited: true, serving: '100 g' }).some(
      (unit) => unit.id === 'small',
    ),
  );
});

test('converted amounts are rounded for display', () => {
  assert.equal(roundAmount(100 / 3), 33.333);
  assert.equal(roundAmount(1 + 1 / 3), 1.333);
});
