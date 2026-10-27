# AGENTS.md

Shared guide for AI coding agents (Claude Code, Codex, Cursor, Gemini, …) and humans working in this repository. Keep it current when conventions change.

## Project

Nourish is a mobile-first nutrition and activity diary (food log, macros, activities, weight, weekly report, assistant). It is a pnpm monorepo (Node 22+, pnpm 11+) deployed as a **static site**. It rebuilds a sibling project `../nourish`; never read from or modify that directory or its browser storage keys.

## Commands

```sh
pnpm install
pnpm dev                # Next.js dev server on http://127.0.0.1:5174
pnpm test               # node:test via tsx for packages/core and packages/database
pnpm typecheck          # tsc in every workspace (web runs `next typegen` first)
pnpm build              # static export → apps/web/out
pnpm format             # prettier --write .
pnpm format:check
```

- Single test file: `pnpm exec tsx --test packages/core/src/weekly-report.test.ts`
- Single test by name: add `--test-name-pattern "<pattern>"`
- The dev server is often already running on 5174. Check before starting another one. If you need a second one, run `pnpm --filter @nourish/web exec next dev --port 5175`.
- `localhost` and `127.0.0.1` are different browser origins with separate local data.

Before you finish a change, run `pnpm typecheck` and `pnpm test`. Run `pnpm format:check` as well if you touched many files.

## Repository map

| Path                              | What lives there                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/app`                | Next entry (`layout.tsx`, `page.tsx`, `globals.css`). Single client page.                                                   |
| `apps/web/src/app-controller.jsx` | The `App` component: tab navigation, open sheet/modal state, and wiring between feature pages.                              |
| `apps/web/src/features/<feature>` | Feature UI (`diary`, `foods`, `meals`, `activities`, `progress`, `profile`, `assistant`, `settings`, `auth`, `recipes`).    |
| `apps/web/src/components`         | Cross-feature UI (`ModalSheet`, `RollingNumber`, `Icon`, `BottomNavigation`, form fields).                                  |
| `apps/web/src/providers`          | `RepositoryProvider` (storage + auth), `DataProvider` (app state + saving), `AppearanceProvider` (theme/accent).            |
| `apps/web/src/styles`             | All design CSS and theme tokens.                                                                                            |
| `packages/core`                   | Pure domain logic: Zod schemas/models, calculations, food catalog, weekly report, assistant proposals. No React, no DB SDK. |
| `packages/database`               | `NourishRepository` interface plus Local, Memory, and Supabase implementations, and caches.                                 |
| `packages/ui`                     | shadcn-style Radix primitives (`Button`, `Input`, `Dialog`) and the `cn` util.                                              |
| `docs/`                           | Deployment, database/Supabase, Google sign-in, migration, security.                                                         |

## Architecture

- **Static only.** `next.config.ts` uses `output: 'export'`. Don't add API routes, server actions, middleware, `getServerSideProps`, or anything that needs a Node server. Everything runs in the browser.
- **One page, hash navigation.** `page.tsx` renders `RepositoryProvider → DataProvider → App`. Tabs are driven by `window.location.hash` (`#today`, …) inside `app-controller.jsx`, not by Next routing. Sheets and modals are a single `sheet` state string in `App` (`'add'`, `'edit'`, `'meals'`, …), opened through `setSheet(...)` props.
- **State.** The whole user dataset is one `AppState` object (schema in `packages/core/src/models.ts`). Read and update it with `useNourishData()`, which gives you slices plus setters such as `setEntries`, `setProfile`, and `setActivities`. Setters accept a value or an updater function. `DataProvider` saves through the repository and exposes `status`.
- **Storage boundary.** UI code only knows `NourishRepository` (`load()` / `save(state, expectedRevision)`). A stale revision throws `RevisionConflict`. The driver is chosen by `NEXT_PUBLIC_STORAGE_DRIVER`:
  - `local` (the default) uses the localStorage key `nourish-next:state:v1`.
  - `supabase` also needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

  Never import `@supabase/*` outside `packages/database` or the repository provider.

