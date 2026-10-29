/**
 * Optional nutrients beyond calories and macros. They are stored per serving like `p`/`c`/`f`,
 * but may be missing: older entries, quick adds and many custom foods never had them.
 * A missing value is unknown, not zero, so totals report how complete they are.
 */
export const EXTRA_NUTRIENTS = [
  { key: 'sugar', unit: 'g' },
  { key: 'fiber', unit: 'g' },
  { key: 'satFat', unit: 'g' },
  { key: 'sodium', unit: 'mg' },
  { key: 'cholesterol', unit: 'mg' },
] as const;

export type ExtraNutrientKey = (typeof EXTRA_NUTRIENTS)[number]['key'];
export type ExtraNutrients = Partial<Record<ExtraNutrientKey, number>>;

export const EXTRA_NUTRIENT_KEYS = EXTRA_NUTRIENTS.map((n) => n.key) as ExtraNutrientKey[];

type WithExtras = ExtraNutrients & { id?: string; qty?: number };

function known(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/** Copies only the extra nutrients that are known, multiplied by `factor`. */
export function scaleExtraNutrients(food: ExtraNutrients, factor: number): ExtraNutrients {
  const scaled: ExtraNutrients = {};
  for (const key of EXTRA_NUTRIENT_KEYS) {
    const value = food[key];
    if (known(value)) scaled[key] = value * factor;
  }
  return scaled;
}

export interface ExtraNutrientTotal {
  /** Sum over the items that have a value. */
  amount: number;
  /** How many items had a value, out of `of`. */
  known: number;
  of: number;
}

/** Totals each extra nutrient over logged items (value × qty), tracking how many items had data. */
export function sumExtraNutrients(
  items: readonly WithExtras[],
  catalog: readonly WithExtras[] = [],
): Record<ExtraNutrientKey, ExtraNutrientTotal> {
  const totals = {} as Record<ExtraNutrientKey, ExtraNutrientTotal>;
  const catalogById = new Map(
    catalog
      .filter((food): food is WithExtras & { id: string } => Boolean(food.id))
      .map((food) => [food.id, food]),
  );
  for (const key of EXTRA_NUTRIENT_KEYS) {
    let amount = 0;
    let count = 0;
    for (const item of items) {
      const value = item[key] ?? (item.id ? catalogById.get(item.id)?.[key] : undefined);
      if (!known(value)) continue;
      amount += value * (item.qty ?? 1);
      count++;
    }
    totals[key] = { amount, known: count, of: items.length };
  }
  return totals;
}

/** Converts label salt (g) to sodium (mg); salt is about 40% sodium. */
export function saltToSodiumMg(saltGrams: number) {
  return saltGrams * 400;
}

/** Reads optional extras from form-like input: blank or invalid values stay unknown. */
export function extraNutrientsFromInput(
  input: Partial<Record<ExtraNutrientKey, unknown>>,
): ExtraNutrients {
  const extras: ExtraNutrients = {};
  for (const key of EXTRA_NUTRIENT_KEYS) {
    const raw = input[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const value = Number(raw);
    if (known(value)) extras[key] = value;
  }
  return extras;
}
