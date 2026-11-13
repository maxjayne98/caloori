import assert from 'node:assert/strict';
import test from 'node:test';
import { parseNutritionLabel } from './nutrition-label';

test('parses the pasted per-100-gram label, including supported subcategories', () => {
  const parsed = parseNutritionLabel(`Kind\tPer 100 Gram
Energy\t1,036 kJ (245 kcal)
Fat\t1.2 g
of which saturated\t0.4 g
of which unsaturated\t0.4 g
Carbohydrates\t48 g
of which sugars\t1.3 g
Dietary fiber\t4.3 g
Proteins\t8.3 g
Salty\t0.6 g`);

  assert.equal(parsed?.serving, '100 g');
  assert.equal(parsed?.gramsPerServing, 100);
  // "of which unsaturated" and "Salty" are not nutrients we track.
  assert.deepEqual(parsed?.values, {
    cal: 245,
    f: 1.2,
    c: 48,
    p: 8.3,
    sugar: 1.3,
    fiber: 4.3,
    satFat: 0.4,
  });
});

test('reads a name and scales per-100-gram nutrition to a serving weight', () => {
  const parsed = parseNutritionLabel(`Name: Seeded loaf
Serving size: 2 slices (50 g)
Kind\tPer 100 Gram
Energy\t1,036 kJ (245 kcal)
Fat\t1.2 g
Carbohydrates\t48 g
Proteins\t8.3 g`);

  assert.equal(parsed?.name, 'Seeded loaf');
  assert.equal(parsed?.serving, '2 slices');
  assert.equal(parsed?.gramsPerServing, 50);
  assert.deepEqual(parsed?.values, { cal: 122.5, f: 0.6, c: 24, p: 4.15 });
});

test('uses kilojoules when kcal is not included and handles decimal commas', () => {
  const parsed = parseNutritionLabel(`Per serving
Energy: 418.4 kJ
Fat: 1,2 g`);

  assert.deepEqual(parsed?.values, { cal: 100, f: 1.2 });
  assert.equal(parsed?.serving, '1 serving');
});

test('returns null when no supported nutrition values are present', () => {
  assert.equal(parseNutritionLabel('A bowl of soup with extra fiber'), null);
});

test('reads sodium in mg or g, converts salt to sodium, and reads cholesterol', () => {
  const us = parseNutritionLabel(`Per serving
Calories 200 kcal
Total Fat 8 g
Saturated Fat 3 g
Cholesterol 30 mg
Sodium 0.45 g
Total Carbohydrate 26 g
Total Sugars 12 g
Protein 5 g`);
  const usValues = us?.values as Record<string, number> | undefined;
  assert.equal(usValues?.cholesterol, 30);
  assert.equal(usValues?.sodium, 450);
  assert.equal(usValues?.satFat, 3);
  assert.equal(usValues?.sugar, 12);

  const eu = parseNutritionLabel(`Per 100 g
Energy 400 kcal
Fat 10 g
Carbohydrates 60 g
Protein 12 g
Salt 1.5 g`);
  assert.equal(eu?.values.sodium, 600);
  assert.equal('salt' in (eu?.values ?? {}), false);
});

test('reads a Dutch web-shop table with labels and values on separate lines', () => {
  const parsed = parseNutritionLabel(`Energie Kilocalorieën (kcal)
221
Vetten (g)
16.177
verzadigde vetzuren (g)
6.863
Koolhydraten (g)
0.202
suikers (g)
0.196
Voedingsvezel (g)
0.002
Eiwitten (g)
18.529
Zout (g)
0.328
Name Dirk Vleeschmeesters Rundergehakt`);
  const values = parsed?.values as Record<string, number>;
  assert.equal(parsed?.name, 'Dirk Vleeschmeesters Rundergehakt');
  assert.equal(values.cal, 221);
  assert.equal(values.f, 16.177);
  assert.equal(values.satFat, 6.863);
  assert.equal(values.c, 0.202);
  assert.equal(values.sugar, 0.196);
  assert.equal(values.fiber, 0.002);
  assert.equal(values.p, 18.529);
  assert.equal(Math.round(values.sodium), 131);
});

test('reads a Dutch label table with decimal commas and dotted thousands', () => {
  const parsed = parseNutritionLabel(`Voedingswaarden per 100 gram
Energie 1.036 kJ (245 kcal)
Vet 1,2 g
waarvan verzadigd 0,3 g
Koolhydraten 48 g
waarvan suikers 1,3 g
Voedingsvezel 4,3 g
Eiwitten 8,3 g
Zout 0,6 g`);
  assert.equal(parsed?.serving, '100 g');
  assert.deepEqual(parsed?.values, {
    cal: 245,
    f: 1.2,
    c: 48,
    p: 8.3,
    sugar: 1.3,
    fiber: 4.3,
    satFat: 0.3,
    sodium: 240,
  });
});

test('prefers the kcal row when energy is split over kJ and kcal rows', () => {
  const parsed = parseNutritionLabel(`Per 100 ml
Energie (kJ)
180
Energie (kcal)
42
Koolhydraten (g)
10,4`);
  const values = parsed?.values as Record<string, number>;
  assert.equal(parsed?.serving, '100 ml');
  assert.equal(values.cal, 42);
  assert.equal(values.c, 10.4);
});
