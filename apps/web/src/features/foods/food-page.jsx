'use client';

import { Button, Input } from '@nourish/ui';
import { useState } from 'react';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';
import { HeartLoader } from '@/components/heart-loader';
import { RefreshCw } from 'lucide-react';
import { foods, foodLibrary } from '@nourish/core';
import { Icon } from '@/components/icon';
import { MealLibrary } from '@/features/meals/meal-library';
import { FoodRows } from '@/features/foods/food-rows';
export function FoodPage({
  filter,
  notify,
  setFilter,
  libraryProps,
  query,
  setQuery,
  templates,
  useTemplate,
  createTemplate,
  setSheet,
  setChosen,
  setQty,
  entries,
  custom,
  onEditFood,
}) {
  const { refreshFoods } = useNourishData();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false),
    [refreshMessage, setRefreshMessage] = useState('');
  const filters = [
    { id: 'All foods', label: t('food.allFoods') },
    { id: 'Saved meals', label: t('food.savedMeals') },
    { id: 'My foods', label: t('food.myFoods') },
    { id: 'Recent', label: t('food.recent') },
    { id: 'Recipes', label: t('food.recipes') },
  ];
  return (
    <>
      <div className="intro food-intro">
        <div className="eyebrow">{t('food.eyebrow')}</div>
        <h1>{t('food.title')}</h1>
        <p>{t('food.subtitle')}</p>
        {refreshFoods && (
          <div className="food-refresh-row">
            <Button
              type="button"
              variant="unstyled"
              className="link"
              aria-label={t('food.refreshFoods')}
              title={t('food.refreshFoods')}
              disabled={refreshing}
              onClick={async () => {
                setRefreshing(true);
                setRefreshMessage('');
                try {
                  await refreshFoods();
                  setRefreshMessage('Food library updated.');
                  notify('Food library updated.');
                } catch (error) {
                  setRefreshMessage(
                    error instanceof Error ? error.message : 'Could not update foods. Try again.',
                  );
                  notify(error instanceof Error ? error.message : 'Could not update foods.');
                } finally {
                  setRefreshing(false);
                }
              }}
            >
              {refreshing ? (
                <HeartLoader inline label="" />
              ) : (
                <>
                  <RefreshCw size={17} aria-hidden="true" />
                </>
              )}
            </Button>
            <span className="sr-only" role="status">
              {refreshMessage || (refreshing ? 'Updating foods…' : '')}
            </span>
          </div>
        )}
      </div>
      <div className="pills">
        {filters.map((f) => (
          <Button
            className={filter === f.id ? 'selected' : ''}
            onClick={() => setFilter(f.id)}
            key={f.id}
            variant="unstyled"
          >
            {f.label}
          </Button>
        ))}
      </div>
      {filter === 'Saved meals' ? (
        <MealLibrary {...libraryProps} />
      ) : (
        <>
          <Input
            className="search"
            placeholder={t('food.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('food.searchAria')}
            unstyled
          />
          <div className="food-library-actions">
            <Button
              className="link"
              onClick={() => setSheet(filter === 'Recipes' ? 'recipe' : 'custom')}
              variant="unstyled"
            >
              {filter === 'Recipes' ? '+ ' + t('sheet.recipe') : '+ ' + t('sheet.custom')}
            </Button>
            <Button className="link" onClick={() => setSheet('barcode')} variant="unstyled">
              <Icon type="Barcode" />
              {t('sheet.barcode')}
            </Button>
          </div>
          {
            <FoodRows
              items={(filter === 'Recent'
                ? [
                    ...new Map(
                      Object.values(entries)
                        .flat()
                        .reverse()
                        .map((x) => [x.id, x]),
                    ).values(),
                  ]
                : filter === 'My foods'
                  ? custom.filter((x) => !x.recipe && !x.saved && !x.edited)
                  : filter === 'Recipes'
                    ? custom.filter((x) => x.recipe)
                    : foodLibrary(foods, custom).filter((x) => !x.saved)
              ).filter((x) => x.name.toLowerCase().includes(query.toLowerCase()))}
              setChosen={setChosen}
              setQty={setQty}
              setSheet={setSheet}
              onEdit={filter === 'Recent' ? undefined : onEditFood}
            />
          }
        </>
      )}
    </>
  );
}
