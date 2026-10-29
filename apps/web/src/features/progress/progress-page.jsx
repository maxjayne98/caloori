'use client';

import { estimateRecentWeightTrend, today } from '@nourish/core';
import { ProgressCharts } from '@/features/progress/progress-charts';
import { WeightSummary } from '@/features/progress/weight-summary';
import {
  CalendarDays,
  CalendarRange,
  ChevronRight,
  Minus,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@nourish/ui';
import { ReportIcon } from '@/components/report-icon';
import { useI18n } from '@/providers/i18n-provider';

export function ProgressPage({
  weights,
  profile,
  setSheet,
  entries,
  activities,
  weeklyReport,
  onWeeklyReport,
}) {
  const { t, formatDate, locale } = useI18n();
  const dateLabel = (date) => formatDate(date, { month: 'short', day: 'numeric' });
  const weightTrend = estimateRecentWeightTrend({
    entries,
    activities,
    weights,
    profile,
    throughDate: today,
  });
  const formatWeightChange = (kg) =>
    new Intl.NumberFormat(locale, {
      signDisplay: 'always',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(kg);
  let TrendIcon = Minus;
  if (weightTrend?.weeklyKg < 0) TrendIcon = TrendingDown;
  else if (weightTrend?.weeklyKg > 0) TrendIcon = TrendingUp;
  return (
    <>
      <div className="intro">
        <div className="eyebrow">{t('progress.eyebrow')}</div>
        <h1>{t('progress.title')}</h1>
        <p>{t('progress.subtitle')}</p>
      </div>
      {weeklyReport.ready && (
        <Button variant="unstyled" className="card weekly-report-link" onClick={onWeeklyReport}>
          <span className="weekly-report-shortcut">
            <ReportIcon animated />
          </span>
          <span className="weekly-report-link-text">
            <strong>{t('progress.weeklyReport')}</strong>
            <small>
              {dateLabel(weeklyReport.days[0].date)} – {dateLabel(weeklyReport.days[6].date)}
            </small>
          </span>
          <ChevronRight size={18} aria-hidden="true" />
        </Button>
      )}
      {weightTrend && (
        <section className="card weight-trend-card">
          <div className="card-top">
            <span className="weight-trend-heading">
              <span className="weight-trend-heading-icon" aria-hidden="true">
                <Scale size={17} />
              </span>
              {t('progress.weightTrend')}
            </span>
            <span className="tag">{t('progress.weightTrendEstimate')}</span>
          </div>
          <div className="weight-trend-metrics">
            <div className="weight-trend-metric weight-trend-metric-primary">
              <small>
                <CalendarRange size={12} aria-hidden="true" />
                <span>
                  {t('progress.weightChangeSoFar')}
                  {t('progress.weightChangePeriod')}
                </span>
              </small>
              <b dir="ltr">
                <TrendIcon size={15} aria-hidden="true" />
                {formatWeightChange(weightTrend.estimatedSoFarKg)} {t('common.kg')}
              </b>
            </div>
            <div className="weight-trend-metric">
              <small>
                <CalendarDays size={12} aria-hidden="true" />
                {t('progress.weightChangeWeek')}
              </small>
              <b dir="ltr">
                {formatWeightChange(weightTrend.weeklyKg)} {t('common.kg')}
              </b>
            </div>
            <div className="weight-trend-metric">
              <small>
                <CalendarRange size={12} aria-hidden="true" />
                {t('progress.weightChangeFourWeeks')}
              </small>
              <b dir="ltr">
                {formatWeightChange(weightTrend.fourWeekKg)} {t('common.kg')}
              </b>
            </div>
          </div>
        </section>
      )}
      <WeightSummary weights={weights} profile={profile} onLog={() => setSheet('weight')} />
      <ProgressCharts entries={entries} activities={activities} today={today} />
    </>
  );
}
