import { scaleExtraNutrients } from './nutrients';
export const householdPortions = {
  f0: {
    grams: 170,
    units: [
      ['cup', 245],
      ['tablespoon', 15],
    ],
  },
  f1: {
    grams: 100,
    units: [
      ['cup', 148],
      ['tablespoon', 9.25],
    ],
  },
  f2: {
    grams: 40,
    units: [
      ['cup', 120],
      ['tablespoon', 7.5],
    ],
  },
  f3: {
    grams: 65,
    estimatedBase: true,
    base: 'slice',
    units: [],
  },
  f4: {
    grams: 100,
    units: [['piece', 120]],
  },
  f5: {
    grams: 150,
    units: [
      ['cup', 195],
      ['tablespoon', 12.1875],
    ],
  },
  f6: {
    grams: 100,
    units: [['cup', 30]],
  },
  f7: {
    grams: 118,
    estimatedBase: true,
    base: 'medium',
    units: [
      ['small', 101],
      ['large', 136],
      ['slice', 6],
      ['cup, sliced', 150],
      ['cup, mashed', 225],
    ],
  },
  f8: {
    grams: 100,
    units: [['fillet', 170]],
  },
  f9: {
    grams: 50,
    estimatedBase: true,
    base: 'large egg',
    units: [
      ['medium egg', 44],
      ['small egg', 38],
    ],
  },
  f10: {
    grams: 28,
    units: [
      ['almond', 1.2],
      ['cup', 143],
    ],
  },
  f11: {
    grams: 234,
    estimatedBase: true,
    base: 'cup',
    units: [['tablespoon', 14.625]],
  },
  f12: {
    grams: 182,
    estimatedBase: true,
    base: 'medium',
    units: [
      ['small', 149],
      ['large', 223],
      ['slice', 23],
      ['cup, sliced', 109],
    ],
  },
  f13: {
    grams: 13.5,
    estimatedBase: true,
    base: 'tablespoon',
    units: [['teaspoon', 4.5]],
  },
  f14: {
    grams: 32,
    estimatedBase: true,
    base: 'slice',
    units: [],
  },
};
export function portionNumber(n) {
  return Number(n).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
}
/** Rounds a converted amount so the editor shows 33.33 instead of 33.333333333333336. */
export function roundAmount(n) {
  return Math.round(Number(n) * 1000) / 1000;
}
/**
 * Reads what a food's nutrition values are measured per. "100 g" / "250 ml" are measures;
 * anything else is a named serving ("1 tbsp (20 g)" → "tbsp", 20 g), with an optional weight.
 */
