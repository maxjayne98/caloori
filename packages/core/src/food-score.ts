import type { ExtraNutrientKey, ExtraNutrients } from './nutrients';

/**
 * Food quality score based on the published Nutri-Score method for general foods (per 100 g):
 * "bad" points for energy, sugar, saturated fat and sodium, "good" points for fiber, protein and
 * fruit/vegetable share. Lower points are better; points map to grades A–E.
 *
 * Unlike the label, it never refuses to score: any missing input is estimated from what we do
 * know (and listed in `estimated`), lowering `confidence` instead of hiding the result.
 */

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E';
export type Confidence = 'high' | 'medium' | 'low';
export type ScoreReason =
  | 'highSugar'
  | 'highSatFat'
  | 'highSodium'
  | 'highEnergy'
  | 'goodFiber'
  | 'goodProtein'
  | 'fruitVeg';
export type EstimatedInput = ExtraNutrientKey | 'grams';

export interface ScorableFood extends ExtraNutrients {
  cal: number;
  p: number;
  c: number;
  f: number;
  gramsPerServing?: number | null;
  /** Reference serving weight for scoring only, when the food has no `gramsPerServing`. */
  referenceGrams?: number;
  /** Percentage of fruit, vegetables, legumes and nuts (0–100), when known. */
  fruitVeg?: number;
}

export interface FoodScore {
  grade: Grade;
  /** Nutri-Score points: about −15 (best) to 40 (worst). */
  points: number;
  confidence: Confidence;
  /** Most important explanations first, at most three. */
  reasons: ScoreReason[];
  estimated: EstimatedInput[];
}

// Thresholds per 100 g (Nutri-Score general foods). Each step past a threshold adds one point.
const ENERGY_KJ = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];
const SUGAR_G = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45];
const SAT_FAT_G = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SODIUM_MG = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900];
// Added fats and oils are judged on saturated share of total fat (%), as Nutri-Score does.
const SAT_FAT_RATIO = [10, 16, 22, 28, 34, 40, 46, 52, 58, 64];
const FIBER_G = [0.9, 1.9, 2.8, 3.7, 4.7];
const PROTEIN_G = [1.6, 3.2, 4.8, 6.4, 8];

function points(value: number, thresholds: number[]) {
  let count = 0;
  for (const threshold of thresholds) if (value > threshold) count++;
  return count;
}

function fruitVegPoints(percent: number) {
  if (percent > 80) return 5;
  if (percent > 60) return 2;
  if (percent > 40) return 1;
  return 0;
}

export function gradeFromPoints(value: number): Grade {
  if (value <= -1) return 'A';
  if (value <= 2) return 'B';
  if (value <= 10) return 'C';
  if (value <= 18) return 'D';
  return 'E';
}

// How much each estimate weakens trust in the result (sums cap at "low").
const ESTIMATE_WEIGHT: Record<EstimatedInput, number> = {
  grams: 0.35,
  sodium: 0.3,
  satFat: 0.25,
  sugar: 0.25,
  fiber: 0.15,
  cholesterol: 0,
};

/** Rough serving weight when unknown: macros weigh at least their own grams, at most ~2 kcal/g. */
function estimateGrams(food: ScorableFood) {
  return Math.max(food.p + food.c + food.f, food.cal / 2, 1);
}

export interface ResolvedNutrients {
  /** Per-serving values, known or estimated. */
  grams: number;
  sugar: number;
  satFat: number;
  fiber: number;
  sodium: number;
  estimated: EstimatedInput[];
  /** 0 (all known) and up: how much the estimates weaken the result. */
  doubt: number;
}

/** Fills every scoring input for one serving, estimating what is missing from the macros. */
export function resolveNutrients(food: ScorableFood): ResolvedNutrients {
  const estimated: EstimatedInput[] = [];
  const has = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0;

  let grams =
    has(food.gramsPerServing) && food.gramsPerServing > 0
      ? food.gramsPerServing
      : food.referenceGrams;
  if (!has(grams) || grams === 0) {
    grams = estimateGrams(food);
    estimated.push('grams');
  }
  // Estimates from the macros we always have; chosen to be typical rather than flattering.
  const sugar = has(food.sugar) ? food.sugar : (estimated.push('sugar'), food.c * 0.3);
  const satFat = has(food.satFat) ? food.satFat : (estimated.push('satFat'), food.f * 0.35);
  const fiber = has(food.fiber) ? food.fiber : (estimated.push('fiber'), food.c * 0.05);
  const sodium = has(food.sodium) ? food.sodium : (estimated.push('sodium'), (150 * grams) / 100);
  const doubt = estimated.reduce((sum, key) => sum + ESTIMATE_WEIGHT[key], 0);
  return { grams, sugar, satFat, fiber, sodium, estimated, doubt };
}

export function confidenceFromDoubt(doubt: number): Confidence {
  return doubt < 0.2 ? 'high' : doubt < 0.55 ? 'medium' : 'low';
}

export function scoreFood(food: ScorableFood): FoodScore {
  const { grams, sugar, satFat, fiber, sodium, estimated, doubt } = resolveNutrients(food);
  const per100 = (value: number) => (value * 100) / grams;

  const energyKj = per100(food.cal) * 4.184;
  const isAddedFat = food.cal > 0 && (food.f * 9) / food.cal > 0.8;
  const n = {
    energy: points(energyKj, ENERGY_KJ),
    sugar: points(per100(sugar), SUGAR_G),
    satFat: isAddedFat
      ? points(food.f > 0 ? (satFat / food.f) * 100 : 0, SAT_FAT_RATIO)
      : points(per100(satFat), SAT_FAT_G),
    sodium: points(per100(sodium), SODIUM_MG),
  };
  const fv = fruitVegPoints(food.fruitVeg ?? 0);
  const pos = {
    fiber: points(per100(fiber), FIBER_G),
    protein: points(per100(food.p), PROTEIN_G),
  };
  const negative = n.energy + n.sugar + n.satFat + n.sodium;
  // As in Nutri-Score, protein only counts when the food is not already clearly unhealthy.
  const proteinCounts = negative < 11 || fv === 5;
  const total = negative - pos.fiber - fv - (proteinCounts ? pos.protein : 0);

  const reasons: [ScoreReason, number][] = [];
  if (n.sodium >= 4) reasons.push(['highSodium', n.sodium]);
  if (n.satFat >= 4) reasons.push(['highSatFat', n.satFat]);
  if (n.sugar >= 4) reasons.push(['highSugar', n.sugar]);
  if (n.energy >= 7) reasons.push(['highEnergy', n.energy - 3]);
  if (pos.fiber >= 3) reasons.push(['goodFiber', pos.fiber]);
  if (proteinCounts && pos.protein >= 4) reasons.push(['goodProtein', pos.protein]);
  if (fv >= 2) reasons.push(['fruitVeg', fv]);

  return {
    grade: gradeFromPoints(total),
    points: total,
    confidence: confidenceFromDoubt(doubt),
    reasons: reasons
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason]) => reason),
    estimated,
  };
}
