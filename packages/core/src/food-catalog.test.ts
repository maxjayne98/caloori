import test from 'node:test';
import assert from 'node:assert/strict';
import additionalFoods from './default-foods.json';
import { FoodSchema, foods, emptyState, getFoodUnits, calculatePortion } from './index';

test('shared defaults are valid, unique, and separate from personal account data', () => {
  assert.equal(additionalFoods.length, 45);
  assert.equal(new Set(foods.map((food) => food.id)).size, foods.length);
  for (const food of additionalFoods) {
    assert(FoodSchema.safeParse(food).success, food.id);
    assert.deepEqual(foods.find((entry) => entry.id === food.id), food);
  }
  assert.deepEqual(emptyState().custom, []);
  assert.deepEqual(emptyState().entries, {});
});
test('every added food supports precise gram portions including eggs and tablespoons', () => {
  for (const food of additionalFoods) {
    assert(getFoodUnits(food).some((unit) => unit.id === 'g'), food.id);
    assert(Math.abs(calculatePortion(food, food.gramsPerServing, 'g').cal - food.cal) < 1e-8, food.id);
    assert(Math.abs(calculatePortion(food, food.gramsPerServing / 2, 'g').p - food.p / 2) < 1e-8, food.id);
  }
});
