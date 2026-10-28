'use client';

import { Button, Input } from '@nourish/ui';
import { foods, meals, appendDiaryEntries } from '@nourish/core';
import { FoodPortionEditor } from '@/features/foods/portion-editor';
import { FoodRows } from '@/features/foods/food-rows';
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
}) {
  const { t, tMeal } = useI18n();
  return chosen ? (
    <FoodPortionEditor
      key={'add' + chosen.id}
      food={{
        ...chosen,
        qty: 1,
        portion: undefined,
      }}
      initialMeal={meal}
      onSave={(data) => {
        setEntries((prev) =>
          appendDiaryEntries(
            prev,
            day,
            [
              {
                ...chosen,
                qty: data.qty,
                meal: data.meal,
                portion: data.portion,
              },
            ],
            profile,
          ),
        );
        setChosen(null);
        setSheet(null);
        notify(t('toast.addedTo', { meal: tMeal(data.meal) }));
      }}
      onBack={() => setChosen(null)}
    />
  ) : (
    <>
      <div className="pills">
        {meals.map((m) => (
          <Button
            key={m}
            className={meal === m ? 'selected' : ''}
            onClick={() => setMeal(m)}
            variant="unstyled"
          >
            {tMeal(m)}
          </Button>
        ))}
      </div>
      <Input
        className="search"
        placeholder={t('food.searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t('food.searchAria')}
        unstyled
      />
      <div className="pills">
        <Button onClick={() => setSheet('meals')} variant="unstyled">
          {t('food.savedMeals')}
        </Button>
        <Button onClick={() => setSheet('quick')} variant="unstyled">
          {t('food.quickAdd')}
        </Button>
        <Button onClick={() => setSheet('barcode')} variant="unstyled">
          ▥ {t('food.barcode')}
        </Button>
        <Button onClick={() => setSheet('photo')} variant="unstyled">
          ◎ {t('food.mealScan')}
        </Button>
      </div>
      <div className="eyebrow">{query ? t('food.searchResults') : t('food.everydayFavorites')}</div>
      {
        <FoodRows
          items={[...foods, ...custom].filter((x) =>
            x.name.toLowerCase().includes(query.toLowerCase()),
          )}
          setChosen={setChosen}
          setQty={setQty}
          setSheet={setSheet}
        />
      }
      {![...foods, ...custom].some((x) => x.name.toLowerCase().includes(query.toLowerCase())) && (
        <div className="empty">{t('food.noMatch')}</div>
      )}
      <Button className="secondary" onClick={() => setSheet('custom')} variant="unstyled">
        + {t('food.createFood')}
      </Button>
    </>
  );
}
