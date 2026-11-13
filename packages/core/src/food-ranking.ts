/**
 * How the add-food list is ordered and searched. Everything comes from the diary itself: which
 * foods were logged, how often, at which meal and in what amount. Pure, no storage of its own.
 */
interface LoggedEntry {
  id?: string;
  meal?: string;
  qty?: number;
  portion?: unknown;
  loggedAt?: string;
}
interface RankableFood {
  id: string;
  name: string;
  brand?: string;
}

export interface FoodUsage {
  count: number;
  /** Logs at each meal ("Breakfast" → 12). */
  meals: Record<string, number>;
  /** Diary day of the most recent log (YYYY-MM-DD). */
  lastDay: string;
  /** The amount logged last time, to prefill the next one. */
  last: { qty: number; portion?: unknown };
}

/** Usage per food id over the whole diary; later days and later entries win for `last`. */
export function foodUsage(
  entries: Record<string, readonly LoggedEntry[]> | null | undefined,
): Map<string, FoodUsage> {
  const usage = new Map<string, FoodUsage>();
  for (const day of Object.keys(entries ?? {}).sort()) {
    for (const entry of entries![day] ?? []) {
      if (!entry?.id) continue;
      const current = usage.get(entry.id) ?? {
        count: 0,
        meals: {},
        lastDay: day,
        last: { qty: 1 },
      };
      current.count++;
      if (entry.meal) current.meals[entry.meal] = (current.meals[entry.meal] ?? 0) + 1;
      current.lastDay = day;
      current.last = { qty: entry.qty ?? 1, portion: entry.portion };
      usage.set(entry.id, current);
    }
  }
  return usage;
}

/** Lowercase without accents, so "creme" finds "Crème fraîche". */
export function normalizeSearch(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Every word of the query appears somewhere in the name or brand, in any order. */
export function matchesFoodQuery(food: RankableFood, query: string) {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalizeSearch(`${food.name} ${food.brand ?? ''}`);
  return words.every((word) => haystack.includes(word));
}

function daysBetween(from: string, to: string) {
  return Math.max(0, (Date.parse(to) - Date.parse(from)) / 86_400_000);
}

/**
 * How likely the food is wanted now: logs at this meal count most, any log counts, and recent
 * use adds a bonus that fades over about two weeks.
 */
export function usageScore(usage: FoodUsage | undefined, meal: string, today: string) {
  if (!usage) return 0;
  const recency = Math.max(0, 1 - daysBetween(usage.lastDay, today) / 14);
  return (usage.meals[meal] ?? 0) * 3 + usage.count + recency * 4;
}

/**
 * The add-food list. Without a query: foods you use (best first) as `suggested`, then the rest
 * alphabetically. With a query: matches only, used foods and name-start matches first.
 */
export function rankFoods<F extends RankableFood>(
  library: readonly F[],
  usage: Map<string, FoodUsage>,
  {
    meal,
    query = '',
    today,
    limit = 8,
  }: { meal: string; query?: string; today: string; limit?: number },
): { suggested: F[]; others: F[] } {
  const score = (food: F) => usageScore(usage.get(food.id), meal, today);
  const byName = (a: F, b: F) => a.name.localeCompare(b.name);
  if (normalizeSearch(query)) {
    const q = normalizeSearch(query);
    const starts = (food: F) => (normalizeSearch(food.name).startsWith(q) ? 2 : 0);
    const matches = library
      .filter((food) => matchesFoodQuery(food, query))
      .sort((a, b) => score(b) + starts(b) - (score(a) + starts(a)) || byName(a, b));
    return { suggested: [], others: matches };
  }
  const used = library.filter((food) => usage.has(food.id)).sort((a, b) => score(b) - score(a));
  const suggested = used.slice(0, limit);
  const picked = new Set(suggested.map((food) => food.id));
  return { suggested, others: library.filter((food) => !picked.has(food.id)).sort(byName) };
}
