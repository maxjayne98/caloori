'use client';

import { Button } from '@nourish/ui';
import { portionNumber } from '@nourish/core';
import { Pencil } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';
export function FoodRows({ items, setChosen, setQty, setSheet, onEdit }) {
  const { t } = useI18n();
  return items.map((f) => (
    <div className="food-row" key={f.id}>
      <Button
        className="info"
        onClick={() => {
          setChosen(f);
          setQty(1);
          setSheet('add');
        }}
        variant="unstyled"
      >
        <b>{f.name}</b>
        <small>{f.serving + ' · ' + f.cal + ' kcal'}</small>
        <span className="food-row-macros">
          {'Protein ' +
            portionNumber(f.p) +
            ' g · Carbs ' +
            portionNumber(f.c) +
            ' g · Fat ' +
            portionNumber(f.f) +
            ' g'}
        </span>
      </Button>
      {onEdit && (
        <Button
          className="item-action"
          aria-label={t('food.editFood', { name: f.name })}
          title={t('food.editFood', { name: f.name })}
          onClick={() => onEdit(f)}
          variant="unstyled"
        >
          <Pencil size={16} aria-hidden="true" />
        </Button>
      )}
      <Button
        className="plus"
        aria-label={'Add ' + f.name}
        onClick={() => {
          setChosen(f);
          setQty(1);
          setSheet('add');
        }}
        variant="unstyled"
      >
        +
      </Button>
    </div>
  ));
}
