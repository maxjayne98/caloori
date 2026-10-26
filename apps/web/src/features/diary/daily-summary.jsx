'use client';

import { Button } from '@nourish/ui';
import { portionNumber } from '@nourish/core';
export function DailySummary({ tot, profile, onEdit }) {
  if (!profile.cal)
    return (
      <section className="card profile-setup-card">
        <span className="tag">MADE FOR YOU</span>
        <h2>Complete your profile</h2>
        <p>Add your details and nutrition goals to see your daily balance.</p>
        <Button variant="unstyled" className="primary" onClick={onEdit}>
          Set up my profile
        </Button>
        <div className="setup-intake">
          <span>
            Consumed <b>{Math.round(tot.cal).toLocaleString('en-US')} kcal</b>
          </span>
          <span>
            Protein <b>{portionNumber(tot.p)} g</b>
          </span>
          <span>
            Carbs <b>{portionNumber(tot.c)} g</b>
          </span>
          <span>
            Fat <b>{portionNumber(tot.f)} g</b>
          </span>
        </div>
      </section>
    );
  const macroItems = [
    ['Protein', 'p', '#ff9f0a'],
    ['Carbs', 'c', '#30b9c6'],
    ['Fat', 'f', '#af7bea'],
  ].map(([name, k, color]) => (
    <div className="macro" key={k}>
      <small>{name}</small>
      <b>
        {portionNumber(tot[k])}
        <em>{'g / ' + profile[k] + 'g'}</em>
      </b>
      <div className="track">
        <i
          style={{
            width: Math.min((tot[k] / profile[k]) * 100, 100) + '%',
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
        <b>{Math.round(Math.abs(profile.cal - tot.cal)).toLocaleString('en-US')}</b>
        <span>{tot.cal > profile.cal ? 'kcal over goal' : 'kcal remaining'}</span>
      </div>
    </div>
  );
  const energy = (
    <div className="cal-footer">
      <div>
        <small>Consumed</small>
        <b>
          {Math.round(tot.cal).toLocaleString('en-US')} <em>kcal</em>
        </b>
      </div>
      <div>
        <small>Daily goal</small>
        <Button onClick={onEdit} variant="unstyled">
          <b>
            {Number(profile.cal).toLocaleString('en-US')} <em>kcal</em>
          </b>
        </Button>
      </div>
    </div>
  );
  return (
    <section className="card energy-card daily-summary">
      <div className="card-top">
        <span>Daily energy</span>
        <span className="tag">YOUR BALANCE</span>
      </div>
      {ring}
      {energy}
      <div className="dashboard-macro-block">
        <div className="macros">{macroItems}</div>
      </div>
    </section>
  );
}
