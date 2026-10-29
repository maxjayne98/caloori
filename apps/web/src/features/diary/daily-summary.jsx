'use client';
import { GradeMark } from '@/components/score-badge';
import { CircleCheck, Scale } from 'lucide-react';
import { ChubbyCat } from '@/components/chubby-cat';
import { SkinnyCat } from '@/components/skinny-cat';

import { useEffect, useState } from 'react';
import {
  balanceStatus,
  estimateAdaptiveBaselineKcal,
  estimateDailyWeightChange,
} from '@nourish/core';
import { Button } from '@nourish/ui';
import { RollingNumber } from '@/components/rolling-number';
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
  ].map(([name, k, color]) => (
    <div className="macro" key={k}>
      <small>
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
      {/* LTR isolation: keep "18.6g / 130g" order correct in RTL */}
      <b dir="ltr" style={{ unicodeBidi: 'isolate' }}>
        <RollingNumber value={tot[k]} decimals={2} />
        <em>
          {t('common.grams')} /{' '}
          {profile[k] ? <RollingNumber value={profile[k]} decimals={2} /> : '—'}
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
  ));
  const ring = (
    <div className="energy-ring">
      <svg viewBox="0 0 202 202">
        <circle cx={101} cy={101} r={90} fill="none" stroke="var(--accent-soft)" strokeWidth={13} />
        <circle
          cx={101}
          cy={101}
          r={90}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={13}
          strokeLinecap="round"
          strokeDasharray={565.5}
          strokeDashoffset={565.5 * (1 - Math.min(tot.cal / profile.cal, 1))}
        />
      </svg>
      <div className="inside">
        <b>
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
      <small>{t('summary.consumedDailyGoal')}</small>
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
  const weightEstimate = weightChange && (
    <div className="daily-weight-estimate">
      <Scale size={13} aria-hidden="true" />
      <span>
        {t('summary.estimatedWeightChange', {
          change: new Intl.NumberFormat(locale, {
            signDisplay: 'always',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(weightChange.changeKg),
        })}
        {weightChange.adaptive && (
          <span className="daily-weight-estimate-source">
            · {t('summary.weightChangeAdaptive')}
          </span>
        )}
      </span>
    </div>
  );
  return (
    <section className={`card energy-card daily-summary relative balance-${status}`}>
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
