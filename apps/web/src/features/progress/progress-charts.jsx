'use client';
import { Select } from '@nourish/ui';

import React from 'react';
import { Button } from '@nourish/ui';
import { portionNumber, activityTypes, buildProgressDays } from '@nourish/core';
import { HistoryBars } from '@/features/progress/history-bars';
export function ProgressCharts({ entries, activities, today }) {
  const [range, setRange] = React.useState(7),
    [end, setEnd] = React.useState(today),
    [metric, setMetric] = React.useState('minutes'),
    [type, setType] = React.useState('all'),
    [foodDay, setFoodDay] = React.useState(today),
    [activityDay, setActivityDay] = React.useState(today);
  const days = buildProgressDays(entries, activities, end, range, type),
    logged = days.filter((x) => x.hasFood),
    average = logged.length ? logged.reduce((s, x) => s + x.intake, 0) / logged.length : null,
    knownGoals = logged.filter((x) => x.goal),
    selectedFood = days.find((x) => x.date === foodDay),
    selectedActivity = days.find((x) => x.date === activityDay),
    minuteTotal = days.reduce((s, x) => s + x.minutes, 0),
    burnTotal = days.reduce((s, x) => s + x.burned, 0),
    sessionTotal = days.reduce((s, x) => s + x.sessions, 0);
  function shift(direction) {
    const d = new Date(end + 'T12:00:00');
    d.setDate(d.getDate() + direction * range);
    const next = d.toLocaleDateString('en-CA');
    setEnd(next);
    setFoodDay(next);
    setActivityDay(next);
  }
  function dayName(date) {
    return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  const foodDetail = selectedFood?.hasFood
    ? dayName(foodDay) +
      ' · ' +
      portionNumber(selectedFood.intake) +
      ' kcal' +
      (selectedFood.goal
        ? ' · Goal ' +
          portionNumber(selectedFood.goal) +
          ' · ' +
          portionNumber(Math.abs(selectedFood.goal - selectedFood.intake)) +
          (selectedFood.intake > selectedFood.goal ? ' above goal' : ' below goal')
        : ' · Goal not recorded')
    : selectedFood
      ? dayName(foodDay) + ' · No food logged'
      : 'Tap a day to see its intake.';
  const activityDetail = selectedActivity?.sessions
    ? dayName(activityDay) +
      ' · ' +
      selectedActivity.sessions +
      ' session' +
      (selectedActivity.sessions === 1 ? '' : 's') +
      ' · ' +
      selectedActivity.minutes +
      ' min · ≈ ' +
      selectedActivity.burned +
      ' kcal'
    : selectedActivity
      ? dayName(activityDay) + ' · No activity logged'
      : 'Tap a day to see its activity.';
  return (
    <div className="progress-charts">
      <div className="progress-range-bar">
        <div className="range-segments" role="group" aria-label="Progress range">
          {[7, 30].map((n) => (
            <Button
              type="button"
              key={n}
              className={range === n ? 'selected' : ''}
              aria-pressed={range === n}
              onClick={() => setRange(n)}
              variant="unstyled"
            >
              {n + ' days'}
            </Button>
          ))}
        </div>
        <Button
          className="link"
          onClick={() => {
            setEnd(today);
            setFoodDay(today);
            setActivityDay(today);
          }}
          variant="unstyled"
        >
          Current period
        </Button>
      </div>
      <div className="progress-period">
        <Button aria-label="Previous progress period" onClick={() => shift(-1)} variant="unstyled">
          ‹
        </Button>
        <span>{dayName(days[0].date) + ' – ' + dayName(end)}</span>
        <Button
          aria-label="Next progress period"
          disabled={end >= today}
          onClick={() => shift(1)}
          variant="unstyled"
        >
          ›
        </Button>
      </div>
      <section className="card intake-history">
        <div className="card-top">
          Food energy
          <span className="tag">KCAL</span>
        </div>
        <div className="history-summary">
          <div>
            <b>{average === null ? '—' : portionNumber(average)}</b>
            <small>Average / logged day</small>
          </div>
          <div className="historical-goal-label">Goal at time of logging</div>
        </div>
        <p className="comparison-help">
          Each marker shows the goal saved at that day’s latest food log.
        </p>
        <HistoryBars
          days={days}
          metric="intake"
          historicalGoals={true}
          color="var(--accent)"
          unit="kcal"
          selected={foodDay}
          onSelect={setFoodDay}
        />
        <div className="chart-legend">
          <span>
            <i
              style={{
                background: 'var(--accent)',
              }}
            />
            Logged intake
          </span>
          <span>
            <i className="legend-dash" />
            Saved daily goal
          </span>
        </div>
        <p className="chart-day-detail" aria-live="polite">
          {foodDetail}
        </p>
        <p className="chart-footnote">
          {logged.length +
            ' of ' +
            range +
            ' days logged. Unlogged days are excluded from the average.' +
            (logged.length > knownGoals.length
              ? ' Earlier logs without a saved goal are not compared.'
              : '')}
        </p>
      </section>
      <section className="card activity-history">
        <div className="card-top">
          Activity
          <Select
            aria-label="Filter activity history"
            value={type}
            onValueChange={setType}
            options={[
              { value: 'all', label: 'All activities' },
              ...activityTypes.map((activity) => ({ value: activity.id, label: activity.name })),
            ]}
          />
        </div>
        <div className="activity-history-summary">
          <div>
            <b>{minuteTotal}</b>
            <small>minutes</small>
          </div>
          <div>
            <b>{'≈ ' + burnTotal}</b>
            <small>kcal burned</small>
          </div>
          <div>
            <b>{sessionTotal}</b>
            <small>sessions</small>
          </div>
        </div>
        <div className="history-metric-switch" role="group" aria-label="Activity chart metric">
          {[
            ['minutes', 'Time'],
            ['burned', 'Energy'],
          ].map(([key, label]) => (
            <Button
              key={key}
              className={metric === key ? 'selected' : ''}
              aria-pressed={metric === key}
              onClick={() => setMetric(key)}
              variant="unstyled"
            >
              {label}
            </Button>
          ))}
        </div>
        <HistoryBars
          days={days}
          metric={metric}
          color="#af7bea"
          unit={metric === 'minutes' ? 'min' : 'kcal'}
          selected={activityDay}
          onSelect={setActivityDay}
        />
        <p className="chart-day-detail" aria-live="polite">
          {activityDetail}
        </p>
        <p className="chart-footnote">
          Energy burned is estimated and tracked separately from food intake.
        </p>
      </section>
    </div>
  );
}
