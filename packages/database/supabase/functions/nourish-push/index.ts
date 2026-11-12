import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import webpush from 'npm:web-push@3.6.7';
import { createPushHandler, type Subscription } from './handler.ts';

const env = (key: string) => Deno.env.get(key);
webpush.setVapidDetails(
  env('VAPID_SUBJECT') || 'mailto:admin@example.com',
  env('VAPID_PUBLIC_KEY') || '',
  env('VAPID_PRIVATE_KEY') || '',
);
// Server-only: the service role reads every account's document to see what was logged today.
const secretKeys = JSON.parse(env('SUPABASE_SECRET_KEYS') || '{}') as Record<string, string>;
const serviceKey = env('SUPABASE_SECRET_KEY') || Object.values(secretKeys)[0] || env('SUPABASE_SERVICE_ROLE_KEY');
const db = createClient(env('SUPABASE_URL')!, serviceKey!, {
  auth: { persistSession: false },
});

Deno.serve(
  createPushHandler(
    env,
    {
      async subscriptions() {
        const { data, error } = await db.from('nourish_push_subscriptions').select('*');
        if (error) throw error;
        return data as Subscription[];
      },
      async documents(userIds) {
        const result = new Map();
        if (!userIds.length) return result;
        const { data, error } = await db
          .from('nourish_documents')
          .select('user_id, profile:data->profile, entries:data->entries')
          .in('user_id', userIds);
        if (error) throw error;
        for (const row of data ?? []) result.set(row.user_id, row);
        return result;
      },
      async markSent(endpoint, sent) {
        await db.from('nourish_push_subscriptions').update({ sent }).eq('endpoint', endpoint);
      },
      async remove(endpoint) {
        await db.from('nourish_push_subscriptions').delete().eq('endpoint', endpoint);
      },
    },
    async (subscription, payload) => {
      try {
        const response = await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload,
          { TTL: 60 * 60, urgency: 'normal' },
        );
        return response.statusCode;
      } catch (error) {
        return (error as { statusCode?: number }).statusCode ?? 0;
      }
    },
  ),
);
