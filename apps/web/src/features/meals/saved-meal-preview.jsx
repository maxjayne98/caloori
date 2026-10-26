'use client';

import { Button } from '@nourish/ui';
import { portionNumber, sumMealItems, reusableItems } from '@nourish/core';
import { Icon } from '@/components/icon';
export function SavedMealPreview({ templates, onUse, onCreate, onViewAll }) {
  const shortcuts = templates.slice(0, 4).map((t) => (
    <Button key={t.id} className="meal-shortcut" onClick={() => onUse(t)} variant="unstyled">
      <Icon type="Bookmark" />
      <span>
        <b>{t.name}</b>
        <small>
          {reusableItems(t).length +
            ' foods · ' +
            portionNumber(sumMealItems(reusableItems(t)).cal) +
            ' kcal'}
        </small>
      </span>
      <Icon type="Add" />
    </Button>
  ));
  return (
    <section className="library-meal-preview">
      <div className="library-meal-preview-head">
        <h2>Saved meals</h2>
        <Button className="link" onClick={onViewAll} variant="unstyled">
          View all
        </Button>
      </div>
      {templates.length ? (
        <div className="meal-shortcuts">{shortcuts}</div>
      ) : (
        <Button className="empty-meal-shortcut" onClick={onCreate} variant="unstyled">
          <Icon type="Bookmark" />
          <span>Create a meal to log your regulars together</span>
          <Icon type="Add" />
        </Button>
      )}
    </section>
  );
}
