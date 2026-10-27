import test from 'node:test';
import assert from 'node:assert/strict';
import { rememberScannedFood, barcodeProductToFood } from './index';
test('scanned foods join the library without creating diary entries or barcode duplicates', () => {
  const scanned = barcodeProductToFood(
    {
      product_name: 'Packaged food',
      nutriments: {
        'energy-kcal_100g': 100,
        proteins_100g: 5,
        carbohydrates_100g: 10,
        fat_100g: 4,
      },
    },
    '3017620422003',
  );
  const library = rememberScannedFood([], scanned);
  assert.equal(library.length, 1);
  assert.equal(library[0].barcode, '3017620422003');
  assert.equal('meal' in library[0], false);
  library[0].name = 'My edited product';
  assert.equal(rememberScannedFood(library, scanned), library);
  assert.equal(library[0].name, 'My edited product');
});
