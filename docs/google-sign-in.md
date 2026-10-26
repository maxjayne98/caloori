# Google sign-in setup

The single welcome screen handles both new and returning users through Google OAuth. No application server is required: the browser uses Supabase Auth with PKCE and the existing RLS-protected repository. Local preview is explicitly separate from authentication and is available only with the local storage driver.

## Activate

1. Create a Supabase project and apply `packages/database/supabase/migrations/0001_private_documents.sql`.
2. In Google Cloud, configure the OAuth consent screen and a Web application OAuth client. Request only basic identity scopes (openid, email, profile). Add the exact callback URL shown in Supabase's Google provider settings as the authorized redirect URI. While Google is in testing mode, add your Google account as a test user.
3. Enable Google in Supabase Authentication → Providers. Enter the Google client ID and client secret there. The secret must never go into this repository, browser code, or NEXT_PUBLIC variables.
4. Set the Supabase Site URL to the deployed app origin. Allow the exact app root redirect URL, plus `http://localhost:5174/` for local development. Avoid wildcard production redirect URLs.
5. Copy `apps/web/.env.example` to `apps/web/.env.local`, select `NEXT_PUBLIC_STORAGE_DRIVER=supabase`, and fill the public URL and publishable key. Rebuild/restart the app. Never use a service-role key in the browser.
6. Test first sign-in, returning sign-in, cancelled consent, reload, sign-out, and cross-account isolation using two accounts. Check that user A cannot read or write user B's document using direct API requests, not only the UI.

The local preview button disappears in Supabase mode. Cloud mode never falls back to unauthenticated local data. Existing local data is not automatically uploaded. Google sign-in proves account ownership; it does not by itself enforce MFA. App-level MFA requires a separate enrollment/challenge flow and corresponding database policies before claiming it is mandatory.

## Connected development environment

Supabase project: `fmmilbqwqdisqfltnmep` (Nourish, Free, West EU / Ireland).
Google Cloud project: `stoked-citizen-512819-n0` (Nourish). Web OAuth client: Nourish Web.
The Google client secret exists only in Supabase provider configuration, never in the app environment or source.
Public app configuration is in ignored `apps/web/.env.local`.

Site URL is currently `http://localhost:5174/`. The isolated production-export preview at `http://localhost:5175/` is an exact allowed redirect. Neither is a production deployment. After deployment, replace the Site URL with the HTTPS production origin and add its exact root redirect.
Google audience remains Testing with the owner's account added as a test user. No billing was enabled.

Verified on 2026-10-26:

- Live Google OAuth consent requested only email/profile, completed PKCE, opened the cloud diary, and restored the session after refresh.
- Database metadata: RLS on; anonymous read and write RPC denied; authenticated direct insert/update denied.
- Live SQL transaction: save, read-back, stale revision rejection, and owner mismatch rejection passed. All test writes rolled back.
- Two independent real user accounts have not yet been tested end to end. MFA is not enforced by the app; Google login alone does not make that claim.
- Existing local data has not been automatically uploaded. A user-controlled migration/import remains separate.

The database currently stores one validated JSONB document per user in PostgreSQL. This is not a normalized relational food schema. The repository boundary permits a separate migration later.

The development server previously left stale bundles in a production service worker cache. Development now unregisters this app's worker/cache; the production worker caches icons only. If an already-running dev process has old environment values, restart it. The independent static-export preview on port 5175 uses the current configuration.

References: https://supabase.com/docs/guides/auth/social-login/auth-google and https://supabase.com/docs/guides/auth/sessions/pkce-flow
