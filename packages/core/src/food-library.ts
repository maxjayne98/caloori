/**
 * Personal edits of shared catalog foods. The catalog stays the same for everyone; an edit is a
 * copy in the user's own `custom` list with the catalog id and `edited: true`, shown instead of
 * the original. Already logged entries keep their own values and are not changed.
 */
interface LibraryFood {
  id: string;
  edited?: boolean;
}

/** Catalog with personal edits applied, followed by the user's own foods. */
export function foodLibrary<F extends LibraryFood>(
  catalog: readonly F[],
  custom: readonly F[],
): F[] {
  const edits = new Map(custom.filter((food) => food.edited).map((food) => [food.id, food]));
  const catalogIds = new Set(catalog.map((food) => food.id));
  return [
    ...catalog.map((food) => edits.get(food.id) ?? food),
    ...custom.filter((food) => !(food.edited && catalogIds.has(food.id))),
  ];
}

export function isCatalogFood(id: string, catalog: readonly LibraryFood[]) {
  return catalog.some((food) => food.id === id);
}

/** Saves an edited food: catalog foods become a personal override, own foods are replaced. */
export function saveFoodEdit<F extends LibraryFood>(
  custom: readonly F[],
  food: F,
  catalog: readonly LibraryFood[],
): F[] {
  const entry = isCatalogFood(food.id, catalog) ? { ...food, edited: true } : food;
  const index = custom.findIndex((item) => item.id === food.id);
  if (index < 0) return [...custom, entry];
  const next = [...custom];
  next[index] = entry;
  return next;
}

/** Removes a personal override so the shared catalog version shows again. */
export function resetFoodEdit<F extends LibraryFood>(custom: readonly F[], id: string): F[] {
  return custom.filter((food) => !(food.id === id && food.edited));
}
