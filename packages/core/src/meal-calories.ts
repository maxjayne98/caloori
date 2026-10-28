import { DEFAULT_MEAL_CALORIES, type MealName } from './models';

export function mealCalorieTarget(
  dailyCalories: number | null | undefined,
  meal: MealName,
  shares: Partial<Record<MealName, number>> = DEFAULT_MEAL_CALORIES,
) {
  if (!dailyCalories || dailyCalories <= 0) return null;
  return Math.round((dailyCalories * (shares[meal] ?? DEFAULT_MEAL_CALORIES[meal])) / 100);
}

export function validMealCalorieShares(shares: Partial<Record<MealName, number>>) {
  return (
    (['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).reduce(
      (sum, meal) => sum + (shares[meal] ?? 0),
      0,
    ) === 100
  );
}
