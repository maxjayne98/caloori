'use client';

import { Button, Input } from '@nourish/ui';
import { useState } from 'react';
import { useNourishData } from '@/providers/data-provider';
import { RefreshCw } from 'lucide-react';
import { foods } from '@nourish/core';
import { Icon } from '@/components/icon';
import { MealLibrary } from '@/features/meals/meal-library';
import { SavedMealPreview } from '@/features/meals/saved-meal-preview';
import { FoodRows } from '@/features/foods/food-rows';
export function FoodPage({
  filter,
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
}) {
  const { refreshFoods } = useNourishData();
  const [refreshing, setRefreshing] = useState(false),
    [refreshMessage, setRefreshMessage] = useState('');
  return (
    <>
      <div className="intro">
        <div className="eyebrow">GOOD FOOD, LESS EFFORT</div>
        <h1>Your food library.</h1>
        <p>Find a favorite. Make it your own.</p>
      </div>
      {refreshFoods && (
        <div className="food-refresh-row">
          <Button
            type="button"
            variant="unstyled"
            className="link"
            disabled={refreshing}
            onClick={async () => {
              setRefreshing(true);
              setRefreshMessage('');
              try {
                await refreshFoods();
                setRefreshMessage('Food library updated.');
              } catch (error) {
                setRefreshMessage(
                  error instanceof Error ? error.message : 'Could not update foods. Try again.',
                );
              } finally {
                setRefreshing(false);
              }
            }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            {refreshing ? 'Updating…' : 'Refresh foods'}
          </Button>
          <span role="status">{refreshMessage}</span>
        </div>
      )}
      <div className="pills">
        {['All foods', 'Recent', 'My foods', 'Recipes', 'Saved meals'].map((x) => (
          <Button
            className={filter === x ? 'selected' : ''}
            onClick={() => setFilter(x)}
            key={x}
            variant="unstyled"
          >
            {x}
          </Button>
        ))}
      </div>
      {filter === 'Saved meals' ? (
        <MealLibrary {...libraryProps} />
      ) : (
        <>
          <Input
            className="search"
            placeholder="Search foods or ingredients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search food library"
            unstyled
          />
          {filter === 'All foods' && (
            <SavedMealPreview
              templates={templates}
              onUse={useTemplate}
              onCreate={() => createTemplate()}
              onViewAll={() => setFilter('Saved meals')}
            />
          )}
          <div className="food-library-actions">
            <Button
              className="link"
              onClick={() => setSheet(filter === 'Recipes' ? 'recipe' : 'custom')}
              variant="unstyled"
            >
              {filter === 'Recipes' ? '+ Create a recipe' : '+ Create a food'}
            </Button>
            <Button className="link" onClick={() => setSheet('barcode')} variant="unstyled">
              <Icon type="Barcode" />
              Scan barcode
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
                  ? custom.filter((x) => !x.recipe && !x.saved)
                  : filter === 'Recipes'
                    ? custom.filter((x) => x.recipe)
                    : [...foods, ...custom.filter((x) => !x.saved)]
              ).filter((x) => x.name.toLowerCase().includes(query.toLowerCase()))}
              setChosen={setChosen}
              setQty={setQty}
              setSheet={setSheet}
            />
          }
        </>
      )}
    </>
  );
}
