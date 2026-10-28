const LABELS = {
  cal: /^(?:energy|calories?|energy value)\b/i,
  f: /^(?:total\s+)?fat\b/i,
  c: /^(?:total\s+)?(?:carbohydrates?|carbs?)\b/i,
  p: /^(?:proteins?|protein)\b/i,
};

function parseNumber(value) {
  const normalized = value.replace(/\s/g, '');
  if (normalized.includes(',') && normalized.includes('.'))
    return Number(normalized.replace(/,/g, ''));
  if (normalized.includes(',')) {
    const decimals = normalized.length - normalized.lastIndexOf(',') - 1;
    return Number(decimals === 3 ? normalized.replace(/,/g, '') : normalized.replace(',', '.'));
  }
  return Number(normalized);
}

function amountBeforeUnit(value, unit) {
  const match = value.match(new RegExp(`([0-9][0-9.,]*)\\s*${unit}\\b`, 'i'));
  return match ? parseNumber(match[1]) : null;
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
  const lines = String(input ?? '')
    .replace(/\u00a0/g, ' ')
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[•*-]\s*/, ''))
    .filter(Boolean);
  if (!lines.length) return null;

  const per100g = /\bper\s*100\s*(?:g|grams?)\b/i.test(input);
  const perServing = /\bper\s+(?:serving|portion)\b/i.test(input);
  const values = {};

  for (const [key, label] of Object.entries(LABELS)) {
    const line = findLabelValue(lines, new RegExp(`^${label.source}\\s*[:\\t ]+(.+)$`, 'i'));
    if (!line) continue;

    if (key === 'cal') {
      const kcal = amountBeforeUnit(line, 'kcal');
      const kj = amountBeforeUnit(line, 'kJ');
      const calories = kcal ?? (kj === null ? null : Number((kj / 4.184).toFixed(1)));
      if (calories !== null && Number.isFinite(calories)) values.cal = calories;
      continue;
    }

    const grams = amountBeforeUnit(line, 'g');
    if (grams !== null && Number.isFinite(grams)) values[key] = grams;
  }

  if (!Object.keys(values).length) return null;

  const explicitName = findLabelValue(lines, /^(?:name|product|food)\s*[:\t ]+(.+)$/i);
  const basisIndex = lines.findIndex((line) =>
    /\bper\s*(?:100\s*(?:g|grams?)|serving|portion)\b/i.test(line),
  );
  const title =
    basisIndex > 0
      ? lines.slice(0, basisIndex).find((line) => !/^(?:kind|nutrition facts?)\b/i.test(line))
      : null;
  const name = explicitName || title;
  const servingText = findLabelValue(lines, /^(?:serving(?:\s+size)?|portion)\s*[:\t ]+(.+)$/i);
  let serving = parseServing(servingText);
  let gramsPerServing = serving?.grams ?? null;
  let scale = 1;

  if (per100g) {
    if (gramsPerServing) scale = gramsPerServing / 100;
    else {
      serving = { serving: '100 g', grams: 100 };
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
