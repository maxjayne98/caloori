'use client';

import { Button } from '@nourish/ui';
import { useMemo, useState } from 'react';
import { Bookmark, Plus, X } from 'lucide-react';
import { Icon } from '@/components/icon';
import { MealPicker } from '@/components/meal-picker';
import {
  foods,
  appendDiaryEntries,
  foodLibrary,
  foodUsage,
  formatPortion,
  freshKey,
  rankFoods,
} from '@nourish/core';
import { FoodPortionEditor } from '@/features/foods/portion-editor';
import { FoodRows } from '@/features/foods/food-rows';
import { FoodSearchBar } from '@/features/foods/food-search-bar';
import { useI18n } from '@/providers/i18n-provider';
export function AddFoodSheet({
  chosen,
  meal,
  setEntries,
  day,
  profile,
  setChosen,
  setSheet,
  notify,
  setMeal,
  query,
  setQuery,
  custom,
  setQty,
  entries,
}) {
  const { t, tMeal } = useI18n();
  // Foods picked so far; added to the diary together from the bar at the bottom.
  const [basket, setBasket] = useState([]);
  const library = useMemo(() => foodLibrary(foods, custom), [custom]);
  const usage = useMemo(() => foodUsage(entries), [entries]);
  const { suggested, others } = rankFoods(library, usage, { meal, query, today: day });
  // The amount logged last time, so "the usual" is one tap (or prefilled in the editor).
  const usual = (food) => {
    const last = usage.get(food.id)?.last;
    return last ? { ...food, qty: last.qty, portion: last.portion } : { ...food, qty: 1 };
  };
  const pick = (item) => setBasket((items) => [...items, { ...item, basketKey: freshKey() }]);
  const basketCal = basket.reduce((sum, item) => sum + item.cal * (item.qty ?? 1), 0);

  // Adds the picked foods (plus an optional extra one) to the diary in one go, with Undo.
  function commit(extra) {
    const items = [...basket, ...(extra ? [extra] : [])].map(
      ({ basketKey: _key, ...item }) => item,
    );
    const before = new Set((entries[day] || []).map((item) => item.key));
    const next = appendDiaryEntries(entries, day, items, profile);
    const added = new Set(
      next[day].filter((item) => !before.has(item.key)).map((item) => item.key),
    );
    setEntries(next);
    setBasket([]);
    setSheet(null);
    const meals = new Set(items.map((item) => item.meal));
    notify(
      meals.size === 1
        ? t('add.addedCount', { count: items.length, meal: tMeal(items[0].meal) })
        : t('add.addedCountMixed', { count: items.length }),
      {
        label: t('add.undo'),
        run: () =>
          setEntries((prev) => ({
            ...prev,
            [day]: (prev[day] || []).filter((item) => !added.has(item.key)),
          })),
      },
    );
  }

  const rows = (items) => (
    <FoodRows
      items={items}
      setChosen={setChosen}
      setQty={setQty}
      setSheet={setSheet}
      onOpen={(food) => setChosen(usual(food))}
      onQuickAdd={(food) => pick({ ...usual(food), meal })}
      count={(food) => basket.filter((item) => item.id === food.id).length}
      detail={(food) => (usage.has(food.id) ? formatPortion(usual(food)) : null)}
    />
  );

  return chosen ? (
    <FoodPortionEditor
      key={'add' + chosen.id}
      // A remembered amount prefills the editor; a food never logged starts at one unit.
      food={chosen}
      initialMeal={meal}
      // Main button logs it now (with anything already picked); the second one keeps picking.
      onSave={(data) => {
        setChosen(null);
        commit({ ...chosen, qty: data.qty, meal: data.meal, portion: data.portion });
      }}
      secondaryLabel={t('add.toBasket')}
      onSecondarySave={(data) => {
        pick({ ...chosen, qty: data.qty, meal: data.meal, portion: data.portion });
        setChosen(null);
      }}
      onBack={() => setChosen(null)}
    />
  ) : (
    <>
      <FoodSearchBar
        query={query}
        setQuery={setQuery}
        start={<MealPicker value={meal} onChange={setMeal} divider={false} />}
        actions={[
          {
            key: 'meals',
            label: t('food.mealsShort'),
            icon: <Bookmark aria-hidden="true" />,
            onClick: () => setSheet('meals'),
          },
          {
            key: 'barcode',
            label: t('food.barcode'),
            icon: <Icon type="Barcode" />,
            onClick: () => setSheet('barcode'),
            accent: true,
          },
          {
            key: 'custom',
            label: t('sheet.custom'),
            icon: <Plus aria-hidden="true" />,
            onClick: () => setSheet('custom'),
            accent: true,
          },
        ]}
      />
      {suggested.length > 0 && (
        <>
          <div className="eyebrow">{t('add.suggested', { meal: tMeal(meal) })}</div>
          {rows(suggested)}
        </>
      )}
      <div className="eyebrow">{query ? t('food.searchResults') : t('add.allFoods')}</div>
      {rows(others)}
      {!suggested.length && !others.length && <div className="empty">{t('food.noMatch')}</div>}
      {basket.length > 0 && (
        // Sticky to the sheet's bottom; the list keeps scrolling underneath.
        <div
          className="sticky bottom-0 z-10 mt-3 grid gap-2 rounded-[20px] border p-2 ps-3 shadow-[0_10px_28px_color-mix(in_srgb,var(--accent)_18%,transparent)]"
          style={{
            background: 'var(--surface)',
            borderColor: 'color-mix(in srgb, var(--accent) 22%, transparent)',
          }}
        >
          {/* What is picked, tiny and scrollable sideways; × takes one out. */}
          <div
            className="-ms-1 flex gap-1 overflow-x-auto pt-0.5"
            // Inline: the global slim-scrollbar rule (unlayered) beats utilities.
            style={{ scrollbarWidth: 'none' }}
          >
            {basket.map((item) => (
              <span
                key={item.basketKey}
                className="inline-flex max-w-36 shrink-0 items-center gap-0.5 rounded-full py-0.5 ps-2 text-[11px] font-medium"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}
              >
                <span className="truncate">{item.name}</span>
                <Button
                  variant="unstyled"
                  aria-label={t('add.removePicked', { name: item.name })}
                  onClick={() =>
                    setBasket((items) => items.filter((x) => x.basketKey !== item.basketKey))
                  }
                  className="grid shrink-0 place-items-center rounded-full"
                  style={{ width: 18, height: 18, padding: 0, color: 'var(--accent-text)' }}
                >
                  <X size={11} aria-hidden="true" />
                </Button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}
              aria-hidden="true"
            >
              {basket.length}
            </span>
            <span className="grid min-w-0 flex-1 leading-tight">
              <b className="truncate text-sm font-semibold">
                {t('add.basketCount', { count: basket.length })}
              </b>
              <small className="text-xs tabular-nums" style={{ color: 'var(--neutral-85858b)' }}>
                {Math.round(basketCal)} {t('common.kcal')}
              </small>
            </span>
            <Button
              variant="unstyled"
              aria-label={t('add.clear')}
              title={t('add.clear')}
              onClick={() => setBasket([])}
              className="grid shrink-0 place-items-center rounded-full"
              // Inline: the global button reset (unlayered) would otherwise clear these.
              style={{ width: 36, height: 36, padding: 0, color: 'var(--neutral-85858b)' }}
            >
              <X size={17} aria-hidden="true" />
            </Button>
            <Button
              variant="unstyled"
              onClick={() => commit()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold active:scale-95 motion-reduce:transition-none"
              style={{
                height: 40,
                padding: '0 16px',
                fontSize: 14,
                background: 'var(--accent)',
                color: 'var(--surface)',
              }}
            >
              <Plus size={16} aria-hidden="true" />
              {t('add.addAll')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
