'use client';

import { ScrollTopButton } from '@/components/scroll-top-button';
import { Button } from '@nourish/ui';
import { useState } from 'react';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';
import { HeartLoader } from '@/components/heart-loader';
import { Bookmark, ChefHat, Clock, LayoutGrid, Plus, RefreshCw } from 'lucide-react';
import { foods, foodLibrary } from '@nourish/core';
import { Icon } from '@/components/icon';
import { MealLibrary } from '@/features/meals/meal-library';
import { FoodSearchBar } from '@/features/foods/food-search-bar';
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
    { id: 'All foods', label: t('food.allShort'), Icon: LayoutGrid },
    { id: 'Saved meals', label: t('food.mealsShort'), Icon: Bookmark },
    // Text, not an icon: no icon reads clearly as "my foods".
    { id: 'My foods', label: t('food.mineShort') },
    { id: 'Recent', label: t('food.recent'), Icon: Clock },
    { id: 'Recipes', label: t('food.recipes'), Icon: ChefHat },
  ];
  // Compact filter chips sharing one row with the search actions: icons only, and the chosen
  // filter also shows its name.
  const filterChips = (
    <div
      role="tablist"
      aria-label={t('food.filters')}
      className="flex min-w-0 items-center gap-1 overflow-x-auto"
      // Scrolls sideways on very narrow screens; inline because the global scrollbar rule wins.
      style={{ scrollbarWidth: 'none' }}
    >
      {filters.map((f) => {
        const selected = filter === f.id;
        return (
          <Button
            key={f.id}
            role="tab"
            aria-selected={selected}
            aria-label={f.label}
            title={f.label}
            onClick={() => setFilter(f.id)}
            variant="unstyled"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-medium"
            // Inline so the global button reset cannot override size and colors.
            style={{
              height: 30,
              padding: selected ? '0 10px 0 9px' : '0 9px',
              fontSize: 12,
              background: selected ? 'var(--accent)' : 'var(--accent-soft)',
              color: selected ? 'var(--surface)' : 'var(--accent-text)',
            }}
          >
            {f.Icon && <f.Icon size={14} aria-hidden="true" />}
            {(selected || !f.Icon) && <span>{f.label}</span>}
          </Button>
        );
      })}
    </div>
  );
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
      {filter === 'Saved meals' ? (
        <>
          <div
            className="mb-[18px] flex overflow-x-auto"
            // Inline: the global slim-scrollbar rule (unlayered) beats utilities.
            style={{ scrollbarWidth: 'none' }}
          >
            {filterChips}
          </div>
          <MealLibrary {...libraryProps} />
        </>
      ) : (
        <>
          <FoodSearchBar
            query={query}
            setQuery={setQuery}
            start={filterChips}
            iconOnly
            actions={[
              {
                key: 'barcode',
                label: t('food.barcode'),
                icon: <Icon type="Barcode" />,
                onClick: () => setSheet('barcode'),
                accent: true,
              },
              filter === 'Recipes'
                ? {
                    key: 'recipe',
                    label: t('sheet.recipe'),
                    icon: <Plus aria-hidden="true" />,
                    onClick: () => setSheet('recipe'),
                    accent: true,
                  }
                : {
                    key: 'custom',
                    label: t('sheet.custom'),
                    icon: <Plus aria-hidden="true" />,
                    onClick: () => setSheet('custom'),
                    accent: true,
                  },
            ]}
          />
          <div className="pb-36">
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
          </div>
        </>
      )}
      <ScrollTopButton offset="bottom-28" />
    </>
  );
}
