'use client';

import React from 'react';
import { Button, Input, Select } from '@nourish/ui';
import {
  portionNumber,
  getFoodUnits,
  defaultFoodUnit,
  calculatePortion,
  fractionOptions,
  fractionDisplay,
  portionUnitLabel,
} from '@nourish/core';
import { FoodNutrition } from '@/components/food-nutrition';
import { useI18n } from '@/providers/i18n-provider';
export function FoodPortionEditor({
  food,
  initialMeal,
  onSave,
  onDelete,
  onBack,
  hideMeal = false,
  saveLabel,
}) {
  const { t, tMeal } = useI18n();
  const units = getFoodUnits(food),
    saved = food.portion;
  const initialUnit =
    units.find((x) => x.id === saved?.unit) ||
    units.find((x) => x.id === defaultFoodUnit(food)) ||
    units[0];
  const initialAmount = saved?.amount ?? (food.qty ?? 1) / initialUnit.factor;
  const [unitId, setUnit] = React.useState(initialUnit.id),
    [amount, setAmount] = React.useState(String(initialAmount)),
    [mode, setMode] = React.useState(saved?.mode || 'decimal'),
    [whole, setWhole] = React.useState(String(Math.floor(initialAmount))),
    [fraction, setFraction] = React.useState(
      (fractionOptions.find(
        ([v]) => Math.abs(+v - (initialAmount - Math.floor(initialAmount))) < 1e-8,
      ) || [String(initialAmount - Math.floor(initialAmount))])[0],
    ),
    [selectedMeal, setMeal] = React.useState(initialMeal),
    [weight, setWeight] = React.useState(saved?.gramOverride || ''),
    [error, setError] = React.useState('');
  const unit = units.find((x) => x.id === unitId),
    value = mode === 'fraction' ? Number(whole) + Number(fraction) : Number(amount),
    valid = Number.isFinite(value) && value > 0 && Number.isFinite(+weight) && +weight >= 0,
    tot = calculatePortion(food, valid ? value : 0, unitId, +weight);
  const text =
    (mode === 'fraction' ? fractionDisplay(value) : portionNumber(value)) +
    ' ' +
    portionUnitLabel(unit, value);
  function changeMode(next) {
    if (next === mode) return;
    setError('');
    if (next === 'fraction') {
      const v = Number(amount) || 0,
        r = v - Math.floor(v),
        option = fractionOptions.find(([n]) => Math.abs(+n - r) < 1e-8);
      setWhole(String(Math.floor(v)));
      setFraction(option ? option[0] : String(r));
    } else setAmount(String(Number(whole) + Number(fraction)));
    setMode(next);
  }
  function changeUnit(next) {
    const oldQty = calculatePortion(food, Number.isFinite(value) ? value : 0, unitId, +weight).qty;
    const nextUnit = units.find((x) => x.id === next);
    setUnit(next);
    setWeight('');
    setAmount(String(oldQty / nextUnit.factor));
    setMode('decimal');
    setError('');
  }
  return (
    <form
      className="portion-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) {
          setError('Enter an amount greater than zero.');
          return;
        }
        onSave({
          ...tot,
          meal: selectedMeal,
          portion: {
            unit: unitId,
            amount: value,
            text,
            mode,
            gramOverride: +weight || null,
          },
        });
      }}
    >
      <div className="portion-food-heading">
        <h3>{food.name}</h3>
      </div>
      <div className="portion-toolbar">
        <div className="portion-format" role="group" aria-label="Amount format">
          <Button
            type="button"
            className={mode === 'decimal' ? 'selected' : ''}
            aria-pressed={mode === 'decimal'}
            onClick={() => changeMode('decimal')}
            variant="unstyled"
          >
            Decimal
          </Button>
          <Button
            type="button"
            className={mode === 'fraction' ? 'selected' : ''}
            aria-pressed={mode === 'fraction'}
            onClick={() => changeMode('fraction')}
            variant="unstyled"
          >
            Fraction
          </Button>
        </div>
        {!hideMeal && (
          <div className="portion-meal toolbar-meal">
            <label htmlFor="portion-meal">Log to</label>
            <Select
              id="portion-meal"
              value={selectedMeal}
              onValueChange={setMeal}
              options={['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((m) => ({
                value: m,
                label: m,
              }))}
            />
          </div>
        )}
      </div>
      <div className="amount-unit-row">
        <div className="amount-field">
          <label htmlFor="portion-amount">{mode === 'fraction' ? 'Whole amount' : 'Amount'}</label>
          <Input
            id="portion-amount"
            type="number"
            inputMode={mode === 'fraction' ? 'numeric' : 'decimal'}
            min={0}
            step={mode === 'fraction' ? 1 : 'any'}
            required={true}
            value={mode === 'fraction' ? whole : amount}
            onChange={(e) => {
              setError('');
              mode === 'fraction' ? setWhole(e.target.value) : setAmount(e.target.value);
            }}
            unstyled
          />
        </div>
        {mode === 'fraction' && (
          <div className="fraction-field">
            <label htmlFor="portion-fraction">Fraction</label>
            <Select
              id="portion-fraction"
              value={fraction}
              onValueChange={setFraction}
              options={[
                ...(!fractionOptions.some(([v]) => Math.abs(+v - Number(fraction)) < 1e-10)
                  ? [{ value: fraction, label: portionNumber(fraction) }]
                  : []),
                ...fractionOptions.map(([v, label]) => ({ value: v, label })),
              ]}
            />
          </div>
        )}
        <div className="unit-field">
          <label htmlFor="portion-unit">Unit</label>
          <Select
            id="portion-unit"
            value={unitId}
            onValueChange={changeUnit}
            options={units.map((u) => ({ value: u.id, label: u.label }))}
          />
        </div>
      </div>
      {unit.estimated && (
        <p className="portion-estimate">
          {'Household weights are estimates. ' +
            (unit.id === 'g'
              ? 'This food’s base serving weight is estimated.'
              : 'Weigh your portion for a closer match.')}
        </p>
      )}
      {unit.estimated && unit.id !== 'g' && (
        <details className="weight-override">
          <summary>{'Adjust weight per ' + unit.label}</summary>
          <label htmlFor="portion-unit-weight">{'Grams per ' + unit.label}</label>
          <Input
            id="portion-unit-weight"
            type="number"
            inputMode="decimal"
            min={0.001}
            step="any"
            placeholder={String(unit.grams)}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            unstyled
          />
        </details>
      )}
      {error && (
        <p className="portion-error" role="alert">
          {error}
        </p>
      )}
      <FoodNutrition values={tot} />
      <Button className="primary" type="submit" disabled={!valid} variant="unstyled">
        {saveLabel || (onDelete ? 'Save changes' : 'Add to ' + selectedMeal)}
      </Button>
      {onDelete && (
        <Button className="secondary" type="button" onClick={onDelete} variant="unstyled">
          Delete food
        </Button>
      )}
      {onBack && (
        <Button className="secondary" type="button" onClick={onBack} variant="unstyled">
          {hideMeal ? 'Back to ingredients' : 'Back to search'}
        </Button>
      )}
    </form>
  );
}
