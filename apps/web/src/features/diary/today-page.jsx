'use client';

import { useEffect, useState } from 'react';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@nourish/ui';
import {
  iso,
  today,
  moveTodaySection,
  normalizeTodayLayout,
  toggleTodaySection,
} from '@nourish/core';
import { DayStrip } from '@/features/diary/day-strip';
import { MealList } from '@/features/diary/meal-list';
import { ActivityList } from '@/features/activities/activity-list';
import { DailySummary } from '@/features/diary/daily-summary';
import { ReportIcon } from '@/components/report-icon';
import { TodaySectionFrame } from '@/features/diary/today-section-frame';
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
  editing,
  setEditing,
}) {
  const { accountId, setProfile } = useNourishData();
  const layout = normalizeTodayLayout(profile.todayLayout);
  const saveLayout = (next) =>
    setProfile((previous) => ({
      ...previous,
      todayLayout: next.map(({ id, hidden }) => (hidden ? { id, hidden } : { id })),
    }));
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
  // Header actions live in the greeting. If it's hidden, "Today" moves above the calendar icon
  // and the report nudge shrinks into the date row. In edit mode only a Done bar shows.
  const isVisible = (id) => !layout.find((section) => section.id === id)?.hidden;
  const greetingShown = !editing && isVisible('greeting');
  const reportCompact = !editing && !greetingShown && weeklyReport.ready && !reportOpened && (
    <Button
      variant="unstyled"
      className="grid size-7 place-items-center rounded-full bg-[var(--surface)] text-[var(--accent-text)] [&_svg]:size-4"
      onClick={openWeeklyReport}
      aria-label={t('today.viewWeeklyReport')}
      title={t('today.lastWeekReady')}
    >
      <ReportIcon />
    </Button>
  );
  // Today sections in the user's saved order; the greeting header and footer note stay fixed.
  const sections = {
    greeting: (
      <div className="intro today-intro">
        {greetingShown && (
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
        )}
        <div className="eyebrow">{t('brand.eyebrow')}</div>
        <h1>
          {profile.name ? t('today.greeting', { name: profile.name }) : t('today.greetingFallback')}
        </h1>
        <p>{t('today.subtitle')}</p>
      </div>
    ),
    days: (
      <>
        <DayStrip
          day={day}
          entries={entries}
          goal={profile.cal}
          onSelect={setDay}
          onToday={!greetingShown && !editing ? () => setDay(today) : undefined}
        />
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
          {reportCompact}
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
      </>
    ),
    summary: (
      <>
        <DailySummary
          day={day}
          tot={tot}
          profile={profile}
          weight={weight}
          onEdit={() => setSheet('profile')}
        />
      </>
    ),
    meals: (
      <>
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
      </>
    ),
    activity: (
      <>
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
      </>
    ),
  };
  return (
    <>
      {editing && (
        <div className="mb-2 flex justify-end">
          <Button
            variant="unstyled"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white"
            onClick={() => setEditing(false)}
          >
            <Check size={14} aria-hidden="true" />
            {t('today.doneEditing')}
          </Button>
        </div>
      )}
      {layout.map((section, index) => (
        <TodaySectionFrame
          key={section.id}
          label={t(`today.section.${section.id}`)}
          editing={editing}
          hidden={section.hidden}
          first={index === 0}
          last={index === layout.length - 1}
          onMove={(step) => saveLayout(moveTodaySection(layout, section.id, step))}
          onToggle={() => saveLayout(toggleTodaySection(layout, section.id))}
        >
          {sections[section.id]}
        </TodaySectionFrame>
      ))}
      <p className="note">{t('today.note')}</p>
    </>
  );
}
