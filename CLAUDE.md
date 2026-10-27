# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Nourish is a nutrition/activity diary, built as a pnpm monorepo (Node 22+, pnpm 11+). It is a rebuild of a sibling project `../nourish`; never modify that directory.

## Commands

```sh
pnpm dev                # Next.js dev server on 127.0.0.1:5174 (often already running — reuse it)
pnpm test               # node:test via tsx, runs packages/core and packages/database tests
pnpm typecheck          # tsc in every workspace (web runs `next typegen` first)
pnpm build              # static export to apps/web/out
pnpm format             # prettier (singleQuote, trailingComma all, printWidth 100)
```

Run a single test file: `pnpm exec tsx --test packages/core/src/weekly-report.test.ts`
Filter by test name: add `--test-name-pattern "<pattern>"`.

There are no UI/component tests; verify UI changes in the browser. `localhost` and `127.0.0.1` are different origins with separate local data.

## Architecture

- **`apps/web`** — Next.js app with `output: 'export'` (pure static site, no server/API routes). The whole app is one client page: `src/app/page.tsx` → `RepositoryProvider` → `DataProvider` → `App` in `src/app-controller.jsx`. Navigation is hash-based tab state (`#today`, …) inside `app-controller.jsx`, not Next routing; it also owns sheets/modals state and passes props down to feature pages in `src/features/<feature>/`.
- **Storage boundary** — `packages/database` defines `NourishRepository` (`load`/`save` of a whole `AppState` snapshot with optimistic `revision`; `RevisionConflict` on mismatch). Implementations: `LocalRepository` (localStorage key `nourish-next:state:v1`), `MemoryRepository`, `SupabaseRepository`. Chosen by `NEXT_PUBLIC_STORAGE_DRIVER` (`local` default, or `supabase` with `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). UI code must depend only on the interface, never a DB SDK.
- **`DataProvider`** (`apps/web/src/providers/data-provider.tsx`) exposes `AppState` slices plus setters (`setEntries`, `setProfile`, `setActivities`, …) via `useNourishData()` and handles debounced saving/status.
- **`packages/core`** — pure domain logic: Zod schemas and models (`models.ts`), calculations (portions, progress, weekly report, running, calendar), food catalog (`default-foods.json`), assistant proposal logic. No React, no DB. Most tests live here.
- **`packages/ui`** — shadcn-style Radix primitives (`Button`, `Input`, dialog). `variant="unstyled"` is used throughout so the app's own CSS defines the look.

## Styling

- Design lives in plain CSS under `apps/web/src/styles/` (`nourish.css`, `experience.css`, `settings.css`, …), imported from `src/app/globals.css`. Tailwind utilities are enabled **without Preflight** to keep the original layout; prefer the existing CSS files over Tailwind classes.
- Use theme tokens from `themes.css` (`--accent`, `--accent-soft`, `--accent-text`, `--surface`, …) instead of hard-coded colors. Dark mode and accents (`[data-accent='blue'|…]`) redefine these tokens.
- The default look (light/pink, labels, icons, portions) is intentional and preserved from the original app — don't restyle unrelated parts.

## Docs

`docs/` covers deployment (Cloudflare Pages static hosting), Supabase setup/migration (`database.md`), Google sign-in, and security.
