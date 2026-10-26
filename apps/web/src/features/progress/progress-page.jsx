'use client';

import { today } from '@nourish/core';
import { ProgressCharts } from '@/features/progress/progress-charts';
import { WeightSummary } from '@/features/progress/weight-summary';
export function ProgressPage({ weights, profile, setSheet, entries, activities }) {
  return (
    <>
      <div className="intro">
        <div className="eyebrow">THE BIGGER PICTURE</div>
        <h1>Every step counts.</h1>
        <p>Your journey, at your own pace.</p>
      </div>
      <WeightSummary weights={weights} profile={profile} onLog={() => setSheet('weight')} />
      <ProgressCharts entries={entries} activities={activities} today={today} />
    </>
  );
}
