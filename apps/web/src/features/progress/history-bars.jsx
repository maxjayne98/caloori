'use client';

import { Button } from '@nourish/ui';
import { portionNumber } from '@nourish/core';
export function HistoryBars({
  days,
  metric,
  target,
  color,
  unit,
  onSelect,
  selected,
  historicalGoals = false,
}) {
  const peak = Math.max(
      target || 0,
      ...days.map((d) => d[metric]),
      ...(historicalGoals ? days.map((d) => d.goal || 0) : []),
      0,
    ),
    max = peak > 0 ? peak * 1.15 : unit === 'min' ? 60 : 500,
    hasData = (d) => (metric === 'intake' ? d.hasFood : d.sessions > 0);
  return (
    <div className="history-bars">
      <div className="chart-scale">
        <span>{Math.ceil(max).toLocaleString('en-US')}</span>
        <span>{'0 ' + unit}</span>
      </div>
      <div className="bar-plot">
        {target > 0 && (
          <div
            className="comparison-line"
            style={{
              bottom: (target / max) * 100 + '%',
            }}
          >
            <span>{'Target ' + portionNumber(target)}</span>
          </div>
        )}
        <div
          className="bar-columns"
          style={{
            gridTemplateColumns: 'repeat(' + days.length + ',minmax(0,1fr))',
          }}
        >
          {days.map((d) => (
            <Button
              type="button"
              key={d.date}
              className={'history-bar-button' + (d.date === selected ? ' selected' : '')}
              aria-label={
                d.date +
                ', ' +
                (hasData(d) ? portionNumber(d[metric]) + ' ' + unit : 'no data logged')
              }
              onClick={() => onSelect(d.date)}
              variant="unstyled"
            >
              {historicalGoals && d.goal && (
                <span
                  className="day-goal-tick"
                  style={{
                    bottom: (d.goal / max) * 100 + '%',
                  }}
                  aria-hidden={true}
                />
              )}
              <span
                className={'bar-fill' + (!hasData(d) ? ' no-data' : '')}
                style={{
                  height: hasData(d) ? Math.max((d[metric] / max) * 100, 1) + '%' : '2px',
                  background: hasData(d) ? color : 'var(--neutral-ededf2)',
                }}
              />
            </Button>
          ))}
        </div>
        <div className="chart-axis">
          <span>
            {new Date(days[0].date + 'T12:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span>
            {new Date(days.at(-1).date + 'T12:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
