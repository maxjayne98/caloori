'use client';

import { Button } from '@nourish/ui';
import { RollingNumber } from '@/components/rolling-number';
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
            Consumed{' '}
            <b>
              <RollingNumber value={Math.round(tot.cal)} /> kcal
            </b>
          </span>
          <span>
            Protein{' '}
            <b>
              <RollingNumber value={tot.p} decimals={2} /> g
            </b>
          </span>
          <span>
            Carbs{' '}
            <b>
              <RollingNumber value={tot.c} decimals={2} /> g
            </b>
          </span>
          <span>
            Fat{' '}
            <b>
              <RollingNumber value={tot.f} decimals={2} /> g
            </b>
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
        <RollingNumber value={tot[k]} decimals={2} />
        <em>g / {profile[k] ? <RollingNumber value={profile[k]} decimals={2} /> : '—'}g</em>
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
        <span>{tot.cal > profile.cal ? 'kcal over goal' : 'kcal remaining'}</span>
      </div>
    </div>
  );
  const energy = (
    <div className="cal-footer">
      <small>Consumed / Daily goal</small>
      <div className="energy-amounts">
        <b>
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
        <em>kcal</em>
      </div>
    </div>
  );
  return (
    <section className="card energy-card daily-summary">
      <div className="card-top">
        <span>Daily energy</span>
        <span className="tag">YOUR BALANCE</span>
      </div>
      <div className="energy-details">
        {energy}
        <div className="dashboard-macro-block">
          <div className="macros">{macroItems}</div>
        </div>
      </div>
      {ring}
    </section>
  );
}
