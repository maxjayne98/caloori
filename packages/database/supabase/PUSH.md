# Meal reminders (Web Push)

Reminders arrive even when Nourish is closed. On iPhone (iOS 16.4+) they work only when Nourish is
opened from the Home Screen (Share → Add to Home Screen).

1. Create VAPID keys once: `npx web-push generate-vapid-keys`.
2. Function secrets (Supabase → Edge Functions → Secrets):
   `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (e.g. `mailto:you@example.com`), and
   `CRON_SECRET` (any long random string). `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied
   by Supabase; the service role stays inside the function and is never sent to a browser.
3. Vault secrets (SQL editor):
   `select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');`
   `select vault.create_secret('<same CRON_SECRET>', 'push_cron_secret');`
4. Run migration `0004_push_reminders.sql` (creates the table and the 15-minute cron job).
5. Deploy: `supabase functions deploy nourish-push`.
6. Web app: set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to the public key and rebuild.

Rules live in `functions/nourish-push/reminders.ts` and are tested in
`packages/database/src/push-reminders.test.ts`: a meal reminder fires within an hour after its time
if that meal is empty today; the end-of-day reminder fires only when nothing was logged. Each fires
at most once per day per device. Expired devices (404/410) are removed automatically.
