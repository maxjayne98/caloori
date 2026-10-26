'use client';

import { Button } from '@nourish/ui';
import { portionNumber, formatPortion, sumMealItems, reusableItems } from '@nourish/core';
import { Icon } from '@/components/icon';
export function MealLibrary({ templates, onUse, onCreate, onEdit, onDelete }) {
  return (
    <div className="saved-meal-library">
      <div className="library-heading">
        <p>Your regulars, ready in one tap.</p>
        <Button className="link" onClick={onCreate} variant="unstyled">
          + Create meal
        </Button>
      </div>
      {templates.length ? (
        templates.map((t) => {
          let items = reusableItems(t),
            tot = sumMealItems(items);
          return (
            <article className="template-card" key={t.id}>
              <div className="template-title">
                <div>
                  <h3>{t.name}</h3>
                  <span className="template-meta">
                    {items.length +
                      ' item' +
                      (items.length === 1 ? '' : 's') +
                      ' · ' +
                      portionNumber(tot.cal) +
                      ' kcal'}
                  </span>
                </div>
                <Button
                  className="item-action"
                  aria-label={'Edit meal ' + t.name}
                  onClick={() => onEdit(t)}
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
                <Button className="use-meal" onClick={() => onUse(t)} variant="unstyled">
                  Use meal
                </Button>
              </div>
              {onDelete && (
                <Button
                  className="template-delete"
                  aria-label={'Delete meal ' + t.name}
                  onClick={() => onDelete(t)}
                  variant="unstyled"
                >
                  Delete
                </Button>
              )}
            </article>
          );
        })
      ) : (
        <div className="empty meal-library-empty">
          <Icon type="Bookmark" />
          <h3>Make your go-to meal</h3>
          <p>
            Save eggs, toast and everything else together. Next time, log the whole meal at once.
          </p>
          <Button className="primary" onClick={onCreate} variant="unstyled">
            Create your first meal
          </Button>
        </div>
      )}
    </div>
  );
}
