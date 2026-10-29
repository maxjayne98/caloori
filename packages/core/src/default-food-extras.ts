import type { ExtraNutrients } from './nutrients';

/**
 * Typical extra nutrients per 100 g for the built-in catalog:
 * [sugar g, fiber g, saturated fat g, sodium mg, cholesterol mg].
 * Standard foods follow common reference tables (e.g. USDA FoodData Central); regional products
 * (kashk, sangak, molasses, …) are best estimates. Values are approximate by nature.
 */
type Per100g = [sugar: number, fiber: number, satFat: number, sodium: number, cholesterol: number];

export const EXTRAS_PER_100G: Record<string, Per100g> = {
  // Original catalog (ids f0…f14)
  f0: [3.2, 0, 0.1, 36, 5], // Greek yogurt, nonfat
  f1: [10, 2.4, 0, 1, 0], // Blueberries
  f2: [20, 7, 3, 30, 0], // Granola
  f3: [2.5, 6, 1.8, 280, 0], // Avocado toast
  f4: [0, 0, 1, 74, 85], // Chicken breast, cooked
  f5: [0.4, 1.6, 0.2, 5, 0], // Brown rice, cooked
  f6: [1, 2, 0, 30, 0], // Mixed greens
  f7: [12.2, 2.6, 0.1, 1, 0], // Banana
  f8: [0, 0, 3.1, 59, 55], // Salmon
  f9: [0.4, 0, 3.1, 142, 372], // Egg
  f10: [4.4, 12.5, 3.8, 1, 0], // Almonds
  f11: [0.3, 1.7, 0.4, 4, 0], // Oatmeal, cooked
  f12: [10.4, 2.4, 0, 1, 0], // Apple
  f13: [0, 0, 13.8, 2, 0], // Olive oil
  f14: [5, 2.7, 0.6, 500, 0], // Toast, white bread

  // Regional catalog (default-foods.json)
  'lamb-shoulder-raw': [0, 0, 10.2, 65, 72],
  'ground-beef-lamb-mix-raw': [0, 0, 8.5, 67, 72],
  'beef-shank-raw': [0, 0, 5, 70, 60],
  'chicken-breast-raw': [0, 0, 0.6, 45, 73],
  'chicken-thigh-raw': [0, 0, 1.9, 95, 95],
  'egg-whole-raw': [0.4, 0, 3.1, 142, 372],
  'whitefish-trout-raw': [0, 0, 1.1, 52, 58],
  'ghee-clarified-butter': [0, 0, 62, 2, 256],
  'vegetable-sunflower-oil': [0, 0, 10, 0, 0],
  'unsalted-butter': [0.1, 0, 51, 11, 215],
  'whole-milk-yogurt': [4.7, 0, 2.1, 46, 13],
  'strained-yogurt-mast-chekideh': [3.6, 0, 3.2, 40, 15],
  'kashk-liquid-whey': [1, 0, 5, 1200, 25],
  'lighvan-feta-cheese': [4.1, 0, 14.9, 1116, 89],
  'basmati-rice-dry': [0.1, 1.3, 0.2, 5, 0],
  'reshteh-soup-noodle-dry': [2, 3, 0.3, 800, 0],
  'sangak-flatbread': [2, 5, 0.3, 500, 0],
  'barbari-flatbread': [2, 2.5, 0.3, 550, 0],
  'potato-raw': [0.8, 2.1, 0, 6, 0],
  'yellow-split-peas-dry': [8, 25.5, 0.2, 15, 0],
  'red-kidney-beans-dry': [2.2, 15.2, 0.1, 12, 0],
  'pinto-beans-dry': [2.1, 15.5, 0.2, 12, 0],
  'brown-lentils-dry': [2, 10.7, 0.2, 6, 0],
  'chickpeas-dry': [10.7, 12.2, 0.6, 24, 0],
  'mung-beans-dry': [6.6, 16.3, 0.3, 15, 0],
  'yellow-onion-raw': [4.2, 1.7, 0, 4, 0],
  'eggplant-raw': [3.5, 3, 0, 2, 0],
  'zucchini-raw': [2.5, 1, 0.1, 8, 0],
  'green-beans-raw': [3.3, 2.7, 0, 6, 0],
  'tomato-raw': [2.6, 1.2, 0, 5, 0],
  'tomato-paste': [12.2, 4.1, 0, 300, 0],
  'garlic-raw': [1, 2.1, 0.1, 17, 0],
  'pumpkin-raw': [2.8, 0.5, 0.1, 1, 0],
  'english-walnuts': [2.6, 6.7, 6.1, 2, 0],
  'barberries-zereshk-dried': [45, 8, 0.4, 10, 0],
  'pistachio-slivers': [7.7, 10.6, 5.9, 1, 0],
  'almond-slivers': [4.4, 12.5, 3.8, 1, 0],
  'dried-prunes-aloo-bokhara': [38, 7.1, 0, 2, 0],
  'dried-apricots-gheysi': [53, 7.3, 0, 10, 0],
  'pomegranate-paste-molasses': [55, 0.5, 0, 20, 0],
  'dried-figs': [48, 9.8, 0.1, 10, 0],
  'granulated-sugar': [100, 0, 0, 1, 0],
  'grape-molasses-sireh-angoor': [65, 0, 0, 20, 0],
  'date-molasses-sireh-khorma': [60, 0.5, 0, 10, 0],
  'mazafati-dates': [66, 6.7, 0, 1, 0],
};

