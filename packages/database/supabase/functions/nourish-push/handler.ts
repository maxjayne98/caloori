import { dueReminders, localClock, reminderMessage, type ReminderSettings } from './reminders.ts';

type Env = (key: string) => string | undefined;
export interface Subscription {
  endpoint: string;
  user_id: string;
  p256dh: string;
  auth: string;
  time_zone: string;
  locale: string;
  sent: Record<string, unknown> | null;
}
interface Store {
  subscriptions(): Promise<Subscription[]>;
  documents(
    userIds: string[],
  ): Promise<
    Map<
      string,
      { profile?: { reminders?: ReminderSettings }; entries?: Record<string, { meal?: string }[]> }
    >
  >;
  markSent(endpoint: string, sent: Record<string, true>): Promise<void>;
  remove(endpoint: string): Promise<void>;
}
/** Sends one notification; returns the push service status code. */
export type Sender = (subscription: Subscription, payload: string) => Promise<number>;

/**
 * Called by pg_cron every 15 minutes with a shared secret. Never callable from a browser: no CORS,
 * no user token, and the secret is compared before any data is read.
 */
export function createPushHandler(env: Env, store: Store, send: Sender, clock = () => new Date()) {
  return async (req: Request): Promise<Response> => {
    const secret = env('CRON_SECRET');
    if (!secret) return new Response('Push reminders are not configured.', { status: 503 });
    if (req.method !== 'POST' || req.headers.get('x-cron-secret') !== secret)
      return new Response('Forbidden', { status: 403 });

    const now = clock();
    const subscriptions = await store.subscriptions();
    const documents = await store.documents([...new Set(subscriptions.map((s) => s.user_id))]);
    let sent = 0;
    for (const subscription of subscriptions) {
      const data = documents.get(subscription.user_id);
      const previous = subscription.sent ?? {};
      const due = dueReminders({
        now,
        timeZone: subscription.time_zone,
        settings: data?.profile?.reminders,
        entries: data?.entries,
        sent: previous,
      });
      if (!due.length) continue;
      // Several meals due at once (e.g. after a cron outage): send only the latest one.
      const latest = due[due.length - 1];
      const status = await send(
        subscription,
        JSON.stringify(reminderMessage(latest.slot, subscription.locale)),
      ).catch(() => 0);
      if (status === 404 || status === 410) {
        await store.remove(subscription.endpoint);
        continue;
      }
      if (status < 200 || status >= 300) continue;
      sent++;
      // Keep only today's keys so the column never grows.
      const today = localClock(now, subscription.time_zone).date;
      const next: Record<string, true> = {};
      for (const key of Object.keys(previous)) if (key.startsWith(today)) next[key] = true;
      for (const item of due) next[item.key] = true;
      await store.markSent(subscription.endpoint, next);
    }
    return Response.json({ checked: subscriptions.length, sent });
  };
}
