import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_MEAL_CALORIES } from './models';
import { mealCalorieTarget, validMealCalorieShares } from './meal-calories';

test('meal calorie targets use the default distribution and round to whole calories', () => {
  assert.equal(mealCalorieTarget(2000, 'Breakfast'), 500);
  assert.equal(mealCalorieTarget(2000, 'Lunch'), 600);
  assert.equal(mealCalorieTarget(2000, 'Dinner'), 600);
  assert.equal(mealCalorieTarget(2000, 'Snacks'), 300);
  assert.equal(mealCalorieTarget(null, 'Breakfast'), null);
});

test('meal calorie shares must total 100 percent', () => {
  assert.equal(validMealCalorieShares(DEFAULT_MEAL_CALORIES), true);
  assert.equal(validMealCalorieShares({ ...DEFAULT_MEAL_CALORIES, Breakfast: 20 }), false);
});
