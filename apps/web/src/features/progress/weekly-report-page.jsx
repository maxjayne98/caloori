'use client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@nourish/ui';
import { RollingNumber } from '@/components/rolling-number';

const dateLabel = (date) =>
  new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export function WeeklyReportPage({ report, onBack }) {
  const max = Math.max(1, ...report.days.flatMap((day) => [day.intake, day.goal || 0]));
  return (
    <section className="weekly-report-page">
      <Button variant="unstyled" className="link" onClick={onBack}>
        <ArrowLeft size={16} /> Today
      </Button>
      <div className="intro">
        <div className="eyebrow">YOUR WEEK IN REVIEW</div>
        <h1>A week of you.</h1>
        <p>
          {dateLabel(report.days[0].date)} – {dateLabel(report.days[6].date)}
        </p>
      </div>
      {!report.ready ? (
        <div className="card">
          <h2>No report yet</h2>
          <p>
            Your report appears here once the previous week has food, activity or weight records.
          </p>
        </div>
      ) : (
        <>
          <section className="card">
            <div className="card-top">
              <span>Food energy</span>
              <span className="tag">{report.loggedDays}/7 DAYS LOGGED</span>
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
                    {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
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
            <h2>Movement</h2>
            <div className="weekly-stats">
              <div>
                <strong>{report.sessions}</strong>
                <small>Sessions</small>
              </div>
              <div>
                <strong>{Math.round(report.minutes)}</strong>
                <small>Minutes</small>
              </div>
              <div>
                <strong>{Math.round(report.burned).toLocaleString('en-US')}</strong>
                <small>Estimated kcal</small>
              </div>
            </div>
            <p className="weekly-caption">Exercise energy is tracked separately from food.</p>
          </section>
          <section className="card">
            <h2>Body weight</h2>
            {report.checkIns.length ? (
              <>
                <div className="weekly-average">
                  {report.checkIns.at(-1).weight}
                  <small> kg · latest this week</small>
                </div>
                <p>
                  {report.checkIns.length > 1
                    ? `${Math.abs(report.checkIns.at(-1).weight - report.checkIns[0].weight).toFixed(1)} kg ${report.checkIns.at(-1).weight >= report.checkIns[0].weight ? 'increase' : 'decrease'} between first and last check-in.`
                    : 'One check-in this week. More check-ins help show a trend.'}
                </p>
              </>
            ) : (
              <p>No weight check-ins this week.</p>
            )}
          </section>
        </>
      )}
    </section>
  );
}
