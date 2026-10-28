'use client';

import { Button } from '@nourish/ui';
import { portionNumber, formatPortion } from '@nourish/core';
import { useI18n } from '@/providers/i18n-provider';
export function MealDetailSheet({ list, meal, setEntries, entries, day, openAdd, setSheet }) {
  const { t } = useI18n();
  return (
    <>
      {list
        .filter((x) => x.meal === meal)
        .map((x) => (
          <div className="food-row" key={x.key}>
            <div className="info">
              <b>{x.name}</b>
              <small>{formatPortion(x) + ' · ' + portionNumber(x.cal * x.qty) + ' ' + t('common.kcal')}</small>
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
              {t('common.remove')}
            </Button>
          </div>
        ))}
      {!list.some((x) => x.meal === meal) && (
        <div className="empty">{t('meals.emptyMealStart')}</div>
      )}
      <Button className="primary" onClick={() => openAdd(meal)} variant="unstyled">
        {t('meals.addFood')}
      </Button>
      {list.some((x) => x.meal === meal) && (
        <Button className="secondary" onClick={() => setSheet('saveMeal')} variant="unstyled">
          {t('meals.saveThisMeal')}
        </Button>
      )}
    </>
  );
}
