'use client';

import { Button } from '@nourish/ui';
import { activityTypes } from '@nourish/core';
import { Icon } from '@/components/icon';
import { useI18n } from '@/providers/i18n-provider';
export function ActivityList({ items, onAdd, onEdit }) {
  const { t } = useI18n();
  return (
    <section className="daily-activity">
      <div className="section">
        <h2>{t('activity.title')}</h2>
        <Button className="link" onClick={onAdd} variant="unstyled">
          {t('activity.logButton')}
        </Button>
      </div>
      <div className="activity-list">
        {items.length ? (
          <>
            <div className="activity-total">
              <span>{t('activity.burned')}</span>
              <b>{'≈ ' + items.reduce((s, x) => s + x.cal, 0) + ' ' + t('common.kcal')}</b>
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
                  <b>{t(('activity.' + x.type)) || x.name}</b>
                  <small>
                    {x.minutes +
                      ' min · ' +
                      (x.level === 'Light'
                        ? t('activity.light')
                        : x.level === 'Moderate'
                          ? t('activity.moderate')
                          : t('activity.hard'))}
                  </small>
                </span>
                <span className="activity-row-cal">{'≈ ' + x.cal + ' ' + t('common.kcal')}</span>
                <Icon type="Chevron" />
              </Button>
            ))}
          </>
        ) : (
          <Button className="activity-empty" onClick={onAdd} variant="unstyled">
            <Icon type="Activity" />
            <span>
              <b>{t('activity.emptyTitle')}</b>
              <small>{t('activity.emptySubtitle')}</small>
            </span>
            <Icon type="Add" />
          </Button>
        )}
      </div>
    </section>
  );
}
