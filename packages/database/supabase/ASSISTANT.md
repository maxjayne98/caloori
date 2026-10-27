# Nourish assistant

The web app calls the authenticated `nourish-assistant` Edge Function. It returns a proposal only. Confirmed changes are validated by `@nourish/core` and saved through the existing revision-checked, user-scoped repository. No model has direct database access. New foods go to `custom` / My foods and its persistent cache, not the diary. Logging and goal updates are separate actions.

## Activation

1. Apply `migrations/0003_assistant_quota.sql` to the existing project. It stores per-account counters only (20 requests/hour, 100/day), with no table privileges for browser roles. RLS is enabled.
2. From `packages/database` (the parent of this directory), deploy `supabase functions deploy nourish-assistant --project-ref fmmilbqwqdisqfltnmep`. The function itself calls Supabase Auth with the caller's Bearer token and rejects invalid/expired tokens before invoking Gemini. Never remove that check. The owner approved disabling the legacy gateway JWT check on 2026-10-27. `verify_jwt = false` is configured locally and in the dashboard; the handler-based token check remains mandatory.
3. In Supabase → Edge Functions → Secrets, add `GEMINI_API_KEY`. Do not add it to Next.js, a `NEXT_PUBLIC_` variable, Git, a screenshot, or chat. A paid billing account is not required for an eligible free-tier model; free quotas are provider-controlled.
4. Optional secrets: `GEMINI_MODEL` (default `gemini-3.5-flash-lite`), `ALLOWED_ORIGINS` (comma-separated; defaults to `https://caloori.pages.dev,http://localhost:5174`). Keep this allowlist exact. Supabase supplies `SUPABASE_URL` and `SUPABASE_ANON_KEY` in hosted functions. No service-role key is used.
5. Test sign-in, a conversation, a food proposal, a log proposal, and goal confirmation. Verify a second account cannot access the first account's document. Live Gemini output is not tested until a key is configured.

## Privacy and behavior

Only messages from the last ten turns, current nutrition/weight-direction goals, the selected date, and up to 400 food records are sent when the user presses Send. Name, email, age, height, weight, diary, weigh-ins and workouts are excluded from the automatic context. The user can still type personal information in a message. Google processes the supplied content under its API terms; free-tier data handling differs from paid tiers. Chat is held in component memory and is cleared when leaving the page or signing out. Do not log request bodies or provider errors.

Only `create_food`, `log_food`, and `update_goals` are supported. All writes require review, strict validation, a current-state check and a successful database save. No SQL, URL fetching, deletion, scripts, or arbitrary function calls are available to the model. Estimated food nutrition is marked in the review and stored with `nutritionEstimated: true`. An existing food is reused instead of duplicated. Raw/cooked preparation should be clarified. No internet food lookup/grounding is enabled; estimates are not verified nutrition data.

## Verification

Run `node --import tsx --test packages/core/src/*.test.ts packages/database/src/*.test.ts` from the monorepo root. Tests cover auth failure, origin checks, missing-key setup, quota rejection, malformed output, secret isolation, food creation, duplicate prevention, quantities, historical goals and private-context minimization. Provider replies are mocked; these tests do not claim to test a real Gemini key.

References: https://ai.google.dev/gemini-api/docs/generate-content/structured-output and https://ai.google.dev/gemini-api/docs/pricing .
