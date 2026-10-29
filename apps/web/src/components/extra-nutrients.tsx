'use client';
import {
  EXTRA_NUTRIENTS,
  SODIUM_REFERENCE_MG,
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

/** Day totals for all known extra nutrients, shown in the day-insights sheet. */
export function ExtraNutrientTotals({
  totals,
  dailyCalories,
  referenceNote,
}: {
  totals: Record<ExtraNutrientKey, ExtraNutrientTotal>;
  dailyCalories: number;
  referenceNote: string;
}) {
  const { t, locale } = useI18n();
  const format = useFormat();
  const formatPercent = (percent: number) => new Intl.NumberFormat(locale).format(percent);
  const shown = EXTRA_NUTRIENTS.filter(({ key }) => totals[key].known > 0);
  const targets: Record<ExtraNutrientKey, number> = {
    sugar: 50,
    fiber: (dailyCalories / 1000) * 14,
    satFat: (dailyCalories * 0.1) / 9,
    sodium: SODIUM_REFERENCE_MG,
    cholesterol: 300,
  };
  if (!shown.length) return null;
  return (
    <section className="extra-nutrient-progress">
      <div className="extra-nutrient-heading">
        <h3>{t('nutrients.dailyTotals')}</h3>
        <span>{t('nutrients.dailyReference')}</span>
      </div>
      <p className="extra-nutrient-reference-note">{referenceNote}</p>
      <dl className="extra-nutrient-progress-list">
        {shown.map(({ key }) => {
          const target = targets[key];
          const amount = totals[key].amount;
          const percent = Math.round((amount / target) * 100);
          const formattedPercent = formatPercent(percent);
          const overLimit = (key === 'sodium' || key === 'satFat') && amount > target;
          return (
            <div key={key} className="extra-nutrient-progress-item">
              <div className="extra-nutrient-progress-label">
                <dt>{t(LABEL_KEYS[key])}</dt>
                <dd className="extra-nutrient-progress-amount" dir="ltr">
                  {format(key, amount)} <span>/ {format(key, target)}</span>
                  <b data-over-limit={overLimit}>
                    {t('nutrients.progressPercent', { percent: formattedPercent })}
                  </b>
                </dd>
              </div>
              <div
                className="track extra-nutrient-progress-track"
                role="progressbar"
                aria-label={t('nutrients.progressAria', { nutrient: t(LABEL_KEYS[key]) })}
                aria-valuemin={0}
                aria-valuemax={target}
                aria-valuenow={Math.min(amount, target)}
                aria-valuetext={t('nutrients.progressValue', { percent: formattedPercent })}
                data-over-limit={overLimit}
                data-reached={key === 'fiber' && percent >= 100}
              >
                <i style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

/** Optional inputs named after the nutrient keys, so label import can fill them too. */
export function ExtraNutrientFields({ values }: { values?: ExtraNutrients } = {}) {
  const { t } = useI18n();
  // Editing a food that already has extras opens the section so they're visible.
  const hasValues = EXTRA_NUTRIENTS.some(({ key }) => values?.[key] !== undefined);
  return (
    <details className="my-1" open={hasValues}>
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
              defaultValue={values?.[key] ?? ''}
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
