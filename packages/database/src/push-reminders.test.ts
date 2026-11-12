import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dueReminders,
  localClock,
  reminderMessage,
} from '../supabase/functions/nourish-push/reminders';
import { createPushHandler, type Subscription } from '../supabase/functions/nourish-push/handler';

// 12:40 UTC = 13:40 in Amsterdam (CET), inside the default 13:30 lunch window.
const lunchTime = new Date('2026-11-12T12:40:00Z');
const on = { enabled: true };

test('local clock follows the user time zone and survives a bad zone', () => {
  assert.deepEqual(localClock(lunchTime, 'Europe/Amsterdam'), {
    date: '2026-11-12',
    minutes: 13 * 60 + 40,
  });
  assert.deepEqual(localClock(lunchTime, 'Asia/Tehran').date, '2026-11-12');
  assert.equal(localClock(lunchTime, 'Not/AZone').minutes, 12 * 60 + 40);
});

test('an empty meal is due once inside its window', () => {
  const args = { now: lunchTime, timeZone: 'Europe/Amsterdam', settings: on, sent: {} };
  assert.deepEqual(dueReminders({ ...args, entries: {} }), [
    { key: '2026-11-12:Lunch', slot: 'Lunch' },
  ]);
  assert.deepEqual(dueReminders({ ...args, entries: { '2026-11-12': [{ meal: 'Lunch' }] } }), []);
  assert.deepEqual(dueReminders({ ...args, entries: {}, sent: { '2026-11-12:Lunch': true } }), []);
  // Breakfast was missed hours ago: its window has passed, so no late nag.
  assert(!dueReminders({ ...args, entries: {} }).some((r) => r.slot === 'Breakfast'));
});

test('reminders are off unless enabled, and a slot can be turned off', () => {
  const args = { now: lunchTime, timeZone: 'Europe/Amsterdam', entries: {}, sent: {} };
  assert.deepEqual(dueReminders({ ...args, settings: undefined }), []);
  assert.deepEqual(dueReminders({ ...args, settings: { enabled: true, Lunch: null } }), []);
  assert.deepEqual(
    dueReminders({ ...args, settings: { enabled: true, Lunch: '13:00' } }).length,
    1,
  );
});

test('the end-of-day nudge only fires when nothing was logged', () => {
  const night = new Date('2026-11-12T20:40:00Z'); // 21:40 in Amsterdam
  const args = { now: night, timeZone: 'Europe/Amsterdam', settings: on, sent: {} };
  assert.deepEqual(
    dueReminders({ ...args, entries: {} }).map((r) => r.slot),
    ['day'],
  );
  assert.deepEqual(dueReminders({ ...args, entries: { '2026-11-12': [{ meal: 'Snacks' }] } }), []);
});

test('messages follow the device language', () => {
  assert.match(reminderMessage('Lunch', 'en').body, /lunch/);
  assert.match(reminderMessage('Dinner', 'fa').body, /شام/);
  assert.match(reminderMessage('day', 'en').body, /Nothing logged/);
});

function setup(status = 201) {
  const subscription: Subscription = {
    endpoint: 'https://push.example/1',
    user_id: 'u1',
    p256dh: 'k',
    auth: 'a',
    time_zone: 'Europe/Amsterdam',
    locale: 'en',
    sent: { '2026-11-11:Lunch': true },
  };
  const calls = { sent: [] as string[], marked: [] as unknown[], removed: [] as string[] };
  const handler = createPushHandler(
    (key) => (key === 'CRON_SECRET' ? 'cron' : undefined),
    {
      subscriptions: async () => [subscription],
      documents: async () => new Map([['u1', { profile: { reminders: on }, entries: {} }]]),
      markSent: async (_endpoint, sent) => void calls.marked.push(sent),
      remove: async (endpoint) => void calls.removed.push(endpoint),
    },
    async (_sub, payload) => {
      calls.sent.push(payload);
      return status;
    },
    () => lunchTime,
  );
  return { handler, calls };
}
const cron = (secret = 'cron') =>
  new Request('https://db.example/functions/v1/nourish-push', {
    method: 'POST',
    headers: { 'x-cron-secret': secret },
  });

test('the push function needs the cron secret', async () => {
  const { handler, calls } = setup();
  assert.equal((await handler(cron('wrong'))).status, 403);
  assert.equal(calls.sent.length, 0);
});

test('a due reminder is sent and remembered; old days are dropped', async () => {
  const { handler, calls } = setup();
  assert.deepEqual(await (await handler(cron())).json(), { checked: 1, sent: 1 });
  assert.match(calls.sent[0], /lunch/);
  assert.deepEqual(calls.marked, [{ '2026-11-12:Lunch': true }]);
});

test('expired devices are removed', async () => {
  const { handler, calls } = setup(410);
  await handler(cron());
  assert.deepEqual(calls.removed, ['https://push.example/1']);
  assert.equal(calls.marked.length, 0);
});
