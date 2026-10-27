'use client';

import { useEffect, useState } from 'react';
import { useNourishData } from '@/providers/data-provider';
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
                  Your week called. You showed up!
                </span>
              )}
              <Button
                variant="unstyled"
                className="weekly-report-shortcut"
                onClick={openWeeklyReport}
                aria-label="View last week’s report"
                title="Last week’s report is ready"
              >
                <ReportIcon animated />
              </Button>
            </span>
          )}
          <Button
            className="today-shortcut"
            onClick={() => setDay(today)}
            aria-label="Return to today"
            variant="unstyled"
          >
            Today
          </Button>
        </div>
        <div className="eyebrow">A LITTLE MORE MINDFUL</div>
        <h1>{profile.name ? 'Hi, ' + profile.name + '.' : 'Make room for you.'}</h1>
        <p>Small choices. A healthier everyday.</p>
      </div>
      <DayStrip day={day} entries={entries} goal={profile.cal} onSelect={setDay} />
      <div className="date">
        <Button
          aria-label="Previous day"
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
            ? 'Today, ' +
              new Date(day + 'T12:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            : new Date(day + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
        </strong>
        <Button
          aria-label="Next day"
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
      <DailySummary day={day} tot={tot} profile={profile} onEdit={() => setSheet('profile')} />
      <div className="section">
        <h2>Your meals</h2>
        <div className="meal-section-actions">
          <Button className="link" onClick={() => setSheet('meals')} variant="unstyled">
            My meals
          </Button>
          <Button className="link" onClick={() => setSheet('copy')} variant="unstyled">
            Copy day
          </Button>
        </div>
      </div>
      <MealList
        day={day}
        list={list}
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
      <p className="note">A little progress, every day.</p>
    </>
  );
}
