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
  amountAfterUnitChange,
  scoreFood,
  scorePortion,
} from '@nourish/core';
import { FoodNutrition } from '@/components/food-nutrition';
import { MiniGradeScale, PortionScoreLabel } from '@/components/score-badge';
import { MealPicker } from '@/components/meal-picker';
import { ClearTextButton } from '@/components/text-actions';
import { Scale } from 'lucide-react';
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
    // A remembered portion whose unit no longer exists (e.g. a removed custom unit) is ignored,
    // so its amount is never applied to a different unit.
    saved = units.some((unit) => unit.id === food.portion?.unit) ? food.portion : undefined;
  const initialUnit =
    units.find((x) => x.id === saved?.unit) ||
    units.find((x) => x.id === defaultFoodUnit(food)) ||
    units[0];
  // A new food (no qty yet) starts at one of its own unit (1 can, not 0.4 can), otherwise at one
  // serving shown in the default unit (150 g of rice, not 1 g).
  const initialAmount =
    saved?.amount ??
    (food.qty == null && initialUnit.custom
      ? 1
      : roundAmount((food.qty ?? 1) / initialUnit.factor));
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
    // Custom gram weights per unit, so switching units and back keeps what was typed.
    [weights, setWeights] = React.useState(
      saved?.gramOverride ? { [initialUnit.id]: String(saved.gramOverride) } : {},
    ),
    [error, setError] = React.useState(''),
    [showUnits, setShowUnits] = React.useState(false);
  const unit = units.find((x) => x.id === unitId),
    weight = weights[unitId] ?? '',
    value = mode === 'fraction' ? Number(whole) + Number(fraction) : Number(amount),
    amountOk = Number.isFinite(value) && value > 0,
    weightOk = weight === '' || (Number.isFinite(+weight) && +weight > 0),
    valid = amountOk && weightOk,
    tot = calculatePortion(food, valid ? value : 0, unitId, +weight);
  // Why the save button is disabled, shown as soon as the input is unusable.
  const problem = !amountOk
    ? (mode === 'fraction' ? whole !== '' || +fraction > 0 : amount !== '')
      ? t('portion.enterPositive')
      : ''
    : !weightOk
      ? t('portion.weightPositive')
      : '';
  // Household units with their weight, for the "in grams" list.
  const measure = units.find((x) => x.id === 'g')?.label ?? 'g';
  const gramUnits = units.filter((x) => x.id !== 'g' && !x.hidden && x.grams > 0);
  const unitGrams = (u) => (+weights[u.id] > 0 ? +weights[u.id] : u.grams);
  const totalGrams = units.some((x) => x.id === 'g')
    ? roundAmount(tot.qty / units.find((x) => x.id === 'g').factor)
    : null;
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
    // Same number between countable units, converted only to grams (see amountAfterUnitChange).
    const nextAmount = amountAfterUnitChange({
      from: unit,
      to: nextUnit,
      amount: value,
      qty: oldQty,
    });
    const r = nextAmount - Math.floor(nextAmount);
    const option = fractionOptions.find(([n]) => Math.abs(+n - r) < 1e-3);
    setUnit(next);
    setAmount(String(nextAmount));
    setWhole(String(Math.floor(nextAmount)));
    setFraction(option ? option[0] : '0');
    // Stay in fractions when the new amount is still a clean fraction (½ medium → ½ large).
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
          <div className="relative">
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
                // Whole amounts keep only the whole part (1.5 → 1); the fraction comes from the picker.
                mode === 'fraction'
                  ? setWhole(e.target.value.match(/^\d*/)[0])
                  : setAmount(e.target.value);
              }}
              unstyled
              // Room for the clear button.
              style={{ paddingInlineEnd: 44 }}
            />
            <ClearTextButton
              value={mode === 'fraction' ? whole : amount}
              onChange={() => {
                setError('');
                mode === 'fraction' ? setWhole('') : setAmount('');
                // Ready to type the new amount right away.
                document.getElementById('portion-amount')?.focus();
              }}
            />
          </div>
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
          {/* Label row: the unit, the whole amount in grams, and a toggle for the grams list. */}
          {/* Same height and gap as the Amount label (13px + 8px), so both fields line up. */}
          <div className="mb-2 flex h-[13px] items-center gap-1.5">
            <label htmlFor="portion-unit" style={{ margin: 0 }}>
              {t('portion.unit')}
            </label>
            {totalGrams !== null && unit.id !== 'g' && valid && (
              <span className="text-[11px] text-[var(--neutral-85858b)]">
                ≈ {portionNumber(totalGrams)} {measure}
              </span>
            )}
            {gramUnits.length > 0 && (
              <Button
                type="button"
                variant="unstyled"
                aria-expanded={showUnits}
                aria-controls="portion-unit-grams"
                aria-label={t('portion.unitGrams', { measure })}
                title={t('portion.unitGrams', { measure })}
                onClick={() => setShowUnits((open) => !open)}
                className="ms-auto grid place-items-center rounded-full"
                // Inline: the global button reset (unlayered) would otherwise clear these.
                style={{
                  width: 20,
                  height: 20,
                  padding: 0,
                  background: showUnits ? 'var(--accent-soft)' : 'transparent',
                  color: showUnits ? 'var(--accent-text)' : 'var(--neutral-85858b)',
                }}
              >
                <Scale size={14} aria-hidden="true" />
              </Button>
            )}
          </div>
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
      {gramUnits.length > 0 && showUnits && (
        <div id="portion-unit-grams" className="weight-override mt-2 grid gap-1.5">
          {gramUnits.map((u) => (
            <div key={u.id} className="flex items-center gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate">1 {u.label}</span>
              {u.estimated ? (
                // Estimated household weights can be corrected; the fix applies to this log.
                <input
                  type="number"
                  inputMode="decimal"
                  min={0.001}
                  step="any"
                  aria-label={t('portion.gramsPer', { unit: u.label })}
                  placeholder={portionNumber(u.grams)}
                  value={weights[u.id] ?? ''}
                  onChange={(e) => setWeights((w) => ({ ...w, [u.id]: e.target.value }))}
                  style={{
                    width: 76,
                    height: 32,
                    minHeight: 0,
                    padding: '0 10px',
                    borderRadius: 10,
                    textAlign: 'end',
                  }}
                />
              ) : (
                <b className="font-semibold">{portionNumber(unitGrams(u))}</b>
              )}
              <span className="w-5">{measure}</span>
            </div>
          ))}
        </div>
      )}
      {(error || problem) && (
        <p className="portion-error" role="alert">
          {error || problem}
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
