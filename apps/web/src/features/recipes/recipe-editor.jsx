'use client';

import { useState } from 'react';
import { Button, Input, Select } from '@nourish/ui';
import { useI18n } from '@/providers/i18n-provider';
export function Recipe({ foods, save }) {
  const { t } = useI18n();
  const [parts, setParts] = useState([]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        let d = Object.fromEntries(new FormData(e.target));
        if (!parts.length) return;
        let n = +d.servings;
        if (n <= 0) return;
        save({
          id: 'r' + Date.now(),
          recipe: true,
          emoji: '🥘',
          name: d.name,
          serving: '1 serving',
          ...parts.reduce(
            (s, x) => ({
              cal: s.cal + x.cal / n,
              p: s.p + x.p / n,
              c: s.c + x.c / n,
              f: s.f + x.f / n,
            }),
            {
              cal: 0,
              p: 0,
              c: 0,
              f: 0,
            },
          ),
        });
      }}
    >
      <label>{t('recipe.name')}</label>
      <Input name="name" required={true} placeholder={t('recipe.namePlaceholder')} unstyled />
      <label>{t('recipe.servings')}</label>
      <Input name="servings" type="number" min={1} defaultValue={1} required={true} unstyled />
      <label>{t('recipe.addIngredients')}</label>
      <Select
        aria-label={t('recipe.addIngredients')}
        value=""
        placeholder={t('recipe.chooseIngredient')}
        onValueChange={(value) => {
          const ingredient = foods.find((food) => food.id === value);
          if (ingredient) setParts([...parts, ingredient]);
        }}
        options={foods.map((food) => ({ value: food.id, label: food.name + ' · ' + food.serving }))}
      />
      {parts.map((x, i) => (
        <div className="stat-line" key={i}>
          {x.name}
          <Button
            type="button"
            className="delete"
            onClick={() => setParts(parts.filter((_, j) => i !== j))}
            variant="unstyled"
          >
            {t('common.remove')}
          </Button>
        </div>
      ))}
      <Button className="primary" disabled={!parts.length} variant="unstyled">
        {t('recipe.save')}
      </Button>
    </form>
  );
}
