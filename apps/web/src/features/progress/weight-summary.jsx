'use client';

import { Button } from '@nourish/ui';
import { portionNumber } from '@nourish/core';
export function WeightSummary({ weights, profile, onLog }) {
  const points = weights
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14),
    values = points.map((x) => +x.weight),
    low = values.length ? Math.min(...values) - 0.5 : 0,
    high = values.length ? Math.max(...values) + 0.5 : 1,
    start = points.length ? new Date(points[0].date + 'T12:00:00').getTime() : 0,
    finish = points.length ? new Date(points.at(-1).date + 'T12:00:00').getTime() : 0;
  const xy = points.map((p) => ({
    x:
      start === finish
        ? 160
        : 45 + ((new Date(p.date + 'T12:00:00').getTime() - start) / (finish - start)) * 260,
    y: 130 - ((p.weight - low) / (high - low)) * 100,
    ...p,
  }));
  const dots = xy.map((p) => (
    <circle
      key={p.date}
      cx={p.x}
      cy={p.y}
      r={4}
      fill="#af7bea"
      stroke="var(--surface)"
      strokeWidth={2}
    >
      <title>{p.date + ' · ' + p.weight + ' kg'}</title>
    </circle>
  ));
  const graph = (
    <svg
      className="weight-history-chart"
      viewBox="0 0 320 160"
      role="img"
      aria-label={
        points.length
          ? 'Weight history, ' + points.length + ' check-in' + (points.length === 1 ? '' : 's')
          : 'No weight check-ins yet'
      }
    >
      {[30, 80, 130].map((y, i) => (
        <g key={y}>
          <line
            x1={40}
            x2={312}
            y1={y}
            y2={y}
            stroke="var(--neutral-f0f0f5)"
            strokeDasharray="4 4"
          />
          {points.length > 0 && (
            <text x={1} y={y + 3} fill="var(--neutral-aaaab5)" fontSize={9}>
              {portionNumber(high - ((high - low) * i) / 2)}
            </text>
          )}
        </g>
      ))}
      {xy.length > 1 && (
        <polyline
          points={xy.map((p) => p.x + ',' + p.y).join(' ')}
          fill="none"
          stroke="#af7bea"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {dots}
    </svg>
  );
  return (
    <section className="card weight-summary">
      <div className="card-top">
        Body weight
        <span className="tag">KG</span>
      </div>
      <div className="weight-header">
        <div className="weight">
          {points.length ? points.at(-1).weight : (profile.weight ?? '—')}
          <small>{' kg'}</small>
        </div>
        <Button className="link" onClick={onLog} variant="unstyled">
          + Log weight
        </Button>
      </div>
      {graph}
      {points.length ? (
        <div className="chart-labels">
          <span>{points[0].date}</span>
          {points.length > 1 && <span>{points.at(-1).date}</span>}
        </div>
      ) : (
        <p className="chart-footnote">Log your first check-in to start your weight chart.</p>
      )}
      {points.length === 1 && (
        <p className="chart-footnote">Your first check-in. Future entries will build your trend.</p>
      )}
      {weights.length > 0 && (
        <details className="weight-checkins">
          <summary>{'Your check-ins · ' + weights.length}</summary>
          {weights
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((w) => (
              <div className="stat-line" key={w.date}>
                <span>{w.date}</span>
                <b>{w.weight + ' kg'}</b>
              </div>
            ))}
        </details>
      )}
    </section>
  );
}
