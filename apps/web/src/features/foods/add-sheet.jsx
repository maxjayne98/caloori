'use client';

import { Button } from '@nourish/ui';
import { Bookmark, Plus } from 'lucide-react';
import { Icon } from '@/components/icon';
import { MealPicker } from '@/components/meal-picker';
import { foods, appendDiaryEntries, foodLibrary } from '@nourish/core';
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
}) {
  const { t, tMeal } = useI18n();
  return chosen ? (
    <FoodPortionEditor
      key={'add' + chosen.id}
      food={{
        ...chosen,
        qty: undefined,
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
      <div className="eyebrow">{query ? t('food.searchResults') : t('food.everydayFavorites')}</div>
      {
        <FoodRows
          items={foodLibrary(foods, custom).filter((x) =>
            x.name.toLowerCase().includes(query.toLowerCase()),
          )}
          setChosen={setChosen}
          setQty={setQty}
          setSheet={setSheet}
        />
      }
      {!foodLibrary(foods, custom).some((x) =>
        x.name.toLowerCase().includes(query.toLowerCase()),
      ) && <div className="empty">{t('food.noMatch')}</div>}
      <Button className="secondary" onClick={() => setSheet('custom')} variant="unstyled">
        + {t('food.createFood')}
      </Button>
    </>
  );
}
