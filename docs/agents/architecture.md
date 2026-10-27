# Architecture

## Map

| Path                              | Contents                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/web/src/app`                | Next entry (`layout.tsx`, `page.tsx`, `globals.css`). Single client page.                      |
| `apps/web/src/app-controller.jsx` | `App`: tab navigation, open sheet state, wiring between feature pages.                         |
| `apps/web/src/features/<name>`    | Feature UI (diary, foods, meals, activities, progress, profile, assistant, settings, auth, …). |
| `apps/web/src/components`         | Shared UI (`ModalSheet`, `RollingNumber`, `Icon`, `BottomNavigation`, form fields).            |
| `apps/web/src/providers`          | `RepositoryProvider` (storage/auth), `DataProvider` (state/saving), `AppearanceProvider`.      |
| `packages/core`                   | Pure domain logic: Zod models, calculations, food catalog, weekly report. No React/DB.         |
| `packages/database`               | `NourishRepository` + Local/Memory/Supabase implementations, caches.                           |
| `packages/ui`                     | shadcn-style Radix primitives (`Button`, `Input`, `Dialog`), `cn`.                             |

## Rules

- **Static only**: `output: 'export'`. No API routes, server actions, middleware or SSR.
- **One page, hash navigation**: `page.tsx` → `RepositoryProvider → DataProvider → App`. Tabs follow `window.location.hash` (`#today`, …), not Next routing. Sheets are one `sheet` string in `App` (`'add'`, `'edit'`, `'meals'`, …) opened via the `setSheet` prop.
- **State**: the whole dataset is one `AppState` (`packages/core/src/models.ts`). Use `useNourishData()`. It returns state slices plus setters (`setEntries`, `setProfile`, `setActivities`, …) that take a value or an updater function.
- **Storage boundary**: UI knows only `NourishRepository` (`load()` / `save(state, expectedRevision)`, `RevisionConflict` on a stale write). The driver comes from `NEXT_PUBLIC_STORAGE_DRIVER`:
  - `local` (default) uses the localStorage key `nourish-next:state:v1`.
  - `supabase` also needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

  Import `@supabase/*` only in `packages/database` and the repository provider.

- **Business logic** goes in `packages/core` as pure, tested functions; components only display results.
- **Data model changes**: edit the Zod schema and keep existing snapshots loadable (optional or defaulted fields, legacy path in `validateState`). Add core tests and update `docs/database.md` if the cloud schema is affected.
