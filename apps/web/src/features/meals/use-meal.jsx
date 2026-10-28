'use client';

import React from 'react';
import { Button, Input, Select } from '@nourish/ui';
import {
  portionNumber,
  formatPortion,
  scaleMealItem,
  sumMealItems,
  reusableItems,
} from '@nourish/core';
import { FoodNutrition } from '@/components/food-nutrition';
import { useI18n } from '@/providers/i18n-provider';
export function UseMealTemplate({ template, initialMeal, onLog, onEdit }) {
  const { t, tMeal } = useI18n();
  const [factor, setFactor] = React.useState('1'),
    [meal, setMeal] = React.useState(initialMeal),
    base = reusableItems(template),
    valid = Number.isFinite(+factor) && +factor > 0,
    items = base.map((x) => scaleMealItem(x, valid ? +factor : 0));
  return (
    <form
      className="use-template"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onLog(items, meal);
      }}
    >
      <h3>{template.name}</h3>
      <p className="sub">All foods are logged separately, so you can edit each one later.</p>
      <div className="grid2">
        <div>
          <label htmlFor="template-count">{t('meals.portions')}</label>
          <Input
            id="template-count"
            type="number"
            min={0.01}
            step="any"
            required={true}
            inputMode="decimal"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            unstyled
          />
        </div>
        <div>
          <label htmlFor="template-meal">{t('meals.logTo')}</label>
          <Select
            id="template-meal"
            value={meal}
            onValueChange={setMeal}
            options={['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((m) => ({
              value: m,
              label: tMeal(m),
            }))}
          />
        </div>
      </div>
      <div className="use-template-items">
        {items.map((x, i) => (
          <div className="stat-line" key={i}>
            <span>
              <b>{x.name}</b>
              <small>{formatPortion(x)}</small>
            </span>
            <span>{portionNumber(x.cal * x.qty) + ' kcal'}</span>
          </div>
        ))}
      </div>
      <FoodNutrition values={sumMealItems(items)} />
      <Button className="primary" disabled={!valid} variant="unstyled">
        {t('meals.logMealButton') + ' · ' + tMeal(meal)}
      </Button>
      <Button
        type="button"
        className="secondary"
        onClick={() => onEdit(template)}
        variant="unstyled"
      >
        {t('meals.editMeal')}
      </Button>
    </form>
  );
}
