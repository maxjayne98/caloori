'use client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@nourish/ui';
import { RollingNumber } from '@/components/rolling-number';
import { useI18n } from '@/providers/i18n-provider';

export function WeeklyReportPage({ report, onBack }) {
  const { t, formatDate } = useI18n();
  const dateLabel = (date) => formatDate(date, { month: 'short', day: 'numeric' });
  const max = Math.max(1, ...report.days.flatMap((day) => [day.intake, day.goal || 0]));
  return (
    <section className="weekly-report-page">
      <div className="intro">
        <div className="eyebrow">{t('weekly.reviewEyebrow')}</div>
        <h1>{t('weekly.reviewTitle')}</h1>
        <p>
          {dateLabel(report.days[0].date)} – {dateLabel(report.days[6].date)}
        </p>
      </div>
      {!report.ready ? (
        <div className="card">
          <h2>{t('weekly.noReport')}</h2>
          <p>{t('weekly.noReportDesc')}</p>
        </div>
      ) : (
        <>
          <section className="card">
            <div className="card-top">
              <span>{t('weekly.foodEnergy')}</span>
              <span className="tag">
                {report.loggedDays}/7 {t('weekly.daysLogged')}
              </span>
            </div>
            <div className="weekly-average">
              {report.average === null ? '—' : <RollingNumber value={Math.round(report.average)} />}{' '}
              <small>kcal / logged day</small>
            </div>
            <div className="weekly-bars" aria-label="Daily food energy and recorded goals">
              {report.days.map((day) => (
                <div className="weekly-bar-day" key={day.date}>
                  <span className="weekly-bar-value">
                    {day.hasFood ? Math.round(day.intake).toLocaleString('en-US') : '—'}
                  </span>
                  <div className="weekly-bar-track">
                    {day.hasFood && <i style={{ height: `${(day.intake / max) * 100}%` }} />}
                    {day.goal > 0 && (
                      <b
                        title={`Recorded goal: ${day.goal} kcal`}
                        style={{ bottom: `${(day.goal / max) * 100}%` }}
                      />
                    )}
                  </div>
                  <small>
                    {formatDate(day.date, {
                      weekday: 'short',
                    })}
                  </small>
                </div>
              ))}
            </div>
            <p className="weekly-caption">
              Bars: logged calories · Dashes: goals recorded that day.
            </p>
            <p>
              {report.averageDifference === null
                ? 'No historical goals available for comparison.'
                : `${Math.round(Math.abs(report.averageDifference)).toLocaleString('en-US')} kcal ${report.averageDifference > 0 ? 'above' : report.averageDifference < 0 ? 'below' : 'from'} goal on average across ${report.comparedDays} comparable days.`}
            </p>
            <p className="weekly-caption">
              Unlogged days are missing data, not zero intake. Averages include logged days only.
            </p>
          </section>
          <section className="card">
            <h2>{t('weekly.movement')}</h2>
            <div className="weekly-stats">
              <div>
                <strong>{report.sessions}</strong>
                <small>{t('weekly.sessions')}</small>
              </div>
              <div>
                <strong>{Math.round(report.minutes)}</strong>
                <small>{t('weekly.minutes')}</small>
              </div>
              <div>
                <strong>{Math.round(report.burned).toLocaleString('en-US')}</strong>
                <small>{t('weekly.estKcal')}</small>
              </div>
            </div>
            <p className="weekly-caption">Exercise energy is tracked separately from food.</p>
          </section>
          <section className="card">
            <h2>{t('weekly.bodyWeight')}</h2>
            {report.checkIns.length ? (
              <>
                <div className="weekly-average">
                  {report.checkIns.at(-1).weight}
                  <small> kg · {t('weekly.latestThisWeek')}</small>
                </div>
                <p>
                  {report.checkIns.length > 1
                    ? `${Math.abs(report.checkIns.at(-1).weight - report.checkIns[0].weight).toFixed(1)} kg ${report.checkIns.at(-1).weight >= report.checkIns[0].weight ? 'increase' : 'decrease'} between first and last check-in.`
                    : 'One check-in this week. More check-ins help show a trend.'}
                </p>
              </>
            ) : (
              <p>{t('weekly.noWeight')}</p>
            )}
          </section>
        </>
      )}
    </section>
  );
}
