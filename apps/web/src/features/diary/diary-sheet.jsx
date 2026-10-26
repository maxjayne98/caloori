'use client';

import { Button } from '@nourish/ui';
import { portionNumber, formatPortion } from '@nourish/core';
export function MealDetailSheet({ list, meal, setEntries, entries, day, openAdd, setSheet }) {
  return (
    <>
      {list
        .filter((x) => x.meal === meal)
        .map((x) => (
          <div className="food-row" key={x.key}>
            <div className="info">
              <b>{x.name}</b>
              <small>{formatPortion(x) + ' · ' + portionNumber(x.cal * x.qty) + ' kcal'}</small>
            </div>
            <Button
              className="delete"
              onClick={() =>
                setEntries({
                  ...entries,
                  [day]: list.filter((y) => y.key !== x.key),
                })
              }
              variant="unstyled"
            >
              Remove
            </Button>
          </div>
        ))}
      {!list.some((x) => x.meal === meal) && (
        <div className="empty">Nothing logged yet. Let’s start here.</div>
      )}
      <Button className="primary" onClick={() => openAdd(meal)} variant="unstyled">
        + Add food
      </Button>
      {list.some((x) => x.meal === meal) && (
        <Button className="secondary" onClick={() => setSheet('saveMeal')} variant="unstyled">
          Save this meal
        </Button>
      )}
    </>
  );
}
