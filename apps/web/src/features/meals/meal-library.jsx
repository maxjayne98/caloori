'use client';

import { Button } from '@nourish/ui';
import { portionNumber, formatPortion, sumMealItems, reusableItems } from '@nourish/core';
import { Icon } from '@/components/icon';
import { useI18n } from '@/providers/i18n-provider';
export function MealLibrary({ templates, onUse, onCreate, onEdit, onDelete }) {
  const { t } = useI18n();
  return (
    <div className="saved-meal-library">
      <div className="library-heading">
        <p>{t('meals.libraryIntro')}</p>
        <Button className="link" onClick={onCreate} variant="unstyled">
          + {t('meals.createMeal')}
        </Button>
      </div>
      {templates.length ? (
        templates.map((tItem) => {
          let items = reusableItems(tItem),
            tot = sumMealItems(items);
          return (
            <article className="template-card" key={tItem.id}>
              <div className="template-title">
                <div>
                  <h3>{tItem.name}</h3>
                  <span className="template-meta">
                    {items.length +
                      ' ' +
                      (items.length === 1 ? 'item' : 'items') +
                      ' · ' +
                      portionNumber(tot.cal) +
                      ' ' +
                      t('common.kcal')}
                  </span>
                </div>
                <Button
                  className="item-action"
                  aria-label={t('common.edit') + ' ' + tItem.name}
                  onClick={() => onEdit(tItem)}
                  variant="unstyled"
                >
                  <Icon type="Edit" />
                </Button>
              </div>
              <p className="template-items">
                {items.map((x) => x.name + ' (' + formatPortion(x) + ')').join(' · ')}
              </p>
              <div className="template-footer">
                <span>
                  {'P ' +
                    portionNumber(tot.p) +
                    'g · C ' +
                    portionNumber(tot.c) +
                    'g · F ' +
                    portionNumber(tot.f) +
                    'g'}
                </span>
                <Button className="use-meal" onClick={() => onUse(tItem)} variant="unstyled">
                  {t('meals.logMealButton')}
                </Button>
              </div>
              {onDelete && (
                <Button
                  className="template-delete"
                  aria-label={t('common.delete') + ' ' + tItem.name}
                  onClick={() => onDelete(tItem)}
                  variant="unstyled"
                >
                  {t('common.delete')}
                </Button>
              )}
            </article>
          );
        })
      ) : (
        <div className="empty meal-library-empty">
          <Icon type="Bookmark" />
          <h3>{t('meals.createMeal')}</h3>
          <p>
            Save foods together. Next time, log the whole meal at once.
          </p>
          <Button className="primary" onClick={onCreate} variant="unstyled">
            + {t('meals.createMeal')}
          </Button>
        </div>
      )}
    </div>
  );
}
