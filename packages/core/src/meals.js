import { portionNumber, getFoodUnits, fractionDisplay } from './portions';
export function freshKey() {
  return globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random();
}
export function scaleMealItem(item, factor) {
  const portion = item.portion
    ? {
        ...item.portion,
        amount: item.portion.amount * factor,
      }
    : null;
  if (portion) {
    const unit = getFoodUnits(item).find((u) => u.id === portion.unit);
    portion.text =
      (portion.mode === 'fraction'
        ? fractionDisplay(portion.amount)
        : portionNumber(portion.amount)) +
      ' ' +
      (unit?.label || 'serving');
  }
  return {
    ...item,
    qty: (item.qty ?? 1) * factor,
    ...(portion
      ? {
          portion,
        }
      : {}),
    key: freshKey(),
  };
}
export function sumMealItems(items) {
  return items.reduce(
    (s, x) => ({
      cal: s.cal + x.cal * x.qty,
      p: s.p + x.p * x.qty,
      c: s.c + x.c * x.qty,
      f: s.f + x.f * x.qty,
    }),
    {
      cal: 0,
      p: 0,
      c: 0,
      f: 0,
    },
  );
}
export function reusableItems(template) {
  return template.items?.length
    ? template.items
    : [
        {
          ...template,
          qty: 1,
          portion: undefined,
          key: freshKey(),
        },
      ];
}
export function appendDiaryEntries(previous, day, items, profile) {
  const loggedAt = new Date().toISOString();
  return {
    ...previous,
    [day]: [
      ...(previous[day] || []),
      ...items.map((item) => ({
        ...item,
        key: freshKey(),
        goalAtLog:
          profile.cal > 0
            ? {
                cal: +profile.cal,
                p: +profile.p,
                c: +profile.c,
                f: +profile.f,
              }
            : undefined,
        loggedAt,
      })),
    ],
  };
}
export function savedDayGoal(items) {
  if (
    !items.length ||
    items.some((x) => !Number.isFinite(+x.goalAtLog?.cal) || +x.goalAtLog.cal <= 0)
  )
    return null;
  return +items.reduce(
    (latest, x) => ((x.loggedAt || '') >= (latest.loggedAt || '') ? x : latest),
    items[0],
  ).goalAtLog.cal;
}
