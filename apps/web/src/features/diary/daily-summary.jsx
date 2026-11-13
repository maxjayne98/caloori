'use client';
import { GradeMark } from '@/components/score-badge';
import { CircleCheck, Scale } from 'lucide-react';
import { ChubbyCat } from '@/components/chubby-cat';
import { SkinnyCat } from '@/components/skinny-cat';

import { useEffect, useId, useState } from 'react';
import {
  balanceStatus,
  roundToHalf,
  estimateAdaptiveBaselineKcal,
  estimateDailyWeightChange,
  KCAL_PER_KG,
  weightTrendTone,
} from '@nourish/core';
import { Button } from '@nourish/ui';
import { RollingNumber } from '@/components/rolling-number';
import { ModalSheet } from '@/components/modal-sheet';
import { useI18n } from '@/providers/i18n-provider';
export function DailySummary({
  tot,
  profile,
  weight,
  onEdit,
  day,
  onScore,
  entries,
  activities,
  weights,
  hasFood,
}) {
  const { t, locale } = useI18n();
  const [now, setNow] = useState(() => new Date());
  const [showWeightInfo, setShowWeightInfo] = useState(false);
  // The ring starts empty and fills to today's value once the card is on screen; the existing
  // stroke transition animates it (and is off for reduced motion, so it simply appears).
  const [ringReady, setRingReady] = useState(false);
  useEffect(() => {
    // Two frames so the empty ring is painted first and the transition has a starting point.
    let second;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setRingReady(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);
  // Unique per card, so two summaries on one page never share a gradient.
  const gradientId = `energy-ring-${useId().replace(/:/g, '')}`;
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const status = balanceStatus(tot.cal, profile.cal, day, now);
  const labels = {
    neutral: t('summary.balanceNeutral'),
    over: t('summary.balanceOver'),
    low: t('summary.balanceLow'),
    reached: t('summary.balanceReached'),
  };
  const adaptiveBaselineKcal = hasFood
    ? estimateAdaptiveBaselineKcal({ entries, activities, weights, profile, throughDate: day })
    : null;
  const weightChange =
    hasFood &&
    estimateDailyWeightChange({
      profile,
      intake: tot.cal,
      weight,
      activities: activities[day] ?? [],
      adaptiveBaselineKcal,
    });
  if (!profile.cal)
    return (
      <section className="card profile-setup-card">
        <span className="tag">{t('summary.setupTag')}</span>
        <h2>{t('summary.setupTitle')}</h2>
        <p>{t('summary.setupDesc')}</p>
        <Button variant="unstyled" className="primary" onClick={onEdit}>
          {t('summary.setupButton')}
        </Button>
        <div className="setup-intake">
          <span>
            {t('summary.consumed')}{' '}
            <b>
              <RollingNumber value={Math.round(tot.cal)} /> {t('common.kcal')}
            </b>
          </span>
          <span>
            {t('summary.protein')}{' '}
            <b>
              <RollingNumber value={tot.p} decimals={2} /> {t('common.grams')}
            </b>
          </span>
          <span>
            {t('summary.carbs')}{' '}
            <b>
              <RollingNumber value={tot.c} decimals={2} /> {t('common.grams')}
            </b>
          </span>
          <span>
            {t('summary.fat')}{' '}
            <b>
              <RollingNumber value={tot.f} decimals={2} /> {t('common.grams')}
            </b>
          </span>
        </div>
      </section>
    );
  const macroItems = [
    [t('summary.protein'), 'p', 'var(--macro-protein)'],
    [t('summary.carbs'), 'c', 'var(--macro-carbs)'],
    [t('summary.fat'), 'f', 'var(--macro-fat)'],
  ].map(([name, k, color]) => {
    // Whole or half grams (148.4 → 148.5): precise enough, without decimal noise.
    const eaten = roundToHalf(tot[k] || 0);
    const goal = roundToHalf(profile[k] || 0);
    const over = goal > 0 ? roundToHalf((tot[k] || 0) - profile[k]) : 0;
    // Extra protein is usually fine (green); extra carbs or fat is over plan (orange).
    const overColor = k === 'p' ? 'var(--grade-a)' : 'var(--grade-d)';
    return (
      <div className="macro" key={k}>
        <small className="inline-flex items-center gap-1.5">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ background: color }}
            aria-hidden="true"
          />
          {name}
          {weight > 0 && (
            <em className="macro-per-kg">
              {' · '}
              {/* LTR isolation: keep numeric ratio readable in RTL */}
              <span dir="ltr">
                {((tot[k] || 0) / weight).toFixed(1)} {t('common.grams')}/kg
              </span>
            </em>
          )}
        </small>
        {/* LTR isolation: keep "149g / 130g" order correct in RTL */}
        <b dir="ltr" style={{ unicodeBidi: 'isolate' }}>
          <RollingNumber value={eaten} decimals={1} />
          <em>
            {t('common.grams')} / {goal > 0 ? <RollingNumber value={goal} decimals={1} /> : '—'}
            {t('common.grams')}
          </em>
          {over > 0 && (
            <span
              className="ms-1 inline-block rounded-full px-1 align-middle text-[9px] font-bold leading-4 tabular-nums min-[421px]:ms-1.5 min-[421px]:px-1.5 min-[421px]:text-[10px]"
              style={{
                color: overColor,
                background: `color-mix(in srgb, ${overColor} 14%, transparent)`,
              }}
              title={t('summary.macroOver', { grams: over })}
            >
              +{over}
            </span>
          )}
        </b>
        <div className="track">
          <i
            style={{
              width: (profile[k] > 0 ? Math.min((tot[k] / profile[k]) * 100, 100) : 0) + '%',
              background: color,
            }}
          />
        </div>
      </div>
    );
  });
  const progress = profile.cal > 0 ? Math.min(tot.cal / profile.cal, 1) : 0;
  const percent = profile.cal > 0 ? Math.round((tot.cal / profile.cal) * 100) : 0;
  const ring = (
    <div className="energy-ring">
      <svg
        viewBox="0 0 202 202"
        // A soft glow in the ring's own color lifts it off the card.
        style={{
          overflow: 'visible',
          filter:
            'drop-shadow(0 3px 6px color-mix(in srgb, var(--balance-color, var(--accent)) 22%, transparent))',
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop
              offset="0"
              style={{ stopColor: 'color-mix(in srgb, var(--accent) 55%, var(--surface))' }}
            />
            <stop offset="1" style={{ stopColor: 'var(--accent)' }} />
          </linearGradient>
        </defs>
        <circle cx={101} cy={101} r={90} fill="none" stroke="var(--accent-soft)" strokeWidth={14} />
        {/* Fine inner dial for a crafted, instrument-like look. */}
        <circle
          cx={101}
          cy={101}
          r={74}
          fill="none"
          stroke="var(--neutral-e2e2e8)"
          strokeWidth={1}
          strokeDasharray="1.5 5.3"
          aria-hidden="true"
        />
        {/* Must stay the last circle: status colors (over, low, reached) restyle it. */}
        <circle
          cx={101}
          cy={101}
          r={90}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={565.5}
          strokeDashoffset={565.5 * (1 - (ringReady ? progress : 0))}
        />
      </svg>
      <div className="inside">
        <b className="tabular-nums">
          <RollingNumber value={Math.round(Math.abs(profile.cal - tot.cal))} />
        </b>
        <span>
          {tot.cal > profile.cal ? t('summary.kcalOverGoal') : t('summary.kcalRemaining')}
        </span>
        
      </div>
    </div>
  );
  const energy = (
    <div className="cal-footer">
      {/* LTR isolation: keep "823 / 2,000 kcal" order correct in RTL */}
      <div className="energy-amounts" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
        <b className="consumed-value">
          <RollingNumber value={Math.round(tot.cal)} />
        </b>
        <span className="energy-divider" aria-hidden="true">
          /
        </span>
        <Button
          aria-label={`Daily goal ${profile.cal} kcal. Edit profile and goals`}
          onClick={onEdit}
          variant="unstyled"
        >
          <b>
            <RollingNumber value={Number(profile.cal)} decimals={2} />
          </b>
        </Button>
        <em>{t('common.kcal')}</em>
      </div>
    </div>
  );
  const weeklyKg = weightChange ? weightChange.changeKg * 7 : 0;
  const tone = weightChange
    ? weightTrendTone({ weeklyKg, weight: weight || profile.weight, goal: profile.goal })
    : 'ok';
  // Fine trends stay neutral gray; too fast or against the goal turns orange.
  const toneColor = tone === 'ok' ? 'var(--neutral-85858b)' : 'var(--grade-d)';
  const kcal = (value) => Math.round(value).toLocaleString(locale);
  const weightEstimate = weightChange && (
    <Button
      variant="unstyled"
      onClick={() => setShowWeightInfo(true)}
      aria-label={t('summary.weightInfoTitle')}
      className="mx-auto mt-1.5 inline-flex items-center gap-1 rounded-full font-semibold tabular-nums active:scale-95"
      // Inline: the global button reset (unlayered) would otherwise clear these.
      style={{
        height: 24,
        padding: '0 9px',
        fontSize: 11,
        color: toneColor,
        background: `color-mix(in srgb, ${toneColor} 12%, transparent)`,
      }}
    >
      <Scale size={12} aria-hidden="true" />
      {t('summary.estimatedWeightChange', {
        // Shown per week: -0.8 kg/week reads better than -0.11 kg/day.
        change: new Intl.NumberFormat(locale, {
          signDisplay: 'always',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(weeklyKg),
      })}
    </Button>
  );
  const weightInfo = weightChange && showWeightInfo && (
    <ModalSheet title={t('summary.weightInfoTitle')} onClose={() => setShowWeightInfo(false)}>
      <div className="grid gap-4">
        <p className="m-0 text-sm text-[var(--neutral-85858b)]">{t('summary.weightInfoIntro')}</p>
        <div className="grid gap-2 rounded-2xl bg-[var(--surface)] p-4 text-sm">
          {[
            [
              weightChange.adaptive
                ? t('summary.weightInfoBaseAdaptive')
                : t('summary.weightInfoBase'),
              weightChange.baselineKcal,
            ],
            [t('summary.weightInfoActivity'), weightChange.activityKcal],
            [t('summary.weightInfoDigestion'), weightChange.thermicKcal],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <span className="text-[var(--neutral-85858b)]">{label}</span>
              <b className="font-semibold tabular-nums">
                {kcal(value)} {t('common.kcal')}
              </b>
            </div>
          ))}
          <div className="flex justify-between gap-3 border-t border-[var(--neutral-f0f0f4)] pt-2">
            <span className="text-[var(--neutral-85858b)]">{t('summary.weightInfoEaten')}</span>
            <b className="font-semibold tabular-nums">
              {kcal(tot.cal)} {t('common.kcal')}
            </b>
          </div>
          <div className="flex justify-between gap-3 font-semibold">
            <span>{t('summary.weightInfoBalance')}</span>
            <span className="tabular-nums" style={{ color: toneColor }}>
              {new Intl.NumberFormat(locale, { signDisplay: 'always' }).format(
                Math.round(weightChange.changeKg * KCAL_PER_KG),
              )}{' '}
              {t('common.kcal')} ·{' '}
              {t('summary.perWeek', {
                change: new Intl.NumberFormat(locale, {
                  signDisplay: 'always',
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }).format(weeklyKg),
              })}
            </span>
          </div>
        </div>
        <p className="m-0 text-xs text-[var(--neutral-85858b)]">
          {t(`summary.weightTone.${tone}`)}
        </p>
      </div>
    </ModalSheet>
  );
  return (
    <section
      className={`card energy-card daily-summary relative balance-${status}`}
      // Layered surface: a faint accent wash in the corner, a hairline edge and a soft lift.
      style={{
        background:
          'radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--accent) 7%, var(--surface)) 0%, var(--surface) 55%)',
        border: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)',
        boxShadow:
          '0 1px 2px color-mix(in srgb, var(--foreground) 4%, transparent), 0 12px 32px color-mix(in srgb, var(--accent) 8%, transparent)',
      }}
    >
      <div className="card-top">
        <span className="inline-flex items-center gap-2">
          {t('summary.dailyEnergy')}
          {tot.dayScore && (
            <Button
              variant="unstyled"
              className="grid"
              onClick={onScore}
              aria-label={t('insights.dayTitle')}
            >
              <GradeMark
                {...tot.dayScore}
                size="md"
                label={t('score.day', { score: tot.dayScore.score })}
              />
            </Button>
          )}
        </span>
        <span className="tag">{labels[status]}</span>
      </div>
      <div className="energy-details">
        {energy}
        <div className="dashboard-macro-block">
          <div className="macros">{macroItems}</div>
        </div>
      </div>
      <div className="daily-energy-chart">
        {ring}
        {weightEstimate}
      </div>
      {weightInfo}
      {status !== 'neutral' && (
        <div className="balance-message" role="status">
          {status === 'over' ? (
            <span className="balance-message-cat">
              <ChubbyCat />
            </span>
          ) : status === 'low' ? (
            <span className="balance-message-cat">
              <SkinnyCat />
            </span>
          ) : (
            <span className="balance-message-icon" aria-hidden="true">
              <CircleCheck size={16} />
            </span>
          )}
          <p>
            {status === 'over' ? (
              <>
                <strong>{t('summary.msgOverStrong')}</strong> {t('summary.msgOverText')}
              </>
            ) : status === 'low' ? (
              <>
                <strong>{t('summary.msgLowStrong')}</strong> {t('summary.msgLowText')}
              </>
            ) : (
              <strong>{t('summary.msgReached')}</strong>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
