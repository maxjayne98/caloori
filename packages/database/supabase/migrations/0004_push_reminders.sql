-- Web Push subscriptions for meal reminders. One row per device; the browser keys here are
-- public push-channel keys, not credentials. Only the owner can add or remove their devices.
create table if not exists public.nourish_push_subscriptions (
  endpoint text primary key check (endpoint ~ '^https://' and length(endpoint) <= 1000),
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null check (length(p256dh) <= 200),
  auth text not null check (length(auth) <= 100),
  time_zone text not null default 'UTC' check (length(time_zone) <= 64),
  locale text not null default 'en' check (locale in ('en', 'fa')),
  -- Reminder keys already sent, e.g. {"2026-11-12:Lunch": true}; only today's are kept.
  sent jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists nourish_push_subscriptions_user on public.nourish_push_subscriptions(user_id);
alter table public.nourish_push_subscriptions enable row level security;
revoke all on public.nourish_push_subscriptions from public, anon, authenticated;
grant select, insert, update, delete on public.nourish_push_subscriptions to authenticated;
create policy "Manage only my own push devices"
  on public.nourish_push_subscriptions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Every 15 minutes the reminder function checks who has an empty meal at its reminder time.
-- Needs the pg_cron and pg_net extensions and two Vault secrets: project_url and push_cron_secret
-- (the same value as the function's CRON_SECRET). See supabase/PUSH.md.
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('nourish-push-reminders')
  where exists (select 1 from cron.job where jobname = 'nourish-push-reminders');
select cron.schedule(
  'nourish-push-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/nourish-push',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'push_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
