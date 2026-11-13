'use client';
import React from 'react';
import { parseServing } from '@nourish/core';
import { Button, Select } from '@nourish/ui';
import { Plus, X } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';

/** Dispatched on the food form to fill these fields; detail: { serving, grams }. */
export const SERVING_FILL_EVENT = 'nourish:fill-serving';

type Kind = 'g' | 'ml' | 'serving';
type Unit = { name: string; grams: string };

/**
 * "Values per [100] [g ▾]" plus optional named units ("block = 6 g"). Writes hidden `serving`,
 * `grams` and `units` fields so the surrounding food form reads them like any other input.
 */
export function ServingFields({
  serving,
  gramsPerServing,
  units: savedUnits,
}: {
  serving?: string;
  gramsPerServing?: number | null;
  units?: readonly { name: string; grams: number }[];
}) {
  const { t } = useI18n();
  const parsed = parseServing(serving ?? '100 g', gramsPerServing);
  const [kind, setKind] = React.useState<Kind>(parsed.kind as Kind);
  const [amount, setAmount] = React.useState(
    String(parsed.kind === 'serving' ? 100 : parsed.amount),
  );
  const [name, setName] = React.useState(parsed.kind === 'serving' ? parsed.label : '');
  const [grams, setGrams] = React.useState(
    parsed.kind === 'serving' && parsed.grams ? String(parsed.grams) : '',
  );
  const [units, setUnits] = React.useState<Unit[]>(
    (savedUnits ?? []).map((unit) => ({ name: unit.name, grams: String(unit.grams) })),
  );

  const measure = kind === 'ml' ? 'ml' : 'g';
  const servingText =
    kind === 'serving' ? '1 ' + (name.trim() || 'serving') : `${+amount || 100} ${kind}`;
  const baseGrams = kind === 'serving' ? grams : String(+amount || 100);
  // Units need a weight to convert from; a nameless serving without grams has none.
  const unitsReady = +baseGrams > 0;
  const cleanUnits = units
    .filter((unit) => unit.name.trim() && +unit.grams > 0)
    .map((unit) => ({ name: unit.name.trim(), grams: +unit.grams }));
  const updateUnit = (index: number, patch: Partial<Unit>) =>
    setUnits(units.map((unit, i) => (i === index ? { ...unit, ...patch } : unit)));

  // The label importer fills this form from outside: it sends the parsed serving as an event,
  // because these fields keep their own state and plain input writes would be overwritten.
  const root = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const form = root.current?.closest('form');
    if (!form) return;
    const fill = (event: Event) => {
      const detail = (event as CustomEvent<{ serving?: string; grams?: number | null }>).detail;
      const next = parseServing(detail.serving ?? '100 g', detail.grams);
      setKind(next.kind as Kind);
      if (next.kind === 'serving') {
        setName(next.label);
        setGrams(next.grams ? String(next.grams) : '');
      } else setAmount(String(next.amount));
    };
    form.addEventListener(SERVING_FILL_EVENT, fill);
    return () => form.removeEventListener(SERVING_FILL_EVENT, fill);
  }, []);

  return (
    <div ref={root} className="grid gap-3">
      <input type="hidden" name="serving" value={servingText} />
      <input type="hidden" name="grams" value={baseGrams} />
      <input type="hidden" name="units" value={JSON.stringify(unitsReady ? cleanUnits : [])} />
      <div>
        <label htmlFor="food-per">{t('portion.valuesPer')}</label>
        <div className="flex gap-2">
          {kind !== 'serving' && (
            <input
              id="food-per"
              className="min-w-0 flex-1"
              type="number"
              inputMode="decimal"
              min={0.001}
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}
          {kind === 'serving' && (
            <input
              id="food-per"
              className="min-w-0 flex-1"
              type="text"
              placeholder={t('portion.servingName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <div className="w-28 shrink-0">
            <Select
              value={kind}
              onValueChange={(value: string) => setKind(value as Kind)}
              aria-label={t('portion.valuesPer')}
              // Match the amount input beside it (the select is shorter by default).
              className="h-full! text-base!"
              options={[
                { value: 'g', label: 'g' },
                { value: 'ml', label: 'ml' },
                { value: 'serving', label: t('portion.perServing') },
              ]}
            />
          </div>
        </div>
      </div>
      {kind === 'serving' && (
        <div>
          <label htmlFor="food-grams">{t('portion.gramsPerServing')}</label>
          <input
            id="food-grams"
            type="number"
            inputMode="decimal"
            min={0.001}
            step="any"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
          />
        </div>
      )}

      <div className="grid gap-2">
        <span className="text-xs font-semibold text-[var(--neutral-85858b)]">
          {t('portion.units')}
        </span>
        {units.map((unit, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(0,1fr)_auto_5.5rem_1.5rem_2rem] items-center gap-2"
          >
            <input
              type="text"
              maxLength={40}
              placeholder={t('portion.unitName')}
              aria-label={t('portion.unitName')}
              value={unit.name}
              onChange={(e) => updateUnit(index, { name: e.target.value })}
            />
            <span className="text-sm text-[var(--neutral-85858b)]">=</span>
            <input
              type="number"
              inputMode="decimal"
              min={0.001}
              step="any"
              aria-label={t('portion.unitWeight', { measure })}
              value={unit.grams}
              onChange={(e) => updateUnit(index, { grams: e.target.value })}
            />
            <span className="text-sm text-[var(--neutral-85858b)]">{measure}</span>
            <Button
              type="button"
              variant="unstyled"
              className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--neutral-85858b)]"
              aria-label={t('portion.removeUnit')}
              onClick={() => setUnits(units.filter((_, i) => i !== index))}
            >
              <X size={15} aria-hidden="true" />
            </Button>
          </div>
        ))}
        {unitsReady ? (
          <Button
            type="button"
            variant="unstyled"
            className="inline-flex items-center gap-1.5 justify-self-start text-sm font-semibold text-[var(--accent-text)]"
            onClick={() => setUnits([...units, { name: '', grams: '' }])}
          >
            <Plus size={15} aria-hidden="true" />
            {t('portion.addUnit')}
          </Button>
        ) : (
          <p className="m-0 text-xs text-[var(--neutral-85858b)]">{t('portion.unitsNeedWeight')}</p>
        )}
      </div>
    </div>
  );
}
