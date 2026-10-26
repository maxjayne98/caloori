'use client';

import { Button, Input } from '@nourish/ui';
import { foods, meals, appendDiaryEntries } from '@nourish/core';
import { FoodPortionEditor } from '@/features/foods/portion-editor';
import { FoodRows } from '@/features/foods/food-rows';
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
        notify('Added to ' + data.meal);
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
            {m}
          </Button>
        ))}
      </div>
      <Input
        className="search"
        placeholder="Search for a food"
        value={query}
        autoFocus={true}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search for food"
        unstyled
      />
      <div className="pills">
        <Button onClick={() => setSheet('meals')} variant="unstyled">
          My meals
        </Button>
        <Button onClick={() => setSheet('quick')} variant="unstyled">
          Quick add
        </Button>
        <Button onClick={() => setSheet('barcode')} variant="unstyled">
          ▥ Barcode
        </Button>
        <Button onClick={() => setSheet('photo')} variant="unstyled">
          ◎ Meal scan
        </Button>
      </div>
      <div className="eyebrow">{query ? 'SEARCH RESULTS' : 'EVERYDAY FAVORITES'}</div>
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
        <div className="empty">No matching foods. Create your own below.</div>
      )}
      <Button className="secondary" onClick={() => setSheet('custom')} variant="unstyled">
        + Create a food
      </Button>
    </>
  );
}
