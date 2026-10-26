# Replaceable data layer

UI → DataProvider → NourishRepository → LocalRepository / SupabaseRepository / your adapter.

The only contract is `load(): Promise<{state,revision}>` and `save(state,expectedRevision): Promise<revision>`. Domain models and backup format are independent of Supabase. A future SQLite/Firestore/API adapter implements the same interface; only `repository-provider.tsx` needs a factory change.

## Why a JSONB document?

For this personal app, one versioned document per user preserves all nested portion and historical-goal metadata and makes providers easy to replace. It is stored in a real PostgreSQL database, not browser storage, when cloud mode is enabled. JSONB is a deliberate portability choice; it is not an analytics schema. If dataset size or reporting grows, the adapter can translate the same state contract into normalized tables without changing feature components.

## Activate Supabase

1. Create a free Supabase project in your own account, preferably a suitable EU region.
2. Run `packages/database/supabase/migrations/0001_private_documents.sql` in its SQL editor. Review it first.
3. Disable public signups for personal-only use. Create/invite your user through the Supabase dashboard and set a password using its normal account flow. Do not embed an admin key in this app.
4. Copy `apps/web/.env.example` to `apps/web/.env.local`. Set `NEXT_PUBLIC_STORAGE_DRIVER=supabase`, the project URL and **publishable** key.
5. Set allowed website origins and auth settings in Supabase. Rebuild the static export because public environment values are embedded at build time.
6. Test two separate accounts. Account A must not read account B's row; signed-out reads/writes must fail; a stale revision write must fail.
7. Import your reviewed backup only after signing into the intended account. Never automatically merge browser health data into a newly signed-in account.

RLS protects reads. Direct client INSERT/UPDATE/DELETE grants are revoked. The write RPC derives ownership from `auth.uid()` and checks an expected user ID only as an account-switch guard; it never uses that value to assign ownership. It has an empty search path, checks document structure/size and locks the row before comparing revisions. Conflict errors never silently overwrite newer data.

## Free tier caveats

Supabase free has storage/transfer quotas and may pause inactive projects. Managed daily backups are not included in its free tier. Keep your own exports and verify recovery. No automatic paid upgrade or server is configured here.
