// Pure reminder rules, shared by the push function and its tests. No I/O here.
export const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;
export type ReminderSlot = (typeof MEALS)[number] | 'day';
export type ReminderTimes = Partial<Record<ReminderSlot, string | null>>;
export interface ReminderSettings extends ReminderTimes {
  enabled?: boolean;
}
/** Snacks have no fixed time, so they are off unless the user picks one. */
export const DEFAULT_REMINDERS: Required<ReminderTimes> = {
  Breakfast: '09:30',
  Lunch: '13:30',
  Dinner: '20:00',
  Snacks: null,
  day: '21:30',
};
// The cron runs every 15 minutes; a reminder stays due for an hour so a late run still sends it.
const WINDOW_MINUTES = 60;

/** Local date (YYYY-MM-DD) and minutes since midnight in the user's time zone. */
export function localClock(now: Date, timeZone: string) {
  let zone = timeZone;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
  } catch {
    zone = 'UTC';
  }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function toMinutes(time: string | null | undefined) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time ?? '');
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return minutes < 24 * 60 ? minutes : null;
}

/**
 * Which reminders are due now: a meal whose time has come and that is still empty today, or the
 * end-of-day nudge when nothing was logged at all. Each fires at most once a day (`sent`).
 */
export function dueReminders({
  now,
  timeZone,
  settings,
  entries,
  sent,
}: {
  now: Date;
  timeZone: string;
  settings: ReminderSettings | null | undefined;
  entries: Record<string, readonly { meal?: string }[]> | null | undefined;
  sent: Record<string, unknown>;
}): { key: string; slot: ReminderSlot }[] {
  if (!settings?.enabled) return [];
  const { date, minutes } = localClock(now, timeZone);
  const today = entries?.[date] ?? [];
  const due: { key: string; slot: ReminderSlot }[] = [];
  for (const slot of [...MEALS, 'day'] as ReminderSlot[]) {
    const time = toMinutes(slot in settings ? settings[slot] : DEFAULT_REMINDERS[slot]);
    if (time === null || minutes < time || minutes >= time + WINDOW_MINUTES) continue;
    const key = `${date}:${slot}`;
    if (sent[key]) continue;
    const empty = slot === 'day' ? today.length === 0 : !today.some((item) => item.meal === slot);
    if (empty) due.push({ key, slot });
  }
  return due;
}

const COPY = {
  en: {
    title: 'Nourish',
    meal: (meal: string) => `Time to log your ${meal.toLowerCase()}. It only takes a moment.`,
    day: 'Nothing logged today yet. Add what you ate before the day ends.',
    meals: { Breakfast: 'breakfast', Lunch: 'lunch', Dinner: 'dinner', Snacks: 'snacks' },
  },
  fa: {
    title: 'Nourish',
    meal: (meal: string) => `وقت ثبت ${meal} است. فقط یک لحظه طول می‌کشد.`,
    day: 'امروز هنوز چیزی ثبت نکرده‌اید. قبل از تمام شدن روز، خوراکی‌هایتان را اضافه کنید.',
    meals: { Breakfast: 'صبحانه', Lunch: 'ناهار', Dinner: 'شام', Snacks: 'میان‌وعده' },
  },
} as const;

export function reminderMessage(slot: ReminderSlot, locale: string) {
  const copy = COPY[locale === 'fa' ? 'fa' : 'en'];
  return {
    title: copy.title,
    body: slot === 'day' ? copy.day : copy.meal(copy.meals[slot]),
    url: '/#today',
    tag: `nourish-${slot}`,
  };
}
