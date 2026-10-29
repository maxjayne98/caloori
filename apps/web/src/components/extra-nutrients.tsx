'use client';
import {
  EXTRA_NUTRIENTS,
  type ExtraNutrientKey,
  type ExtraNutrientTotal,
  type ExtraNutrients,
} from '@nourish/core';
import { useI18n } from '@/providers/i18n-provider';
import { RollingNumber } from '@/components/rolling-number';

const LABEL_KEYS = {
  sugar: 'nutrients.sugar',
  fiber: 'nutrients.fiber',
  satFat: 'nutrients.satFat',
  sodium: 'nutrients.sodium',
  cholesterol: 'nutrients.cholesterol',
} as const;

const SHORT_LABEL_KEYS = {
  sodium: 'nutrients.sodiumShort',
  cholesterol: 'nutrients.cholesterolShort',
} as const;

function useFormat() {
  const { t } = useI18n();
  return (key: ExtraNutrientKey, amount: number) => {
    const unit = EXTRA_NUTRIENTS.find((n) => n.key === key)?.unit ?? 'g';
    const rounded = unit === 'mg' ? Math.round(amount) : Math.round(amount * 10) / 10;
    return `${rounded.toLocaleString()} ${t(unit === 'mg' ? 'common.mg' : 'common.grams')}`;
  };
}

const LIST_LABEL_KEYS = {
  sugar: 'nutrients.sugarShort',
  fiber: 'nutrients.fiberShort',
  satFat: 'nutrients.satFatShort',
  sodium: 'nutrients.sodiumShort',
  cholesterol: 'nutrients.cholesterolShort',
} as const;

/** Known extra nutrients for one food or portion, on a single compact line. */
export function ExtraNutrientList({ values }: { values: ExtraNutrients }) {
  const { t } = useI18n();
  const rows = EXTRA_NUTRIENTS.filter(({ key }) => values[key] !== undefined);
  if (!rows.length) return null;
  return (
    <dl className="col-span-full m-0 flex justify-between gap-2 overflow-hidden whitespace-nowrap border-t border-[var(--neutral-f0f0f4)] pt-2.5 text-[10.5px]">
      {rows.map(({ key, unit }) => (
        <div key={key} className="flex min-w-0 items-baseline gap-1" title={t(LABEL_KEYS[key])}>
          <dt className="text-[var(--neutral-898993)]">{t(LIST_LABEL_KEYS[key])}</dt>
          <dd className="m-0 font-semibold tabular-nums">
            <RollingNumber value={values[key]!} decimals={unit === 'mg' ? 0 : 1} />
            {t(unit === 'mg' ? 'common.mg' : 'common.grams')}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Day totals for sodium and cholesterol as one tiny line tucked under the energy ring.
 * Absolutely positioned so it never changes the card height; hidden when nothing is known.
 */
export function ExtraNutrientSummary({
  totals,
}: {
  totals: Record<ExtraNutrientKey, ExtraNutrientTotal>;
}) {
  const { t } = useI18n();
  const format = useFormat();
  const shown = (['sodium', 'cholesterol'] as const).filter((key) => totals[key].known > 0);
  if (!shown.length) return null;
  return (
    <p className="pointer-events-none absolute bottom-2 end-[22px] m-0 flex w-[152px] max-w-[40%] justify-center gap-2 whitespace-nowrap text-[10px] leading-none text-[var(--neutral-85858b)] max-[360px]:end-4">
      {shown.map((key) => (
        <span key={key}>
          {t(SHORT_LABEL_KEYS[key])}{' '}
          <b className="font-semibold tabular-nums text-[var(--foreground)]">
            {format(key, totals[key].amount)}
          </b>
        </span>
      ))}
    </p>
  );
}

/** Optional inputs named after the nutrient keys, so label import can fill them too. */
export function ExtraNutrientFields() {
  const { t } = useI18n();
  return (
    <details className="my-1">
      <summary className="cursor-pointer py-2 text-sm font-semibold">{t('nutrients.more')}</summary>
      <p className="mb-2 mt-0 text-xs text-[var(--neutral-85858b)]">{t('nutrients.moreHint')}</p>
      <div className="grid2">
        {EXTRA_NUTRIENTS.map(({ key, unit }) => (
          <div key={key}>
            <label htmlFor={`food-${key}`}>
              {`${t(LABEL_KEYS[key])} (${t(unit === 'mg' ? 'common.mg' : 'common.grams')})`}
            </label>
            <input
              id={`food-${key}`}
              name={key}
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
            />
          </div>
        ))}
      </div>
    </details>
  );
}
