import {
  confidenceFromDoubt,
  gradeFromPoints,
  resolveNutrients,
  scoreFood,
  type Confidence,
  type Grade,
  type ScorableFood,
  type ScoreReason,
} from './food-score';

type LoggedItem = ScorableFood & { qty?: number };

const clamp = (value: number) => Math.max(0, Math.min(100, value));
/** 100 at or below `good`, 0 at or beyond `bad`, linear between. */
const scale = (value: number, good: number, bad: number) =>
  clamp(((bad - value) / (bad - good)) * 100);

/** Quality points (Nutri-Score scale) as 0–100: −8 or better is 100, 18 or worse is 0. */
export function qualityPercent(points: number) {
  return Math.round(scale(points, -8, 18));
}

export interface MealScore {
  grade: Grade;
  /** 0–100, higher is better; same scale as the day score's food-quality part. */
  score: number;
  /** Energy-weighted average of the foods' Nutri-Score points. */
  points: number;
  confidence: Confidence;
  reasons: ScoreReason[];
}

function energyOf(item: LoggedItem) {
  return Math.max(0, item.cal * (item.qty ?? 1));
}

/**
 * Meal quality: the energy-weighted average of its foods' scores, so a spoon of butter on a
 * big salad matters less than the butter alone. Null for an empty meal.
 */
export function scoreMeal(items: readonly LoggedItem[]): MealScore | null {
  const total = items.reduce((sum, item) => sum + energyOf(item), 0);
  if (!items.length) return null;
  // Zero-calorie items (water, tea) still count equally when nothing else has energy.
  const weight = (item: LoggedItem) => (total > 0 ? energyOf(item) / total : 1 / items.length);
  let points = 0;
  let doubt = 0;
  const reasonWeight = new Map<ScoreReason, number>();
  for (const item of items) {
    const share = weight(item);
    const score = scoreFood(item);
    points += score.points * share;
    doubt += resolveNutrients(item).doubt * share;
    score.reasons.forEach((reason, index) =>
      reasonWeight.set(reason, (reasonWeight.get(reason) ?? 0) + share / (index + 1)),
    );
  }
  return {
    grade: gradeFromPoints(Math.round(points)),
    score: qualityPercent(points),
    points,
    confidence: confidenceFromDoubt(doubt),
    reasons: [...reasonWeight.entries()]
      .filter(([, value]) => value >= 0.15)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason]) => reason),
  };
}

export type DayReason =
  | 'qualityGood'
  | 'qualityLow'
  | 'sodiumHigh'
  | 'sodiumOk'
  | 'fiberLow'
  | 'fiberGood'
  | 'energyOnTarget'
  | 'energyOver'
  | 'energyUnder'
  | 'proteinLow'
  | 'proteinGood';

export interface DayScore {
  /** 0–100, higher is better. */
  score: number;
  grade: Grade;
  confidence: Confidence;
  /** Biggest effects first: what helped or hurt today. */
  reasons: DayReason[];
}

interface DayGoals {
  cal?: number | null;
  p?: number | null;
}

/** Reference intakes (WHO adult guidance); used when the user has no personal limit set. */
export const SODIUM_REFERENCE_MG = 2000;
const FIBER_PER_1000_KCAL = 14;

/**
 * Day score from food quality, sodium, fiber and – once the day is finished – how close energy
 * and protein came to the goals. Components without a goal drop out and the weights rebalance,
 * so there is always a score as long as something was logged.
 */
export function scoreDay(
  items: readonly LoggedItem[],
  goals: DayGoals,
  { complete }: { complete: boolean },
): DayScore | null {
  if (!items.length) return null;
  const meal = scoreMeal(items)!;
  let energy = 0;
  let protein = 0;
  let sodium = 0;
  let fiber = 0;
  let doubt = 0;
  for (const item of items) {
    const qty = item.qty ?? 1;
    const resolved = resolveNutrients(item);
    energy += energyOf(item);
    protein += item.p * qty;
    sodium += resolved.sodium * qty;
    fiber += resolved.fiber * qty;
    doubt += resolved.doubt * (energy > 0 ? energyOf(item) : 1);
  }
  doubt /= energy > 0 ? energy : items.length;

  // [score 0–100, weight, reason when it helped, reason when it hurt]
  const parts: [number, number, DayReason, DayReason][] = [
    [meal.score, 40, 'qualityGood', 'qualityLow'],
    [scale(sodium, SODIUM_REFERENCE_MG, SODIUM_REFERENCE_MG * 2), 15, 'sodiumOk', 'sodiumHigh'],
  ];
  if (energy > 0) {
    const perThousand = (fiber / energy) * 1000;
    parts.push([clamp((perThousand / FIBER_PER_1000_KCAL) * 100), 10, 'fiberGood', 'fiberLow']);
  }
  if (complete && goals.cal && goals.cal > 0) {
    const off = Math.abs(energy - goals.cal) / goals.cal;
    parts.push([
      scale(off, 0.1, 0.5),
      20,
      'energyOnTarget',
      energy > goals.cal ? 'energyOver' : 'energyUnder',
    ]);
  }
  if (complete && goals.p && goals.p > 0)
    parts.push([clamp((protein / goals.p) * 100), 15, 'proteinGood', 'proteinLow']);

  const weightSum = parts.reduce((sum, [, weight]) => sum + weight, 0);
  const score = Math.round(
    parts.reduce((sum, [value, weight]) => sum + value * weight, 0) / weightSum,
  );
  const reasons = parts
    .map(([value, weight, good, bad]) => ({
      reason: value >= 70 ? good : value < 50 ? bad : null,
      impact: (Math.abs(value - 60) * weight) / weightSum,
    }))
    .filter((r): r is { reason: DayReason; impact: number } => r.reason !== null)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3)
    .map((r) => r.reason);

  return {
    score,
    grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'E',
    confidence: confidenceFromDoubt(doubt),
    reasons,
  };
}
