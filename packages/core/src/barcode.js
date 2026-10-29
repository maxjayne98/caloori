import { saltToSodiumMg } from './nutrients';
export function barcodeIsValid(input) {
  if (!/^\d{8}$|^\d{12,14}$/.test(input)) return false;
  let total = 0;
  for (let i = input.length - 2, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3)
    total += Number(input[i]) * weight;
  return (10 - (total % 10)) % 10 === Number(input.at(-1));
}
export function barcodeProductToFood(product, code) {
  const n = product?.nutriments,
    cal =
      n?.['energy-kcal_100g'] ??
      ((n?.['energy-kj_100g'] ?? n?.energy_100g) !== undefined
        ? (n['energy-kj_100g'] ?? n.energy_100g) / 4.184
        : undefined);
  if (cal === undefined || !Number.isFinite(+cal) || +cal < 0)
    throw Error('Nutrition information is missing for this product.');
  for (const field of ['proteins_100g', 'carbohydrates_100g', 'fat_100g'])
    if (
      n[field] === undefined ||
      n[field] === null ||
      n[field] === '' ||
      !Number.isFinite(+n[field]) ||
      +n[field] < 0
    )
      throw Error(
        'This product has incomplete macro information. Create it from its nutrition label.',
      );
  const basis = product.quantity || '';
  return {
    id: 'b' + code,
    name: product.product_name || product.generic_name || 'Packaged food',
    brand: product.brands || '',
    serving: '100 g',
    gramsPerServing: 100,
    cal: +cal,
    p: Math.max(0, +n.proteins_100g || 0),
    c: Math.max(0, +n.carbohydrates_100g || 0),
    f: Math.max(0, +n.fat_100g || 0),
    ...offExtras(n),
    barcode: code,
    productSize: basis,
  };
}

// Open Food Facts reports these per 100 g in grams; sodium and cholesterol become mg.
function offExtras(n) {
  const grams = (value) => (value === undefined || value === '' ? undefined : +value);
  const extras = {
    sugar: grams(n.sugars_100g),
    fiber: grams(n.fiber_100g),
    satFat: grams(n['saturated-fat_100g']),
    sodium:
      grams(n.sodium_100g) !== undefined
        ? grams(n.sodium_100g) * 1000
        : grams(n.salt_100g) !== undefined
          ? saltToSodiumMg(grams(n.salt_100g))
          : undefined,
    cholesterol:
      grams(n.cholesterol_100g) !== undefined ? grams(n.cholesterol_100g) * 1000 : undefined,
  };
  return Object.fromEntries(Object.entries(extras).filter(([, v]) => Number.isFinite(v) && v >= 0));
}

/** Re-scanning a known barcode preserves the user's existing food and its edits. */
export function rememberScannedFood(foods, food) {
  return foods.some(
    (entry) => entry.id === food.id || (food.barcode && entry.barcode === food.barcode),
  )
    ? foods
    : [...foods, food];
}
