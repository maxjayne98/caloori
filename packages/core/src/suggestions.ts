import type { ScorableFood } from './food-score';
import { scoreDay } from './meal-score';

type CandidateFood = ScorableFood & {
  id: string;
  name: string;
  saved?: boolean;
  recipe?: boolean;
  /** Cooking ingredient (dry legumes, raw meat, oil…): never suggested on its own. */
  ingredient?: boolean;
};
type LoggedItem = ScorableFood & { qty?: number; id?: string };

export interface Suggestion<F extends CandidateFood = CandidateFood> {
  food: F;
  /** Servings to log (the food's own serving × qty). */
  qty: number;
  /** Day score now and after adding this, as Today shows it for an ongoing day. */
  before: number;
  after: number;
}

// Realistic amounts only: one serving or one and a half, never 40 g of cabbage.
const PORTIONS = [1, 1.5];
// Foods the user already eats get a small edge so suggestions stay practical.
const FAMILIAR_BONUS = 1.5;

/**
 * Picks the foods that raise today's score the most, within the calories still left.
 * Scores use the ongoing-day view (food quality, sodium, fiber), so suggestions improve what
 * you eat instead of just filling the calorie gap; the calorie room keeps them within goal.
 */
export function suggestFoods<F extends CandidateFood>(
  items: readonly LoggedItem[],
  library: readonly F[],
  goals: { cal?: number | null; p?: number | null },
  { recentIds = [], limit = 3 }: { recentIds?: readonly string[]; limit?: number } = {},
): Suggestion<F>[] {
  const eaten = items.reduce((sum, item) => sum + item.cal * (item.qty ?? 1), 0);
  const goal = goals.cal && goals.cal > 0 ? goals.cal : 2000;
  // Leave a little slack: a suggestion should not push the day over its goal.
  const room = goal * 1.05 - eaten;
  if (room < 50) return [];
  const base = scoreDay(items, goals, { complete: false })?.score ?? 0;
  const familiar = new Set(recentIds);

  const best = new Map<string, Suggestion<F> & { rank: number }>();
  for (const food of library) {
    if (food.saved || food.ingredient || !(food.cal > 0)) continue;
    for (const qty of PORTIONS) {
      if (food.cal * qty > room) continue;
      const after = scoreDay([...items, { ...food, qty }], goals, { complete: false })?.score ?? 0;
      if (after <= base) continue;
      // Gain per calorie spent (softened by a square root): a fruit that adds 8 points beats
      // a big plate that adds 10, so suggestions improve quality rather than just volume.
      const cost = Math.sqrt(Math.max(food.cal * qty, 50) / 100);
      const rank = (after - base) / cost + (familiar.has(food.id) ? FAMILIAR_BONUS : 0);
      const current = best.get(food.id);
      if (!current || rank > current.rank)
        best.set(food.id, { food, qty, before: base, after, rank });
    }
  }
  return [...best.values()]
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
    .map(({ rank: _rank, ...suggestion }) => suggestion);
}

/** Text handed to the assistant so it starts from the same picture the app shows. */
export function suggestionPrompt({
  score,
  reasons,
  remaining,
  eatenNames,
}: {
  score: number;
  reasons: readonly string[];
  remaining: number;
  eatenNames: readonly string[];
}) {
  return [
    `My day score is ${score}/100.`,
    reasons.length ? `Main factors: ${reasons.join(', ')}.` : '',
    `I have about ${Math.max(0, Math.round(remaining))} kcal left.`,
    eatenNames.length ? `So far I ate: ${eatenNames.join(', ')}.` : '',
    'What should I eat next to improve my score?',
  ]
    .filter(Boolean)
    .join(' ');
}
