# Security boundaries

- No service-role keys, passwords or database credentials in source. `.env.local` is ignored. Only a Supabase publishable key may be public.
- Supabase is optional and is imported only by the adapter/provider boundary. Database access requires a signed-in owner. Failed cloud configuration does not silently fall back to device-only storage.
- Private health data is never sent to analytics, image services or the service worker cache. Barcode photos are decoded on-device; only the code is sent to Open Food Facts.
- State imports and repository reads/writes are validated using the shared schema. Import replaces data only after a review step.
- Optimistic revision checks reject stale writes. Errors are surfaced in the app, with unsaved changes kept in memory. Export before reloading after a conflict.
- Static hosting headers disable embedding and unnecessary permissions, limit connection origins, and prevent MIME sniffing. `unsafe-inline` is retained for Next's static bootstrap and dynamic chart/theme styles; never add arbitrary HTML/script rendering. A stricter nonce-based CSP requires a dynamic hosting design.
- The local adapter is device storage, not end-to-end encrypted storage. Browser access means access to locally stored data. Cloud mode uses Supabase sessions, HTTPS and database authorization; it is not end-to-end encryption either.
- Enable MFA on hosting/database dashboards, restrict signups if personal, and test RLS with two accounts before using real health data in cloud mode.
- Auth/session data and API responses are never cached by the service worker. Public static assets only. No promise of offline cloud editing is made.

Live SQL authorization tests require a configured database and have not been run in this project yet. Source-level checks and adapter contract tests do not replace those tests.
