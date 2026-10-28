'use client';
import { CircleCheck } from 'lucide-react';
import { ChubbyCat } from '@/components/chubby-cat';
import { SkinnyCat } from '@/components/skinny-cat';

import { useEffect, useState } from 'react';
import { balanceStatus } from '@nourish/core';
import { Button } from '@nourish/ui';
import { RollingNumber } from '@/components/rolling-number';
export function DailySummary({ tot, profile, weight, onEdit, day }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const status = balanceStatus(tot.cal, profile.cal, day, now);
  const labels = {
    neutral: 'YOUR BALANCE',
    over: 'ABOVE GOAL',
    low: 'EVENING CHECK-IN',
    reached: 'GOAL REACHED',
  };
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
    ['Protein', 'p', 'var(--macro-protein)'],
    ['Carbs', 'c', 'var(--macro-carbs)'],
    ['Fat', 'f', 'var(--macro-fat)'],
  ].map(([name, k, color]) => (
    <div className="macro" key={k}>
      <small>
        {name}
        {weight > 0 && (
          <em className="macro-per-kg"> · {((tot[k] || 0) / weight).toFixed(1)} g/kg</em>
        )}
      </small>
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
        <b className="consumed-value">
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
    <section className={`card energy-card daily-summary balance-${status}`}>
      <div className="card-top">
        <span>Daily energy</span>
        <span className="tag">{labels[status]}</span>
      </div>
      <div className="energy-details">
        {energy}
        <div className="dashboard-macro-block">
          <div className="macros">{macroItems}</div>
        </div>
      </div>
      {ring}
      {status !== 'neutral' && (
        <div className="balance-message" role="status">
          {status === 'over' ? (
            <span className="balance-message-cat">
              <ChubbyCat />
            </span>
          ) : status === 'low' ? (
            <span className="balance-message-cat">
              <SkinnyCat />
            </span>
          ) : (
            <span className="balance-message-icon" aria-hidden="true">
              <CircleCheck size={16} />
            </span>
          )}
          <p>
            {status === 'over' ? (
              <>
                <strong>Above your logged goal.</strong> One day is only part of the picture.
              </>
            ) : status === 'low' ? (
              <>
                <strong>Below 80% of your goal this evening.</strong> Check for any meals you
                haven’t logged.
              </>
            ) : (
              <strong>You’ve reached your daily energy goal.</strong>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
