'use client';

import { Button } from '@nourish/ui';
import { activityTypes } from '@nourish/core';
import { Icon } from '@/components/icon';
export function ActivityList({ items, onAdd, onEdit }) {
  return (
    <section className="daily-activity">
      <div className="section">
        <h2>Activity</h2>
        <Button className="link" onClick={onAdd} variant="unstyled">
          + Log activity
        </Button>
      </div>
      <div className="activity-list">
        {items.length ? (
          <>
            <div className="activity-total">
              <span>Estimated energy burned</span>
              <b>{'≈ ' + items.reduce((s, x) => s + x.cal, 0) + ' kcal'}</b>
            </div>
            {items.map((x) => (
              <Button
                className="activity-row"
                key={x.key}
                onClick={() => onEdit(x)}
                variant="unstyled"
              >
                <span className="activity-row-icon">
                  <Icon type={activityTypes.find((a) => a.id === x.type)?.icon || 'Activity'} />
                </span>
                <span className="activity-row-info">
                  <b>{x.name}</b>
                  <small>{x.minutes + ' min · ' + x.level}</small>
                </span>
                <span className="activity-row-cal">{'≈ ' + x.cal + ' kcal'}</span>
                <Icon type="Chevron" />
              </Button>
            ))}
          </>
        ) : (
          <Button className="activity-empty" onClick={onAdd} variant="unstyled">
            <Icon type="Activity" />
            <span>
              <b>A little movement goes a long way</b>
              <small>Log a workout, ride or padel session</small>
            </span>
            <Icon type="Add" />
          </Button>
        )}
      </div>
    </section>
  );
}
