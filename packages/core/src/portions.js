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
export function getFoodUnits(food) {
  const def = householdPortions[food.id];
  const match = String(food.serving).match(/^\s*([\d.]+)\s*g\s*$/i);
  const baseGrams = Number(food.gramsPerServing) || (match ? +match[1] : def?.grams) || null;
  const baseName = def?.base || (match ? 'serving' : String(food.serving).replace(/^1\s+/, ''));
  const units = [
    {
      id: 'serving',
      label: baseName || 'serving',
      factor: 1,
      grams: baseGrams,
      estimated: !!def?.estimatedBase,
    },
  ];
  if (baseGrams > 0)
    units.push({
      id: 'g',
      label: 'g',
      factor: 1 / baseGrams,
      grams: 1,
      estimated: !!def?.estimatedBase,
    });
  for (const [label, grams] of def?.units || [])
    units.push({
      id: label,
      label,
      factor: grams / baseGrams,
      grams,
      estimated: true,
    });
  return units;
}
export function defaultFoodUnit(food) {
  return /^\s*[\d.]+\s*g\s*$/i.test(food.serving) ? 'g' : 'serving';
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
  const unit = getFoodUnits(food).find((x) => x.id === defaultFoodUnit(food));
  return (
    portionNumber((food.qty ?? 1) / (unit?.factor || 1)) +
    ' ' +
    (unit ? portionUnitLabel(unit, (food.qty ?? 1) / (unit.factor || 1)) : 'serving')
  );
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
  if (amount <= 1 || ['g', 'small', 'medium', 'large'].includes(label)) return label;
  if (label.startsWith('cup,')) return label.replace('cup,', 'cups,');
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
    ].includes(label)
  )
    return label + 's';
  return label;
}
