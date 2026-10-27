'use client';

import { Button, Input } from '@nourish/ui';
import { useState } from 'react';
import { useNourishData } from '@/providers/data-provider';
import { HeartLoader } from '@/components/heart-loader';
import { RefreshCw } from 'lucide-react';
import { foods } from '@nourish/core';
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
}) {
  const { refreshFoods } = useNourishData();
  const [refreshing, setRefreshing] = useState(false),
    [refreshMessage, setRefreshMessage] = useState('');
  return (
    <>
      <div className="intro food-intro">
        <div className="eyebrow">GOOD FOOD, LESS EFFORT</div>
        <h1>Your food library.</h1>
        <p>Find a favorite. Make it your own.</p>
        {refreshFoods && (
          <div className="food-refresh-row">
            <Button
              type="button"
              variant="unstyled"
              className="link"
              aria-label="Refresh foods"
              title="Refresh foods"
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
        {['All foods', 'Saved meals', 'My foods', 'Recent', 'Recipes'].map((x) => (
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
