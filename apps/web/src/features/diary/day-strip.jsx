'use client';

import { Button } from '@nourish/ui';
import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { ModalSheet } from '@/components/modal-sheet';
import { DateCalendar } from './date-calendar';
import { iso, today, savedDayGoal } from '@nourish/core';
import { useI18n } from '@/providers/i18n-provider';
export function DayStrip({ day, entries, goal, onSelect }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { t, locale } = useI18n();
  // fa-IR gives Persian weekday names; en-US gives English.
  const dateLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
  const selectedDate = new Date(day + 'T12:00:00'),
    nowDate = new Date(today + 'T12:00:00'),
    diff = Math.round((nowDate - selectedDate) / 86400000),
    base = diff >= 0 && diff < 7 ? nowDate : selectedDate;
  return (
    <div className="day-strip has-calendar" aria-label="Daily calorie history">
      <div className="relative grid">
        <Button
          variant="unstyled"
          className="day-button calendar-trigger"
          aria-label={t('calendar.chooseDay')}
          aria-haspopup="dialog"
          aria-expanded={calendarOpen}
          onClick={() => setCalendarOpen(true)}
        >
          <span className="day-ring calendar-ring">
            <CalendarDays aria-hidden="true" size={19} />
          </span>
          <span className="day-weekday" aria-hidden="true">
            {t('common.date')}
          </span>
        </Button>
      </div>
      {calendarOpen && (
        <ModalSheet title={t('calendar.chooseDay')} onClose={() => setCalendarOpen(false)}>
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
            foods = entries[key] || [],
            cal = foods.reduce((v, x) => v + x.cal * x.qty, 0),
            dayGoal = savedDayGoal(foods) ?? (key === today ? goal : null),
            overGoal = dayGoal > 0 && cal > dayGoal,
            // Finished days that ended well under goal get a soft blue ring.
            lowGoal = key < today && dayGoal > 0 && cal > 0 && cal < dayGoal * 0.8,
            ratio = dayGoal > 0 ? Math.min(cal / dayGoal, 1) : 0;
          return (
            <Button
              key={key}
              className={
                'day-button' +
                (key === day ? ' selected' : '') +
                (key === today ? ' is-today' : '') +
                (overGoal ? ' over-goal' : '') +
                (lowGoal ? ' low-goal' : '')
              }
              aria-label={
                d.toLocaleDateString(dateLocale, {
                  month: 'long',
                  day: 'numeric',
                }) +
                ', ' +
                Math.round(cal) +
                ' ' +
                t('common.kcal') +
                (overGoal ? ', ' + t('summary.balanceOver') : '') +
                (lowGoal ? ', ' + t('progress.noFoodLogged') : '')
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
                    stroke={overGoal ? '#ff6a00' : lowGoal ? '#7fb2f2' : 'var(--accent)'}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={125.66}
                    strokeDashoffset={125.66 * (1 - ratio)}
                  />
                </svg>
                {/* Day number: always LTR so Persian calendar digits don't reverse */}
                <b dir="ltr">{d.toLocaleDateString(dateLocale, { day: 'numeric' })}</b>
              </span>
              <span className="day-weekday" aria-hidden="true">
                {d.toLocaleDateString(dateLocale, { weekday: 'short' })}
              </span>
            </Button>
          );
        },
      )}
    </div>
  );
}