/** Catalog foods made of fruit, vegetables, legumes or nuts (Nutri-Score "fruit/veg" share). */
export const FRUIT_VEG_IDS = new Set([
  'f1',
  'f6',
  'f7',
  'f10',
  'f12',
  'potato-raw',
  'yellow-split-peas-dry',
  'red-kidney-beans-dry',
  'pinto-beans-dry',
  'brown-lentils-dry',
  'chickpeas-dry',
  'mung-beans-dry',
  'yellow-onion-raw',
  'eggplant-raw',
  'zucchini-raw',
  'green-beans-raw',
  'tomato-raw',
  'tomato-paste',
  'garlic-raw',
  'pumpkin-raw',
  'english-walnuts',
  'barberries-zereshk-dried',
  'pistachio-slivers',
  'almond-slivers',
  'dried-prunes-aloo-bokhara',
  'dried-apricots-gheysi',
  'dried-figs',
  'mazafati-dates',
]);

/** Cooking ingredients: fine to log, but not something to suggest eating on its own. */
export const INGREDIENT_IDS = new Set([
  'lamb-shoulder-raw',
  'ground-beef-lamb-mix-raw',
  'beef-shank-raw',
  'chicken-breast-raw',
  'chicken-thigh-raw',
  'whitefish-trout-raw',
  'egg-whole-raw',
  'ghee-clarified-butter',
  'vegetable-sunflower-oil',
  'unsalted-butter',
  'kashk-liquid-whey',
  'basmati-rice-dry',
  'reshteh-soup-noodle-dry',
  'potato-raw',
  'yellow-split-peas-dry',
  'red-kidney-beans-dry',
  'pinto-beans-dry',
  'brown-lentils-dry',
  'chickpeas-dry',
  'mung-beans-dry',
  'yellow-onion-raw',
  'eggplant-raw',
  'green-beans-raw',
  'tomato-paste',
  'garlic-raw',
  'pumpkin-raw',
  'barberries-zereshk-dried',
  'pomegranate-paste-molasses',
  'granulated-sugar',
  'grape-molasses-sireh-angoor',
  'date-molasses-sireh-khorma',
  'f13',
]);

/** Serving weights for original foods that have no `gramsPerServing`. */
export const ORIGINAL_SERVING_GRAMS: Record<string, number> = {
  f0: 170,
  f1: 100,
  f2: 40,
  f3: 120,
  f4: 100,
  f5: 150,
  f6: 100,
  f7: 118,
  f8: 100,
  f9: 50,
  f10: 28,
  f11: 234,
  f12: 182,
  f13: 13.5,
  f14: 30,
};

/** Per-serving extras for a catalog food, rounded sensibly; empty when unknown. */
export function catalogExtras(
  id: string,
  gramsPerServing?: number | null,
): ExtraNutrients & { fruitVeg?: number; referenceGrams?: number; ingredient?: boolean } {
  const fruitVeg = {
    ...(INGREDIENT_IDS.has(id) ? { ingredient: true } : {}),
    ...(FRUIT_VEG_IDS.has(id) ? { fruitVeg: 100 } : {}),
    ...(!gramsPerServing && ORIGINAL_SERVING_GRAMS[id]
      ? { referenceGrams: ORIGINAL_SERVING_GRAMS[id] }
      : {}),
  };
  const per100 = EXTRAS_PER_100G[id];
  const grams = gramsPerServing ?? ORIGINAL_SERVING_GRAMS[id];
  if (!per100 || !grams) return fruitVeg;
  const factor = grams / 100;
  const [sugar, fiber, satFat, sodium, cholesterol] = per100.map((v) => v * factor);
  const round = (v: number, digits: number) => Math.round(v * 10 ** digits) / 10 ** digits;
  return {
    ...fruitVeg,
    sugar: round(sugar, 1),
    fiber: round(fiber, 1),
    satFat: round(satFat, 1),
    sodium: round(sodium, 0),
    cholesterol: round(cholesterol, 0),
  };
}
