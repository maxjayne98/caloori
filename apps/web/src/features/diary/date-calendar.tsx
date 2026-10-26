'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input } from '@nourish/ui';
import { monthCells, shiftMonth, hasFoodLog, type Diary } from '@nourish/core';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export function DateCalendar({
  day,
  today,
  entries,
  onSelect,
}: {
  day: string;
  today: string;
  entries: Diary;
  onSelect: (date: string) => void;
}) {
  const [month, setMonth] = useState(day.slice(0, 7));
  const label = new Date(`${month}-01T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  return (
    <div className="date-calendar">
      <div className="calendar-navigation">
        <Button
          variant="unstyled"
          aria-label="Previous month"
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          <ChevronLeft size={19} aria-hidden="true" />
        </Button>
        <div className="calendar-month-picker">
          <label htmlFor="calendar-month">{label}</label>
          <Input
            unstyled
            id="calendar-month"
            type="month"
            aria-label="Choose calendar month"
            value={month}
            min="1900-01"
            max="2100-12"
            onChange={(event) => {
              if (/^\d{4}-\d{2}$/.test(event.target.value)) setMonth(event.target.value);
            }}
          />
        </div>
        <Button
          variant="unstyled"
          aria-label="Next month"
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          <ChevronRight size={19} aria-hidden="true" />
        </Button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="calendar-grid" role="group" aria-label={label}>
        {monthCells(month).map((date, index) =>
          date ? (
            <Button
              key={date}
              variant="unstyled"
              className={`calendar-day${date === day ? ' is-selected' : ''}${date === today ? ' is-today' : ''}${hasFoodLog(entries, date) ? ' has-log' : ''}`}
              aria-label={new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              aria-pressed={date === day}
              aria-current={date === today ? 'date' : undefined}
              onClick={() => onSelect(date)}
            >
              <span>{Number(date.slice(-2))}</span>
              {hasFoodLog(entries, date) && <i className="calendar-log-dot" aria-hidden="true" />}
            </Button>
          ) : (
            <span key={`blank-${index}`} />
          ),
        )}
      </div>
      <div className="calendar-footer">
        <span>
          <i aria-hidden="true" />
          Food logged
        </span>
        <Button variant="unstyled" className="link" onClick={() => onSelect(today)}>
          Go to today
        </Button>
      </div>
    </div>
  );
}
