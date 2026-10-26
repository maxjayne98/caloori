'use client';

import { Button } from '@nourish/ui';
import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { ModalSheet } from '@/components/modal-sheet';
import { DateCalendar } from './date-calendar';
import { iso, today } from '@nourish/core';
export function DayStrip({ day, entries, goal, onSelect }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedDate = new Date(day + 'T12:00:00'),
    nowDate = new Date(today + 'T12:00:00'),
    diff = Math.round((nowDate - selectedDate) / 86400000),
    base = diff >= 0 && diff < 7 ? nowDate : selectedDate;
  return (
    <div className="day-strip has-calendar" aria-label="Daily calorie history">
      <Button
        variant="unstyled"
        className="day-button calendar-trigger"
        aria-label="Open calendar"
        aria-haspopup="dialog"
        aria-expanded={calendarOpen}
        onClick={() => setCalendarOpen(true)}
      >
        <span className="day-ring calendar-ring">
          <CalendarDays aria-hidden="true" size={19} />
        </span>
      </Button>
      {calendarOpen && (
        <ModalSheet title="Choose a day" onClose={() => setCalendarOpen(false)}>
          <DateCalendar
            day={day}
            today={today}
            entries={entries}
            onSelect={(date) => {
              onSelect(date);
              setCalendarOpen(false);
            }}
          />
        </ModalSheet>
      )}
      {Array.from(
        {
          length: 7,
        },
        (_, i) => {
          let d = new Date(base);
          d.setDate(d.getDate() + i - 6);
          let key = iso(d),
            cal = (entries[key] || []).reduce((v, x) => v + x.cal * x.qty, 0),
            ratio = goal > 0 ? Math.min(cal / goal, 1) : 0;
          return (
            <Button
              key={key}
              className={
                'day-button' + (key === day ? ' selected' : '') + (key === today ? ' is-today' : '')
              }
              aria-label={
                d.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                }) +
                ', ' +
                Math.round(cal) +
                ' calories'
              }
              aria-pressed={key === day}
              aria-current={key === today ? 'date' : undefined}
              onClick={() => onSelect(key)}
              variant="unstyled"
            >
              <span className="day-ring">
                <svg viewBox="0 0 48 48">
                  <circle
                    cx={24}
                    cy={24}
                    r={20}
                    fill="none"
                    stroke="var(--neutral-e8e8ed)"
                    strokeWidth={3}
                  />
                  <circle
                    cx={24}
                    cy={24}
                    r={20}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={125.66}
                    strokeDashoffset={125.66 * (1 - ratio)}
                  />
                </svg>
                <b>{d.getDate()}</b>
              </span>
            </Button>
          );
        },
      )}
    </div>
  );
}