export function parseServing(serving, gramsPerServing) {
  const text = String(serving ?? '').trim();
  const measure = text.match(/^([\d.]+)\s*(g|ml)$/i);
  if (measure && +measure[1] > 0)
    return { kind: measure[2].toLowerCase(), amount: +measure[1], label: '', grams: +measure[1] };
  const inner = text.match(/\(\s*([\d.]+)\s*(g|ml)\s*\)/i);
  const label =
    text
      .replace(/\([^)]*\)/g, '')
      .replace(/^\s*1\s+/, '')
      .trim() || 'serving';
  return {
    kind: 'serving',
    amount: 1,
    label,
    grams: Number(gramsPerServing) || (inner ? +inner[1] : null),
    measure: inner ? inner[2].toLowerCase() : 'g',
  };
}
export function getFoodUnits(food) {
  // Household estimates belong to the catalog serving; a personal edit may have changed it.
  const def = food.edited ? undefined : householdPortions[food.id];
  const parsed = parseServing(food.serving, food.gramsPerServing);
  const isMeasure = parsed.kind !== 'serving';
  const measure = isMeasure ? parsed.kind : parsed.measure;
  const baseGrams = (isMeasure ? parsed.grams : parsed.grams || def?.grams) || null;
  const estimated = !!def?.estimatedBase;
  const units = [
    {
      id: 'serving',
      label: def?.base || (isMeasure ? portionNumber(parsed.amount) + ' ' + measure : parsed.label),
      factor: 1,
      grams: baseGrams,
      estimated,
      // "1 × 100 g" is never a useful choice; kept only so older entries still resolve.
      hidden: isMeasure,
    },
  ];
  if (baseGrams > 0)
    units.push({ id: 'g', label: measure, factor: 1 / baseGrams, grams: 1, estimated });
  for (const unit of food.units || [])
    if (unit?.name && unit.grams > 0 && baseGrams > 0)
      units.push({
        id: 'u:' + unit.name,
        label: unit.name,
        factor: unit.grams / baseGrams,
        grams: unit.grams,
        estimated: false,
        custom: true,
      });
  if (baseGrams > 0)
    for (const [label, grams] of def?.units || [])
      units.push({ id: label, label, factor: grams / baseGrams, grams, estimated: true });
  return units;
}
export function defaultFoodUnit(food) {
  const units = getFoodUnits(food);
  // A food with its own unit ("block", "can") is most often logged in that unit.
  return units.find((unit) => unit.custom)?.id || (units[0].hidden ? 'g' : 'serving');
}
export function formatPortion(food) {
  if (food.portion) {
    const unit = getFoodUnits(food).find((x) => x.id === food.portion.unit);
    if (unit)
      return (
        (food.portion.mode === 'fraction'
          ? fractionDisplay(food.portion.amount)
          : portionNumber(food.portion.amount)) +
        ' ' +
        portionUnitLabel(unit, food.portion.amount)
      );
    if (food.portion.text) return food.portion.text;
  }
  const units = getFoodUnits(food);
  const unit = units.find((x) => x.id === (units[0].hidden ? 'g' : 'serving'));
  const amount = roundAmount((food.qty ?? 1) / (unit?.factor || 1));
  return portionNumber(amount) + ' ' + (unit ? portionUnitLabel(unit, amount) : 'serving');
}
export function calculatePortion(food, amount, unitId, gramOverride) {
  let units = getFoodUnits(food),
    unit = units.find((x) => x.id === unitId) || units[0];
  let factor = unit.factor;
  // If a user supplies their own weight for an estimated household measure, use it instead.
  if (gramOverride > 0 && unitId !== 'g' && unit.estimated) {
    const gram = units.find((x) => x.id === 'g');
    if (gram) factor = gramOverride * gram.factor;
  }
  const qty = amount * factor;
  return {
    qty,
    cal: food.cal * qty,
    p: food.p * qty,
    c: food.c * qty,
    f: food.f * qty,
    ...scaleExtraNutrients(food, qty),
  };
}
export const fractionOptions = [
  ['0', '—'],
  ['0.125', '⅛'],
  ['0.25', '¼'],
  [String(1 / 3), '⅓'],
  ['0.5', '½'],
  [String(2 / 3), '⅔'],
  ['0.75', '¾'],
  ['0.875', '⅞'],
];
export function fractionDisplay(amount) {
  const whole = Math.floor(amount),
    remainder = amount - whole;
  let option = fractionOptions.find(([v]) => Math.abs(+v - remainder) < 1e-8);
  if (!option) return portionNumber(amount);
  return (whole ? String(whole) : '') + (+option[0] ? (whole ? ' ' : '') + option[1] : '') || '0';
}
export function portionUnitLabel(unit, amount) {
  let label = unit.label;
  if (amount <= 1 || ['g', 'ml', 'small', 'medium', 'large'].includes(label)) return label;
  if (label.startsWith('cup,')) return label.replace('cup,', 'cups,');
  if (unit.custom) return label;
  if (
    [
      'serving',
      'slice',
      'cup',
      'tablespoon',
      'teaspoon',
      'almond',
      'piece',
      'fillet',
      'large egg',
      'medium egg',
      'small egg',
      'tbsp',
      'tsp',
      'date',
    ].includes(label)
  )
    return label + 's';
  return label;
}
