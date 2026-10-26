'use client';

import React from 'react';
import { Button, Input } from '@nourish/ui';
import { activityTypes, estimateActivity, freshKey } from '@nourish/core';
import { Icon } from '@/components/icon';
export function ActivityEditor({ initial, weight, onSave, onDelete }) {
  const [type, setType] = React.useState(initial?.type || 'gym'),
    [level, setLevel] = React.useState(initial?.level || 'Moderate'),
    [duration, setDuration] = React.useState(String(initial?.minutes || 30)),
    [kg, setKg] = React.useState(String(initial?.weight || weight || ''));
  const activity = activityTypes.find((x) => x.id === type) || activityTypes[0],
    selected = activity.levels.find((x) => x[0] === level) || activity.levels[0],
    valid =
      +duration > 0 &&
      +duration <= 1440 &&
      +kg > 0 &&
      +kg <= 700 &&
      Number.isFinite(+duration) &&
      Number.isFinite(+kg),
    cal = valid ? estimateActivity(selected[1], +kg, +duration) : 0;
  return (
    <form
      className="activity-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid)
          onSave({
            key: initial?.key || freshKey(),
            type,
            name: activity.name,
            level: selected[0],
            minutes: +duration,
            weight: +kg,
            met: selected[1],
            cal,
          });
      }}
    >
      <div className="activity-choices">
        {activityTypes.map((a) => (
          <Button
            type="button"
            key={a.id}
            className={type === a.id ? 'selected' : ''}
            onClick={() => {
              setType(a.id);
              setLevel('Moderate');
            }}
            variant="unstyled"
          >
            <Icon type={a.icon} />
            <span>{a.name}</span>
          </Button>
        ))}
      </div>
      <label>Intensity</label>
      <div className="intensity-options" role="group" aria-label="Activity intensity">
        {activity.levels.map(([name]) => (
          <Button
            type="button"
            key={name}
            className={selected[0] === name ? 'selected' : ''}
            aria-pressed={selected[0] === name}
            onClick={() => setLevel(name)}
            variant="unstyled"
          >
            {name}
          </Button>
        ))}
      </div>
      <p className="intensity-description">{selected[2]}</p>
      <div className="grid2">
        <div>
          <label htmlFor="activity-minutes">Duration (minutes)</label>
          <Input
            id="activity-minutes"
            type="number"
            min={1}
            max={1440}
            step={1}
            inputMode="numeric"
            required={true}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            unstyled
          />
        </div>
        <div>
          <label htmlFor="activity-weight">Body weight (kg)</label>
          <Input
            id="activity-weight"
            type="number"
            min={1}
            max={700}
            step="any"
            inputMode="decimal"
            required={true}
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            unstyled
          />
        </div>
      </div>
      <div className="activity-estimate" aria-live="polite">
        <div>
          <span>Estimated energy</span>
          <b>
            {valid ? '≈ ' + cal : '—'}
            <small>{valid ? ' kcal' : ' Enter duration and weight'}</small>
          </b>
        </div>
        <Icon type="Activity" />
      </div>
      <details className="activity-method">
        <summary>About this estimate</summary>
        <p>
          {'Gross energy estimate using duration, body weight and MET intensity. Actual energy use varies. ' +
            (activity.proxy ? 'Padel uses tennis as a racket-sport proxy. ' : '')}
        </p>
        <a href={activity.source} target="_blank" rel="noreferrer">
          2024 Compendium of Physical Activities
        </a>
      </details>
      <p className="activity-footnote">Logged separately from your daily food goal.</p>
      <Button className="primary" disabled={!valid} variant="unstyled">
        {initial ? 'Save activity' : 'Log activity'}
      </Button>
      {onDelete && (
        <Button className="secondary" type="button" onClick={onDelete} variant="unstyled">
          Delete activity
        </Button>
      )}
    </form>
  );
}
