import { saltToSodiumMg } from './nutrients';
// English and Dutch label names (Albert Heijn, Jumbo and Lidl print Dutch tables).
const LABELS = {
  cal: /^(?:energy|calories?|energy value|energie(?:waarde)?)\b/i,
  f: /^(?:total\s+)?(?:fat|vet(?:ten)?)\b/i,
  c: /^(?:total\s+)?(?:carbohydrates?|carbs?|koolhydraten)\b/i,
  p: /^(?:proteins?|protein|eiwit(?:ten)?)\b/i,
  sugar: /^(?:(?:of\s+which|waarvan)\s+|total\s+)?(?:sugars?|suikers?)\b/i,
  fiber: /^(?:dietary\s+)?(?:fib(?:er|re)|voedingsvezels?|vezels?)\b/i,
  satFat:
    /^(?:(?:of\s+which|waarvan)\s+)?(?:saturated(?:\s+fat)?|saturates|verzadigde?(?:\s+vet(?:zuren)?)?)\b/i,
  sodium: /^(?:sodium|natrium)\b/i,
  salt: /^(?:salt|zout)\b/i,
  cholesterol: /^cholesterol\b/i,
};
const ANY_LABEL = new RegExp(
  Object.values(LABELS)
    .map((label) => label.source)
    .join('|'),
  'i',
);
const NUMBER_ONLY = /^[0-9][0-9.,]*$/; // Stored in mg; labels may print either mg or g.
const MILLIGRAM_KEYS = new Set(['sodium', 'cholesterol']);

function parseNumber(value, { thousandsDot = false } = {}) {
  const normalized = value.replace(/\s/g, '');
  if (normalized.includes(',') && normalized.includes('.'))
    // 1.036,5 (Dutch) or 1,036.5 (English): the last separator is the decimal one.
    return normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
      ? Number(normalized.replace(/\./g, '').replace(',', '.'))
      : Number(normalized.replace(/,/g, ''));
  if (normalized.includes(',')) {
    const decimals = normalized.length - normalized.lastIndexOf(',') - 1;
    return Number(decimals === 3 ? normalized.replace(/,/g, '') : normalized.replace(',', '.'));
  }
  // Dutch energy is written 1.036 kJ; grams like 16.177 g stay decimals.
  if (thousandsDot && /^\d{1,3}(?:\.\d{3})+$/.test(normalized))
    return Number(normalized.replace(/\./g, ''));
  return Number(normalized);
}

function amountBeforeUnit(value, unit) {
  const match = value.match(new RegExp(`([0-9][0-9.,]*)\\s*${unit}\\b`, 'i'));
  return match ? parseNumber(match[1], { thousandsDot: /^(?:kJ|kcal)$/i.test(unit) }) : null;
}

/**
 * Web shops often put the label and its value on separate lines with the unit in the label:
 * "Vetten (g)" then "16.177". Join those into "Vetten (g) 16.177 g" so the rest reads them.
 */
function joinSplitRows(lines) {
  const joined = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    const labelOnly = ANY_LABEL.test(line) && !/[0-9]/.test(line.replace(/\([^)]*\)/g, ''));
    if (labelOnly && next && NUMBER_ONLY.test(next)) {
      const unit = line.match(/\((kcal|kj|mg|g)\)/i)?.[1] ?? (/^energ/i.test(line) ? 'kcal' : 'g');
      joined.push(`${line} ${next} ${unit}`);
      i++;
    } else joined.push(line);
  }
  return joined;
}

function findLabelValue(lines, pattern) {
  for (const line of lines) {
    const match = line.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function parseServing(value) {
  if (!value) return null;
  const mass = value.match(/([0-9][0-9.,]*)\s*(kg|g|grams?)\b/i);
  const grams = mass ? parseNumber(mass[1]) * (/^kg$/i.test(mass[2]) ? 1000 : 1) : null;
  const serving = value
    .replace(/\s*[([][^\])]*\b[0-9][0-9.,]*\s*(?:kg|g|grams?)\b[^\])]*[)\]]/i, '')
    .trim();
  return { serving: serving || value, grams };
}

/** Parse common tabular nutrition-label text without making network or model calls. */
export function parseNutritionLabel(input) {
  let lines = String(input ?? '')
    .replace(/\u00a0/g, ' ')
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[•*-]\s*/, ''))
    .filter(Boolean);
  if (!lines.length) return null;
  lines = joinSplitRows(lines);

  // "per 100 g", "per 100 gram", "per 100 ml" (drinks are logged per 100 ml like 100 g).
  const per100g = /\bper\s*100\s*(?:g|grams?|ml)\b/i.test(input);
  const per100ml = /\bper\s*100\s*ml\b/i.test(input);
  const perServing = /\bper\s+(?:serving|portion|portie)\b/i.test(input);
  const values = {};

  for (const [key, label] of Object.entries(LABELS)) {
    const row = new RegExp(`^${label.source}\\s*[:\\t ]+(.+)$`, 'i');
    // Energy can come as two rows ("Energie (kJ)" and "Energie (kcal)"): read them together so
    // kcal wins over a kJ conversion.
    const line =
      key === 'cal'
        ? lines
            .map((text) => text.match(row)?.[1])
            .filter(Boolean)
            .join(' ') || null
        : findLabelValue(lines, row);
    if (!line) continue;

    if (key === 'cal') {
      const kcal = amountBeforeUnit(line, 'kcal');
      const kj = amountBeforeUnit(line, 'kJ');
      const calories = kcal ?? (kj === null ? null : Number((kj / 4.184).toFixed(1)));
      if (calories !== null && Number.isFinite(calories)) values.cal = calories;
      continue;
    }

    if (MILLIGRAM_KEYS.has(key)) {
      const mg = amountBeforeUnit(line, 'mg');
      const grams = mg === null ? amountBeforeUnit(line, 'g') : null;
      const amount = mg ?? (grams === null ? null : grams * 1000);
      if (amount !== null && Number.isFinite(amount)) values[key] = amount;
      continue;
    }

    const grams = amountBeforeUnit(line, 'g');
    if (grams !== null && Number.isFinite(grams)) values[key] = grams;
  }
  // European labels list salt instead of sodium.
  if (values.salt !== undefined) {
    if (values.sodium === undefined) values.sodium = saltToSodiumMg(values.salt);
    delete values.salt;
  }

  if (!Object.keys(values).length) return null;

  const explicitName = findLabelValue(lines, /^(?:name|naam|product|food)\s*[:\t ]+(.+)$/i);
  const basisIndex = lines.findIndex((line) =>
    /\bper\s*(?:100\s*(?:g|grams?|ml)|serving|portion|portie)\b/i.test(line),
  );
  const title =
    basisIndex > 0
      ? lines
          .slice(0, basisIndex)
          .find((line) => !/^(?:kind|nutrition facts?|voedingswaarden?)\b/i.test(line))
      : null;
  const name = explicitName || title;
  const servingText = findLabelValue(lines, /^(?:serving(?:\s+size)?|portion)\s*[:\t ]+(.+)$/i);
  let serving = parseServing(servingText);
  let gramsPerServing = serving?.grams ?? null;
  let scale = 1;

  if (per100g) {
    if (gramsPerServing) scale = gramsPerServing / 100;
    else {
      serving = { serving: per100ml ? '100 ml' : '100 g', grams: 100 };
      gramsPerServing = 100;
    }
  } else if (perServing && !serving) {
    serving = { serving: '1 serving', grams: null };
  }

  for (const key of Object.keys(values)) values[key] *= scale;

  return {
    name: name || undefined,
    serving: serving?.serving,
    gramsPerServing,
    values,
  };
}
