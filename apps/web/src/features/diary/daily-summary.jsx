'use client';
import { GradeMark } from '@/components/score-badge';
import { CircleCheck, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { ChubbyCat } from '@/components/chubby-cat';
import { SkinnyCat } from '@/components/skinny-cat';

import { useEffect, useId, useMemo, useState } from 'react';
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
              <span className="macro-per-kg-sep">{' · '}</span>
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
      <DayEnergyHeader tot={tot} onScore={onScore} label={labels[status]} />
      <div className="energy-details">
        {energy}
        <div className="dashboard-macro-block">
          <div className="macros">{macroItems}</div>
        </div>
      </div>
      <div className="daily-energy-chart">
        {ring}
        {weightChange && (
          // Same readout capsule as the Energy gauges card, centered under the ring.
          <div className="mt-2 flex justify-center">
            <WeightEstimate
              weightChange={weightChange}
              weight={weight}
              profile={profile}
              tot={tot}
              variant="notch"
            />
          </div>
        )}
      </div>
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

/** "Daily energy" title, day score and balance tag, shared by Daily energy and Energy gauges. */
/** Seven-day score line drawn beside the day score; gaps (empty days) are skipped. */
function ScoreSparkline({ trend, color }) {
  // Scaled to the week's own range (at least 20 points) so small day-to-day changes stay visible.
  const known = trend.filter((score) => score != null);
  const mid = (Math.min(...known) + Math.max(...known)) / 2;
  const span = Math.max(20, Math.max(...known) - Math.min(...known));
  const points = trend
    .map((score, i) =>
      score == null
        ? null
        : [2 + (i * 32) / (trend.length - 1 || 1), 7 - ((score - mid) / span) * 10],
    )
    .filter(Boolean);
  if (points.length < 2) return null;
  const last = points[points.length - 1];
  return (
    <svg width="36" height="14" viewBox="0 0 36 14" aria-hidden="true" className="shrink-0">
      <polyline
        points={points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  );
}

/** "Daily energy" title, day score with its 7-day trend, and balance tag; shared by both cards. */
export function DayEnergyHeader({ tot, onScore, label, trend = null }) {
  const { t } = useI18n();
  const score = tot.dayScore;
  const color = score ? `var(--grade-${score.grade.toLowerCase()})` : 'currentColor';
  return (
    <div className="card-top">
      <span className="inline-flex items-center gap-2">
        {t('summary.dailyEnergy')}
        {score && (
          <Button
            variant="unstyled"
            className="inline-flex items-center gap-1.5 rounded-full"
            onClick={onScore}
            aria-label={t('insights.dayTitle')}
            // Inline: the global button reset (unlayered) would otherwise clear these.
            style={{
              padding: '0 8px 0 0',
              background: `color-mix(in srgb, ${color} 8%, transparent)`,
            }}
          >
            <GradeMark {...score} size="md" label={t('score.day', { score: score.score })} />
            {trend && <ScoreSparkline trend={trend} color={color} />}
          </Button>
        )}
      </span>
      <span className="tag">{label}</span>
    </div>
  );
}

/** Balance status and today's weight estimate for a day; shared by both energy cards. */
export function useDayEnergy({ tot, profile, weight, day, entries, activities, weights, hasFood }) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const status = balanceStatus(tot.cal, profile.cal, day, now);
  const label = {
    neutral: t('summary.balanceNeutral'),
    over: t('summary.balanceOver'),
    low: t('summary.balanceLow'),
    reached: t('summary.balanceReached'),
  }[status];
  // Memoized: the estimate walks the whole history, and the gauges card re-renders every frame
  // while it animates. It only needs recomputing when the data itself changes.
  const weightChange = useMemo(() => {
    if (!hasFood) return null;
    const adaptiveBaselineKcal = estimateAdaptiveBaselineKcal({
      entries,
      activities,
      weights,
      profile,
      throughDate: day,
    });
    return estimateDailyWeightChange({
      profile,
      intake: tot.cal,
      weight,
      activities: activities[day] ?? [],
      adaptiveBaselineKcal,
    });
  }, [hasFood, entries, activities, weights, profile, day, tot.cal, weight]);
  return { status, label, weightChange };
}

/** Today's weight effect as a pill; tapping it opens the breakdown with the weekly pace. */
export function WeightEstimate({ weightChange, weight, profile, tot, variant = 'pill' }) {
  const { t, locale } = useI18n();
  const [showWeightInfo, setShowWeightInfo] = useState(false);
  const weeklyKg = weightChange ? weightChange.changeKg * 7 : 0;
  const tone = weightChange
    ? weightTrendTone({ weeklyKg, weight: weight || profile.weight, goal: profile.goal })
    : 'ok';
  // Fine trends stay neutral gray; too fast or against the goal turns orange.
  const toneColor = tone === 'ok' ? 'var(--neutral-85858b)' : 'var(--grade-d)';
  const kcal = (value) => Math.round(value).toLocaleString(locale);
  const grams = Math.round((weightChange.changeKg * 1000) / 10) * 10;
  // Notch: a readout capsule for the open bottom of a gauge. A trend arrow in the tone color,
  // the signed grams, and a quiet "today", on a white capsule with a hairline edge.
  const Trend = grams > 0 ? TrendingUp : TrendingDown;
  const weightNotch = (
    <Button
      variant="unstyled"
      onClick={() => setShowWeightInfo(true)}
      aria-label={t('summary.weightInfoTitle')}
      // Compact on every screen: it sits in the dial's opening, under the numbers.
      className="inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full ps-[2px] pe-[7px] tabular-nums active:scale-95"
      // Inline: the global button reset (unlayered) would otherwise clear these.
      style={{
        background: 'var(--surface)',
        border: '1px solid color-mix(in srgb, var(--foreground) 8%, transparent)',
        boxShadow: '0 4px 12px color-mix(in srgb, var(--foreground) 7%, transparent)',
      }}
    >
      <span
        className="grid size-[17px] place-items-center rounded-full"
        style={{ color: 'var(--surface)', background: toneColor }}
        aria-hidden="true"
      >
        <Trend className="size-[10px]" strokeWidth={2.75} />
      </span>
      <span className="text-[11px] font-bold" style={{ color: 'var(--foreground)' }}>
        {new Intl.NumberFormat(locale, { signDisplay: 'always' }).format(grams)}
        <span className="ms-px text-[9px] font-semibold">g</span>
      </span>
      <span className="text-[9px]" style={{ color: 'var(--neutral-85858b)' }}>
        {t('summary.today')}
      </span>
    </Button>
  );
  const weightEstimate = (
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
      {t('summary.estimatedWeightToday', {
        // Today's effect in grams (rounded to 10 g); the sheet shows the weekly pace.
        change: new Intl.NumberFormat(locale, { signDisplay: 'always' }).format(
          Math.round((weightChange.changeKg * 1000) / 10) * 10,
        ),
      })}
    </Button>
  );
  const weightInfo = showWeightInfo && (
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
    <>
      {variant === 'notch' ? weightNotch : weightEstimate}
      {weightInfo}
    </>
  );
}
