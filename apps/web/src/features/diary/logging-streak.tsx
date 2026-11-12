'use client';
import { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';
import { getLoggingStreak, type Diary } from '@nourish/core';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';
import { RollingNumber } from '@/components/rolling-number';

type StreakCelebrationProgress = {
  accountId: string;
  streak: number;
  remaining: number;
};

export function LoggingStreak({ entries, today }: { entries: Diary; today: string }) {
  const streak = getLoggingStreak(entries, today);
  const { accountId } = useNourishData();
  const { t } = useI18n();
  const processedOpen = useRef('');
  const progress = useRef<StreakCelebrationProgress | null>(null);
  const [celebration, setCelebration] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  useEffect(() => {
    const open = `${accountId}:${streak}`;
    if (processedOpen.current === open) return;
    processedOpen.current = open;
    const key = `nourish:streak-seen:${accountId}`;
    let saved =
      progress.current?.accountId === accountId
        ? { streak: progress.current.streak, remaining: progress.current.remaining }
        : null;
    try {
      if (!saved) {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          try {
            const parsed: unknown = JSON.parse(stored);
            if (typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 0) {
              saved = { streak: parsed, remaining: 0 };
            } else if (
              typeof parsed === 'object' &&
              parsed !== null &&
              'streak' in parsed &&
              'remaining' in parsed &&
              typeof parsed.streak === 'number' &&
              typeof parsed.remaining === 'number' &&
              Number.isInteger(parsed.streak) &&
              Number.isInteger(parsed.remaining) &&
              parsed.streak >= 0 &&
              parsed.remaining >= 0 &&
              parsed.remaining <= 4
            ) {
              saved = { streak: parsed.streak, remaining: parsed.remaining };
            }
          } catch {
            const legacyStreak = Number(stored);
            if (Number.isInteger(legacyStreak) && legacyStreak >= 0)
              saved = { streak: legacyStreak, remaining: 0 };
          }
        }
      }
    } catch {
      // Fall back to in-memory progress when storage is unavailable.
    }
    saved ??= { streak, remaining: 0 };

    let next: StreakCelebrationProgress;
    let shouldCelebrate = false;
    if (streak > saved.streak) {
      next = { accountId, streak, remaining: 4 };
      shouldCelebrate = true;
    } else if (streak === saved.streak && streak > 0 && saved.remaining > 0) {
      next = { accountId, streak, remaining: saved.remaining - 1 };
      shouldCelebrate = true;
    } else {
      next = { accountId, streak, remaining: 0 };
    }
    progress.current = next;
    try {
      localStorage.setItem(key, JSON.stringify({ streak: next.streak, remaining: next.remaining }));
    } catch {
      // The celebration still works for the current app session.
    }
    if (shouldCelebrate) {
      setCelebration((value) => value + 1);
      setCelebrating(true);
    }
  }, [streak, accountId]);
  useEffect(() => {
    if (!celebrating) return;
    const timer = setTimeout(() => setCelebrating(false), 3700);
    return () => clearTimeout(timer);
  }, [celebrating, celebration]);
  return (
    <div
      className={`logging-streak${streak ? ' is-active' : ''}${celebrating ? ' is-celebrating' : ''}`}
      role="status"
      aria-label={`${t('streak.label', { count: streak })}${celebrating ? t('streak.celebrateAppend') : ''}`}
      title={t('streak.title')}
    >
      <Flame key={celebration} aria-hidden="true" size={19} strokeWidth={1.8} />
      <RollingNumber value={streak} />
      {process.env.NODE_ENV === 'development' && (
        <button
          type="button"
          className="streak-preview"
          aria-label="Preview streak animation"
          title="Preview streak animation"
          onClick={() => {
            setCelebration((value) => value + 1);
            setCelebrating(true);
          }}
        >
          Test
        </button>
      )}
      {celebrating && (
        <div key={celebration} className="streak-celebration" aria-hidden="true">
          <div className="streak-fire" aria-hidden="true">
            <svg viewBox="0 0 32 40" width="27" height="34" fill="none">
              <path
                className="fire-body"
                d="M17 2C19 11 27 13 27 23C27 31 22 37 16 37C8 37 4 32 4 25C4 20 7 16 10 13C9 18 11 20 13 21C12 13 17 9 17 2Z"
                fill="#F58A24"
              />
              <path
                className="fire-heart"
                d="M17 14C18 20 23 22 22 28C22 33 19 36 16 36C11 36 8 32 9 28C9 25 11 23 12 22C12 26 14 27 15 27C14 22 17 19 17 14Z"
                fill="#FFD264"
              />
              <path
                className="fire-core"
                d="M16 26C17 29 20 30 19 33C19 35 18 36 16 36C13 36 12 34 13 32C13 30 15 29 16 26Z"
                fill="#FFF2C2"
              />
            </svg>
          </div>
          <span className="streak-cheer">{t('streak.cheer', { count: streak })}</span>
        </div>
      )}
    </div>
  );
}
