import test from 'node:test';
import assert from 'node:assert/strict';
import { foodLibrary, foods, resetFoodEdit, saveFoodEdit } from './index';

type Food = { id: string; name: string; cal: number; edited?: boolean };

const catalog: Food[] = [
  { id: 'apple', name: 'Apple', cal: 95 },
  { id: 'rice', name: 'Rice', cal: 200 },
];

test('editing a catalog food overrides it in the library without touching the catalog', () => {
  const custom = saveFoodEdit<Food>([], { id: 'apple', name: 'Apple (mine)', cal: 80 }, catalog);
  assert.equal(custom[0].edited, true);
  const library = foodLibrary(catalog, custom);
  assert.deepEqual(
    library.map((f) => f.name),
    ['Apple (mine)', 'Rice'],
  );
  assert.equal(catalog[0].name, 'Apple');
  assert.deepEqual(foodLibrary(catalog, resetFoodEdit(custom, 'apple')), catalog);
});

test('own foods are edited in place and never marked as overrides', () => {
  const own: Food[] = [{ id: 'u1', name: 'Soup', cal: 150 }];
  const custom = saveFoodEdit(own, { id: 'u1', name: 'Lentil soup', cal: 170 }, catalog);
  assert.equal(custom.length, 1);
  assert.equal(custom[0].edited, undefined);
  assert.deepEqual(
    foodLibrary(catalog, custom).map((f) => f.name),
    ['Apple', 'Rice', 'Lentil soup'],
  );
});

test('the real catalog accepts an override for a built-in food', () => {
  const id = foods[0].id;
  const custom = saveFoodEdit([], { ...foods[0], name: 'Edited' }, foods);
  assert.equal(foodLibrary(foods, custom).find((f) => f.id === id)?.name, 'Edited');
  assert.equal(foodLibrary(foods, custom).length, foods.length);
});
