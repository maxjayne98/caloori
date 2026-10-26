'use client';

import { Button } from '@nourish/ui';
import { iso, today } from '@nourish/core';
import { DayStrip } from '@/features/diary/day-strip';
import { MealList } from '@/features/diary/meal-list';
import { ActivityList } from '@/features/activities/activity-list';
import { DailySummary } from '@/features/diary/daily-summary';
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
}) {
  return (
    <>
      <div className="intro today-intro">
        <Button
          className="today-shortcut"
          onClick={() => setDay(today)}
          aria-label="Return to today"
          variant="unstyled"
        >
          Today
        </Button>
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
          ‹
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
          ›
        </Button>
      </div>
      <DailySummary tot={tot} profile={profile} onEdit={() => setSheet('profile')} />
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
