/**
 * Data for the Energy gauges card: a dial of equal segments, each filled in the color of the meal
 * whose calories fill it, and a target band around each macro goal. Pure, no styling.
 */
const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;

interface LoggedItem {
  cal: number;
  qty?: number;
  meal?: string;
}

/**
 * Splits the day's goal into `count` equal segments and fills them in meal order (breakfast first).
 * A segment belongs to the meal that covers its middle, so a 50 kcal snack does not claim a whole
 * 100 kcal segment. Calories past the goal are reported separately as `overKcal`.
 */
export function mealSegments(
  items: readonly LoggedItem[],
  goal: number,
  count = 20,
): { segments: (string | null)[]; overKcal: number } {
  if (!(goal > 0) || count < 1)
    return { segments: Array(Math.max(count, 0)).fill(null), overKcal: 0 };
  const perMeal = MEAL_ORDER.map((meal) =>
    items
      .filter((item) => (item.meal ?? 'Snacks') === meal)
      .reduce((sum, item) => sum + (item.cal || 0) * (item.qty ?? 1), 0),
  );
  const total = perMeal.reduce((a, b) => a + b, 0);
  const size = goal / count;
  const segments: (string | null)[] = [];
  for (let i = 0; i < count; i++) {
    const middle = (i + 0.5) * size;
    let running = 0;
    let owner: string | null = null;
    for (let m = 0; m < MEAL_ORDER.length; m++) {
      running += perMeal[m];
      if (middle <= running) {
        owner = MEAL_ORDER[m];
        break;
      }
    }
    segments.push(owner);
  }
  return { segments, overKcal: Math.max(0, total - goal) };
}

/** The "on target" band drawn around a macro goal: within 10% either side. */
export function macroTargetBand(goal: number) {
  return goal > 0 ? { low: goal * 0.9, high: goal * 1.1 } : null;
}

/**
 * Splits the day's goal into `count` segments and fills them by where the eaten calories came
 * from: protein and carbs at 4 kcal/g, fat at 9 kcal/g, scaled to the day's logged calories (labels
 * rarely add up exactly). Segments go protein, then carbs, then fat; a segment belongs to the macro
 * covering its middle. Calories past the goal are returned as `overKcal`.
 */
export function macroSegments(
  totals: { cal: number; p: number; c: number; f: number },
  goal: number,
  count = 24,
): { segments: ('p' | 'c' | 'f' | null)[]; overKcal: number } {
  const empty = Array<'p' | 'c' | 'f' | null>(Math.max(count, 0)).fill(null);
  if (!(goal > 0) || count < 1) return { segments: empty, overKcal: 0 };
  const raw = { p: (totals.p || 0) * 4, c: (totals.c || 0) * 4, f: (totals.f || 0) * 9 };
  const rawSum = raw.p + raw.c + raw.f;
  const cal = totals.cal || 0;
  if (!(rawSum > 0) || !(cal > 0)) return { segments: empty, overKcal: Math.max(0, cal - goal) };
  const scale = cal / rawSum;
  const order = ['p', 'c', 'f'] as const;
  const size = goal / count;
  const segments = empty.map((_, i) => {
    const middle = (i + 0.5) * size;
    let running = 0;
    for (const macro of order) {
      running += raw[macro] * scale;
      if (middle <= running) return macro;
    }
    return null;
  });
  return { segments, overKcal: Math.max(0, cal - goal) };
}
