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
  roundAmount,
  scoreFood,
  scorePortion,
} from '@nourish/core';
import { FoodNutrition } from '@/components/food-nutrition';
import { MiniGradeScale, PortionScoreLabel } from '@/components/score-badge';
import { MealPicker } from '@/components/meal-picker';
import { useI18n } from '@/providers/i18n-provider';
import { useNourishData } from '@/providers/data-provider';
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
  const { profile } = useNourishData();
  const units = getFoodUnits(food),
    saved = food.portion;
  const initialUnit =
    units.find((x) => x.id === saved?.unit) ||
    units.find((x) => x.id === defaultFoodUnit(food)) ||
    units[0];
  // A new food (no qty yet) starts at one of its default unit: 1 can, not 0.4 can.
  const initialAmount =
    saved?.amount ?? (food.qty == null ? 1 : roundAmount(food.qty / initialUnit.factor));
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
  // Judge the actual amount being logged, not the food in general.
  const portionScore = scorePortion(
    {
      ...food,
      ...tot,
      gramsPerServing: food.gramsPerServing ? food.gramsPerServing * tot.qty : null,
    },
    profile.cal,
  );
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
    } else setAmount(String(roundAmount(Number(whole) + Number(fraction))));
    setMode(next);
  }
  function changeUnit(next) {
    const oldQty = calculatePortion(food, Number.isFinite(value) ? value : 0, unitId, +weight).qty;
    const nextUnit = units.find((x) => x.id === next);
    const nextAmount = roundAmount(oldQty / nextUnit.factor);
    const r = nextAmount - Math.floor(nextAmount);
    const option = fractionOptions.find(([n]) => Math.abs(+n - r) < 1e-3);
    setUnit(next);
    // The custom weight belonged to the old unit; the converted amount already includes it.
    setWeight('');
    setAmount(String(nextAmount));
    setWhole(String(Math.floor(nextAmount)));
    setFraction(option ? option[0] : '0');
    // Stay in fractions when the new amount is still a clean fraction (1 ½ cups → 3 tbsp…).
    if (mode === 'fraction' && !option) setMode('decimal');
    setError('');
  }
  return (
    <form
      className="portion-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) {
          setError(t('portion.enterPositive'));
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
        <h3 className="flex items-center gap-2">
          {food.name}
          <MiniGradeScale {...scoreFood(food)} />
        </h3>
        {valid && portionScore ? (
          <PortionScoreLabel score={portionScore} />
        ) : (
          <p className="m-0 mt-1 text-xs text-[var(--neutral-898993)]">
            {t('portion.enterAmount')}
          </p>
        )}
      </div>
      <div className="portion-toolbar">
        <div className="portion-format" role="group" aria-label={t('portion.format')}>
          <Button
            type="button"
            className={mode === 'decimal' ? 'selected' : ''}
            aria-pressed={mode === 'decimal'}
            onClick={() => changeMode('decimal')}
            aria-label={t('portion.decimal')}
            title={t('portion.decimal')}
            variant="unstyled"
          >
            {t('portion.decimalShort')}
          </Button>
          <Button
            type="button"
            className={mode === 'fraction' ? 'selected' : ''}
            aria-pressed={mode === 'fraction'}
            onClick={() => changeMode('fraction')}
            aria-label={t('portion.fraction')}
            title={t('portion.fraction')}
            variant="unstyled"
          >
            {t('portion.fractionShort')}
          </Button>
        </div>
        {!hideMeal && <MealPicker value={selectedMeal} onChange={setMeal} />}
      </div>
      <div className="amount-unit-row">
        <div className="amount-field">
          <label htmlFor="portion-amount">
            {mode === 'fraction' ? t('portion.wholeAmount') : t('portion.portionAmount')}
          </label>
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
            <label htmlFor="portion-fraction">{t('portion.fraction')}</label>
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
          <label htmlFor="portion-unit">{t('portion.unit')}</label>
          <Select
            id="portion-unit"
            value={unitId}
            onValueChange={changeUnit}
            options={units
              .filter((u) => !u.hidden || u.id === unitId)
              .map((u) => ({ value: u.id, label: u.label }))}
          />
        </div>
      </div>
      {unit.estimated && (
        <p className="portion-estimate">
          {t(unit.id === 'g' ? 'portion.estimatedBase' : 'portion.estimatedUnit')}
        </p>
      )}
      {unit.estimated && unit.id !== 'g' && (
        <details className="weight-override" open={!!weight || undefined}>
          <summary>{t('portion.adjustWeight', { unit: unit.label })}</summary>
          <label htmlFor="portion-unit-weight">{t('portion.gramsPer', { unit: unit.label })}</label>
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
        {saveLabel ||
          (onDelete
            ? t('portion.saveChanges')
            : t('meals.addToMeal', { meal: tMeal(selectedMeal) }))}
      </Button>
      {onDelete && (
        <Button className="secondary" type="button" onClick={onDelete} variant="unstyled">
          {t('portion.deleteFromDiary')}
        </Button>
      )}
      {onBack && (
        <Button className="secondary" type="button" onClick={onBack} variant="unstyled">
          {hideMeal ? t('portion.backToIngredients') : t('portion.backToSearch')}
        </Button>
      )}
    </form>
  );
}
