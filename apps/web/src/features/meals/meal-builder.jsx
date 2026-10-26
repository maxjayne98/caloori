'use client';

import React from 'react';
import { Button, Input } from '@nourish/ui';
import { portionNumber, formatPortion, freshKey, sumMealItems } from '@nourish/core';
import { Icon } from '@/components/icon';
import { FoodNutrition } from '@/components/food-nutrition';
import { FoodPortionEditor } from '@/features/foods/portion-editor';
export function MealBuilder({ initial, foods, onSave, onCancel }) {
  const [name, setName] = React.useState(initial?.name || ''),
    [items, setItems] = React.useState(initial?.items || []),
    [query, setQuery] = React.useState(''),
    [selected, setSelected] = React.useState(null),
    [error, setError] = React.useState('');
  if (selected)
    return (
      <FoodPortionEditor
        key={selected.key || selected.id}
        food={selected}
        initialMeal="Breakfast"
        hideMeal={true}
        saveLabel={selected.builderIndex !== undefined ? 'Update ingredient' : 'Add ingredient'}
        onBack={() => setSelected(null)}
        onSave={(data) => {
          const food = {
            ...selected,
            qty: data.qty,
            portion: data.portion,
            key: selected.key || freshKey(),
          };
          delete food.builderIndex;
          setItems((prev) =>
            selected.builderIndex !== undefined
              ? prev.map((x, i) => (i === selected.builderIndex ? food : x))
              : [...prev, food],
          );
          setSelected(null);
        }}
      />
    );
  return (
    <div className="meal-builder">
      <label htmlFor="template-name">Meal name</label>
      <Input
        id="template-name"
        placeholder="e.g. Eggs & toast"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        unstyled
      />
      <div className="section small-section">
        <h3>Ingredients</h3>
        <span className="sub">{items.length + ' item' + (items.length === 1 ? '' : 's')}</span>
      </div>
      {items.map((x, i) => (
        <div className="builder-ingredient" key={x.key || i}>
          <Button
            className="item-details"
            onClick={() =>
              setSelected({
                ...x,
                builderIndex: i,
              })
            }
            variant="unstyled"
          >
            <b>{x.name}</b>
            <small>{formatPortion(x) + ' · ' + portionNumber(x.cal * x.qty) + ' kcal'}</small>
          </Button>
          <Button
            className="item-action"
            aria-label={'Edit ingredient ' + x.name}
            onClick={() =>
              setSelected({
                ...x,
                builderIndex: i,
              })
            }
            variant="unstyled"
          >
            <Icon type="Edit" />
          </Button>
          <Button
            className="item-action remove"
            aria-label={'Remove ingredient ' + x.name}
            onClick={() => setItems(items.filter((_, j) => j !== i))}
            variant="unstyled"
          >
            <Icon type="Trash" />
          </Button>
        </div>
      ))}
      <label htmlFor="ingredient-search">Add a food</label>
      <Input
        id="ingredient-search"
        type="search"
        placeholder="Search ingredients"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        unstyled
      />
      <div className="ingredient-search-results">
        {foods
          .filter((x) => !x.saved && x.name.toLowerCase().includes(query.toLowerCase()))
          .map((f) => (
            <Button
              className="ingredient-result"
              key={f.id}
              onClick={() =>
                setSelected({
                  ...f,
                  qty: 1,
                  portion: undefined,
                })
              }
              variant="unstyled"
            >
              <span>
                <b>{f.name}</b>
                <small>{f.serving + ' · ' + f.cal + ' kcal'}</small>
              </span>
              <Icon type="Add" />
            </Button>
          ))}
      </div>
      {items.length > 0 && <FoodNutrition values={sumMealItems(items)} />}
      {error && (
        <p role="alert" className="portion-error">
          {error}
        </p>
      )}
      <Button
        className="primary"
        disabled={!items.length || !name.trim()}
        onClick={() => {
          if (!name.trim() || !items.length)
            return setError('Add a name and at least one ingredient.');
          onSave({
            id: initial?.id || 'meal-' + freshKey(),
            name: name.trim(),
            items: items.map((x) => ({
              ...x,
              key: freshKey(),
            })),
          });
        }}
        variant="unstyled"
      >
        Save meal
      </Button>
      <Button className="secondary" onClick={onCancel} variant="unstyled">
        Back to my meals
      </Button>
    </div>
  );
}
