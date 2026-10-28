'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input } from '@nourish/ui';
import { monthCells, shiftMonth, hasFoodLog, type Diary } from '@nourish/core';
import { useI18n } from '@/providers/i18n-provider';

const weekdaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekdaysFa = ['د', 'س', 'چ', 'پ', 'ج', 'ش', 'ی'];

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
  const { t, formatDate, locale } = useI18n();
  const [month, setMonth] = useState(day.slice(0, 7));
  const label = formatDate(`${month}-01`, {
    month: 'long',
    year: 'numeric',
  });
  const weekdays = locale === 'fa' ? weekdaysFa : weekdaysEn;
  return (
    <div className="date-calendar">
      <div className="calendar-navigation">
        <Button
          variant="unstyled"
          aria-label={t('calendar.prevMonth')}
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
          aria-label={t('calendar.nextMonth')}
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          <ChevronRight size={19} aria-hidden="true" />
        </Button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {weekdays.map((weekday, i) => (
          <span key={i}>{weekday}</span>
        ))}
      </div>
      <div className="calendar-grid" role="group" aria-label={label}>
        {monthCells(month).map((date, index) =>
          date ? (
            <Button
              key={date}
              variant="unstyled"
              className={`calendar-day${date === day ? ' is-selected' : ''}${date === today ? ' is-today' : ''}${hasFoodLog(entries, date) ? ' has-log' : ''}`}
              aria-label={formatDate(date, {
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
          {t('calendar.foodLogged')}
        </span>
        <Button variant="unstyled" className="link" onClick={() => onSelect(today)}>
          {t('calendar.goToToday')}
        </Button>
      </div>
    </div>
  );
}
