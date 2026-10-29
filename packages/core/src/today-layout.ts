/** Rearrangeable sections of the Today page, in their default order. */
export const TODAY_SECTIONS = ['greeting', 'days', 'summary', 'meals', 'activity'] as const;
export type TodaySectionId = (typeof TODAY_SECTIONS)[number];

export interface TodaySection {
  id: TodaySectionId;
  hidden: boolean;
}

/**
 * Turns a saved layout into a complete one: unknown ids are dropped, duplicates ignored, and
 * sections added in later versions appear at their default position so nobody loses them.
 */
export function normalizeTodayLayout(
  saved?: readonly { id: string; hidden?: boolean }[] | null,
): TodaySection[] {
  const known = new Set<string>(TODAY_SECTIONS);
  const seen = new Set<string>();
  const layout: TodaySection[] = [];
  for (const entry of saved ?? []) {
    if (!known.has(entry.id) || seen.has(entry.id)) continue;
    seen.add(entry.id);
    layout.push({ id: entry.id as TodaySectionId, hidden: !!entry.hidden });
  }
  TODAY_SECTIONS.forEach((id, index) => {
    if (!seen.has(id)) layout.splice(Math.min(index, layout.length), 0, { id, hidden: false });
  });
  return layout;
}

/** Moves a section one step up (−1) or down (+1); out-of-range moves are ignored. */
export function moveTodaySection(
  layout: readonly TodaySection[],
  id: TodaySectionId,
  step: -1 | 1,
): TodaySection[] {
  const from = layout.findIndex((section) => section.id === id);
  const to = from + step;
  if (from < 0 || to < 0 || to >= layout.length) return [...layout];
  const next = [...layout];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function toggleTodaySection(
  layout: readonly TodaySection[],
  id: TodaySectionId,
): TodaySection[] {
  return layout.map((section) =>
    section.id === id ? { ...section, hidden: !section.hidden } : section,
  );
}
