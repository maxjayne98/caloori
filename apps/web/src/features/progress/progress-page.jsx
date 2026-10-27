'use client';

import { today } from '@nourish/core';
import { ProgressCharts } from '@/features/progress/progress-charts';
import { WeightSummary } from '@/features/progress/weight-summary';
import { ChevronRight } from 'lucide-react';
import { Button } from '@nourish/ui';

const dateLabel = (date) =>
  new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export function ProgressPage({
  weights,
  profile,
  setSheet,
  entries,
  activities,
  weeklyReport,
  onWeeklyReport,
}) {
  return (
    <>
      <div className="intro">
        <div className="eyebrow">THE BIGGER PICTURE</div>
        <h1>Every step counts.</h1>
        <p>Your journey, at your own pace.</p>
      </div>
      {weeklyReport.ready && (
        <Button variant="unstyled" className="card weekly-report-link" onClick={onWeeklyReport}>
          <span>
            <strong>Weekly report</strong>
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
