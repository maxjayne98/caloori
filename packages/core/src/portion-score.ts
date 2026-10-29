import {
  resolveNutrients,
  type Confidence,
  type ScorableFood,
  confidenceFromDoubt,
} from './food-score';
import { SODIUM_REFERENCE_MG } from './meal-score';

/**
 * Portion size score: how much of a day's budget this one serving uses. A great food can still
 * be too much at once (a kilo of yogurt), so this complements the per-100 g food grade.
 */
export type PortionLevel = 'good' | 'hearty' | 'large' | 'tooMuch';
export type PortionDriver = 'energy' | 'sodium' | 'satFat' | 'sugar';

export interface PortionScore {
  level: PortionLevel;
  /** The budget this serving uses the most of. */
  driver: PortionDriver;
  /** Share of that daily budget, in percent (rounded). */
  percent: number;
  confidence: Confidence;
}

/** Fallback when the user has no calorie goal yet. */
const DEFAULT_ENERGY_GOAL = 2000;

/**
 * Daily budgets: energy from the goal; saturated fat under 10% of energy (9 kcal/g); sugar
 * capped at 10% of energy for free sugars, doubled because we only know total sugar
 * (fruit and milk sugars count too); sodium from the WHO reference.
 */
export function dailyBudgets(calorieGoal?: number | null) {
  const energy = calorieGoal && calorieGoal > 0 ? calorieGoal : DEFAULT_ENERGY_GOAL;
  return {
    energy,
    sodium: SODIUM_REFERENCE_MG,
    satFat: (energy * 0.1) / 9,
    sugar: ((energy * 0.1) / 4) * 2,
  };
}

export function scorePortion(
  serving: ScorableFood,
  calorieGoal?: number | null,
): PortionScore | null {
  if (!(serving.cal > 0)) return null;
  const budgets = dailyBudgets(calorieGoal);
  const resolved = resolveNutrients(serving);
  const shares: Record<PortionDriver, number> = {
    energy: serving.cal / budgets.energy,
    sodium: resolved.sodium / budgets.sodium,
    satFat: resolved.satFat / budgets.satFat,
    sugar: resolved.sugar / budgets.sugar,
  };
  const [driver, share] = (Object.entries(shares) as [PortionDriver, number][]).reduce((a, b) =>
    b[1] > a[1] ? b : a,
  );
  // One serving is one of several meals and snacks: a quarter of a budget is a normal portion.
  const level: PortionLevel =
    share <= 0.25 ? 'good' : share <= 0.5 ? 'hearty' : share <= 1 ? 'large' : 'tooMuch';
  return {
    level,
    driver,
    percent: Math.round(share * 100),
    confidence: confidenceFromDoubt(resolved.doubt),
  };
}

/** Meal that fits the time of day, used as the default when logging without a chosen meal. */
export function mealForTime(date: Date): 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 16) return 'Lunch';
  if (hour >= 18 && hour < 22) return 'Dinner';
  return 'Snacks';
}