- **Changing the data model.** Edit the Zod schema in `models.ts`. Keep old saved data loadable: new fields should be optional or defaulted, and `validateState` / the legacy path must still accept existing snapshots. Add or adjust tests in `packages/core`. If the change affects cloud storage, update the SQL migration notes in `docs/database.md`.
- **Business logic goes in `packages/core`** as pure functions with tests, not inside components. Components format and display what core functions return.

## Code style

- Prettier is the source of truth: single quotes, trailing commas, `printWidth` 100. Don't hand-format against it.
- **Language mix:** feature components are mostly `.jsx` (untyped, migrated code). Providers, shared components, and packages are TypeScript. New shared or non-trivial code should be `.ts` / `.tsx`. Don't convert existing `.jsx` files unless asked.
- Components are named function exports (`export function TodayPage(...)`). Files are kebab-case (`today-page.jsx`). Add `'use client'` at the top of web components.
- Import web code through the `@/` alias (`@/components/...`) and packages by name (`@nourish/core`, `@nourish/ui`). Each package re-exports from `src/index.ts`, so add new modules there.
- Use `Button` from `@nourish/ui` with `variant="unstyled"` and a project CSS class. Don't rely on the shadcn default look.
- Icons: use the in-house `Icon` (`components/icon.jsx`) or `@tabler/icons-react`. Inline SVGs with `stroke="currentColor"` are also used. Keep a stroke width of about 1.7 for visual consistency.
- Wrap `localStorage` and `sessionStorage` access in `try/catch`; it can throw in private modes.
- Keep accessibility attributes: `aria-label` on icon-only buttons, `aria-hidden` on decorative SVGs, `role="status"` on transient messages.
- Comments explain _why_, briefly. Don't add comments that restate the code.
- UI copy is English, short, and warm (for example "Your week called. You showed up!").

## Styling

- The design is plain CSS in `apps/web/src/styles/` (`nourish.css` for the base, `experience.css` for newer features and animations, `settings.css`, `login.css`, `select.css`, `mobile-inputs.css`), imported from `src/app/globals.css`. Put new styles next to related rules in the matching file.
- Tailwind utilities are available, but **Preflight is off** to keep the original layout. Prefer CSS classes in the existing files over Tailwind utility soup.
- **Colors come from tokens** in `themes.css`: `--accent`, `--accent-soft`, `--accent-text`, `--surface`, and the `--neutral-*` set. Light/pink is the default. Dark mode and accents (`[data-accent='blue' | 'purple' | 'green' | 'orange' | 'teal']`) redefine the tokens, so hard-coded colors break theming. Use white text on `--accent` backgrounds.
- Mobile first. The app is a narrow column (an iPhone PWA). Check layouts at about 375px wide, and use the existing `@media (max-width: 360px)` blocks for very small phones.
- Give every animation a `@media (prefers-reduced-motion: reduce)` override that disables it. This pattern is used throughout.
- Clip only the axis you need. For example, `RollingNumber` uses `clip-path: inset(0 -0.15em)` instead of `overflow: hidden` so wide digits aren't cut off.
- Preserve the existing look (labels, icons, portions, pink default). Don't restyle unrelated areas while making a targeted change.

## Testing

- Tests use `node:test` with `node:assert/strict`, live next to the source as `*.test.ts`, and run with `tsx`. They exist for `packages/core` and `packages/database` only.
- Pass explicit `Date` values into date-dependent logic so tests are deterministic (see `weekly-report.test.ts`).
- There are no UI tests. Verify UI changes in a browser at http://127.0.0.1:5174, including dark mode and one non-default accent when you change colors.

## Security and privacy

See `docs/security.md`. Key rules:

- No secrets in source; `.env*` files are ignored. Only the Supabase publishable key may be public.
- Health data is never sent to analytics or third parties, and never cached by the service worker (`public/sw.js` caches static assets only). Barcode images are decoded on-device; only the code goes to Open Food Facts.
- Validate imported or loaded state with the shared Zod schema. Never render arbitrary HTML.

## Git

- Small, focused commits with a descriptive imperative subject (for example "Fix rolling digit clipping and restyle weekly report message"). Commit only the files belonging to the change.
- Don't commit `out/`, `.next/`, `*.tsbuildinfo`, or `.env*`.
