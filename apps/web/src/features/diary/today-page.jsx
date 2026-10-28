'use client';

import { useEffect, useState } from 'react';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@nourish/ui';
import { iso, today } from '@nourish/core';
import { DayStrip } from '@/features/diary/day-strip';
import { MealList } from '@/features/diary/meal-list';
import { ActivityList } from '@/features/activities/activity-list';
import { DailySummary } from '@/features/diary/daily-summary';
import { ReportIcon } from '@/components/report-icon';
export function TodayPage({
  setDay,
  profile,
  weight,
  day,
  entries,
  tot,
  setSheet,
  list,
  openAdd,
  editItem,
  deleteItem,
  moveItem,
  createTemplate,
  setMeal,
  activities,
  setActivity,
  weeklyReport,
  onWeeklyReport,
}) {
  const { accountId } = useNourishData();
  const { t, formatDate, locale } = useI18n();
  const [reportMessage, setReportMessage] = useState(false);
  const reportWeek = weeklyReport.days[0].date;
  const openedKey = `nourish:report-opened:${accountId}:${reportWeek}`;
  // The shortcut is a one-time nudge per week; afterwards the report lives under Progress.
  const [reportOpened, setReportOpened] = useState(true);
  useEffect(() => {
    try {
      setReportOpened(!!localStorage.getItem(openedKey));
    } catch {
      setReportOpened(false);
    }
  }, [openedKey]);
  function openWeeklyReport() {
    try {
      localStorage.setItem(openedKey, 'opened');
    } catch {
      /* Without storage the shortcut simply stays available. */
    }
    setReportOpened(true);
    onWeeklyReport();
  }
  useEffect(() => {
    if (!weeklyReport.ready) return;
    const key = `nourish:report-seen:${accountId}:${reportWeek}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, 'seen');
    } catch {
      /* The message can still be shown when storage is unavailable. */
    }
    setReportMessage(true);
  }, [accountId, reportWeek, weeklyReport.ready]);
  useEffect(() => {
    if (!reportMessage) return;
    const timer = setTimeout(() => setReportMessage(false), 5000);
    return () => clearTimeout(timer);
  }, [reportMessage]);
  return (
    <>
      <div className="intro today-intro">
        <div className="today-actions">
          {weeklyReport.ready && !reportOpened && (
            <span className="weekly-report-anchor">
              {reportMessage && (
                <span className="report-first-message" role="status">
                  {t('today.weeklyReportNudge')}
                </span>
              )}
              <Button
                variant="unstyled"
                className="weekly-report-shortcut"
                onClick={openWeeklyReport}
                aria-label={t('today.viewWeeklyReport')}
                title={t('today.lastWeekReady')}
              >
                <ReportIcon animated />
              </Button>
            </span>
          )}
          <Button
            className="today-shortcut"
            onClick={() => setDay(today)}
            aria-label={t('today.today')}
            variant="unstyled"
          >
            {t('today.today')}
          </Button>
        </div>
        <div className="eyebrow">{t('brand.eyebrow')}</div>
        <h1>
          {profile.name
            ? t('today.greeting', { name: profile.name })
            : t('today.greetingFallback')}
        </h1>
        <p>{t('today.subtitle')}</p>
      </div>
      <DayStrip day={day} entries={entries} goal={profile.cal} onSelect={setDay} />
      <div className="date">
        <Button
          aria-label={t('today.prevDay')}
          onClick={() => {
            let d = new Date(day + 'T12:00:00');
            d.setDate(d.getDate() - 1);
            setDay(iso(d));
          }}
          variant="unstyled"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </Button>
        <strong>
          {day === today
            ? (locale === 'fa' ? t('today.today') + '، ' : t('today.today') + ', ') +
              formatDate(day, {
                month: 'short',
                day: 'numeric',
              })
            : formatDate(day, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
        </strong>
        <Button
          aria-label={t('today.nextDay')}
          onClick={() => {
            let d = new Date(day + 'T12:00:00');
            d.setDate(d.getDate() + 1);
            setDay(iso(d));
          }}
          variant="unstyled"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </Button>
      </div>
      <DailySummary
        day={day}
        tot={tot}
        profile={profile}
        weight={weight}
        onEdit={() => setSheet('profile')}
      />
      <div className="section">
        <h2>{t('today.yourMeals')}</h2>
        <div className="meal-section-actions">
          <Button className="link" onClick={() => setSheet('meals')} variant="unstyled">
            {t('today.myMeals')}
          </Button>
          <Button className="link" onClick={() => setSheet('copy')} variant="unstyled">
            {t('today.copyDay')}
          </Button>
        </div>
      </div>
      <MealList
        day={day}
        list={list}
        profile={profile}
        onAdd={openAdd}
        onEdit={editItem}
        onDelete={deleteItem}
        onMove={moveItem}
        onSave={(m) =>
          createTemplate(
            list.filter((x) => x.meal === m),
            m + ' favorite',
          )
        }
        onView={(m) => {
          setMeal(m);
          setSheet('diary');
        }}
      />
      <ActivityList
        items={activities[day] || []}
        onAdd={() => {
          setActivity(null);
          setSheet('activity');
        }}
        onEdit={(x) => {
          setActivity(x);
          setSheet('activity');
        }}
      />
      <p className="note">{t('today.note')}</p>
    </>
  );
}
