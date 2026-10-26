'use client';
import { Flame } from 'lucide-react';
import { getLoggingStreak, type Diary } from '@nourish/core';

export function LoggingStreak({ entries, today }: { entries: Diary; today: string }) {
  const streak = getLoggingStreak(entries, today);
  return (
    <div
      className={`logging-streak${streak ? ' is-active' : ''}`}
      role="status"
      aria-label={`${streak}-day food logging streak`}
      title="Consecutive days of food logging"
    >
      <Flame aria-hidden="true" size={19} strokeWidth={1.8} />
      <span>{streak}</span>
    </div>
  );
}
