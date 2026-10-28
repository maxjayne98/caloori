'use client';

import { today } from '@nourish/core';
import { ProgressCharts } from '@/features/progress/progress-charts';
import { WeightSummary } from '@/features/progress/weight-summary';
import { ChevronRight } from 'lucide-react';
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
  const { t, formatDate } = useI18n();
  const dateLabel = (date) => formatDate(date, { month: 'short', day: 'numeric' });
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
      <WeightSummary weights={weights} profile={profile} onLog={() => setSheet('weight')} />
      <ProgressCharts entries={entries} activities={activities} today={today} />
    </>
  );
}
