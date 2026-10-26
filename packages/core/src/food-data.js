import additionalFoods from './default-foods.json';

const originalFoods = [
  ['Greek yogurt', '170 g', 100, 17, 6, 0, '🥣'],
  ['Blueberries', '100 g', 57, 1, 14, 0, '🫐'],
  ['Granola', '40 g', 180, 4, 26, 7, '🌾'],
  ['Avocado toast', '1 slice', 230, 7, 24, 13, '🥑'],
  ['Chicken breast', '100 g', 165, 31, 0, 4, '🍗'],
  ['Brown rice', '150 g', 185, 4, 39, 2, '🍚'],
  ['Mixed greens', '100 g', 25, 2, 4, 0, '🥬'],
  ['Banana', '1 medium', 105, 1, 27, 0, '🍌'],
  ['Salmon', '100 g', 208, 20, 0, 13, '🐟'],
  ['Egg', '1 large', 72, 6, 0, 5, '🥚'],
  ['Almonds', '28 g', 164, 6, 6, 14, '🌰'],
  ['Oatmeal', '1 cup', 154, 6, 27, 3, '🥣'],
  ['Apple', '1 medium', 95, 0, 25, 0, '🍎'],
  ['Olive oil', '1 tbsp', 119, 0, 0, 14, '🫒'],
  ['Toast', '1 slice', 80, 3, 15, 1, ''],
].map((a, i) => ({
  id: 'f' + i,
  name: a[0],
  serving: a[1],
  cal: a[2],
  p: a[3],
  c: a[4],
  f: a[5],
  emoji: a[6],
}));
// Shared catalog: available to every account, without copying into private user records.
export const foods = [...originalFoods, ...additionalFoods];
export const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
