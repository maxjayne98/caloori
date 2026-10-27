# AGENTS.md

Nourish is a mobile-first nutrition/activity diary: a pnpm monorepo (Node 22+) shipped as a **static** Next.js site. Never touch the sibling `../nourish` project.

## Commands

```sh
pnpm dev         # http://127.0.0.1:5174 (often already running; reuse it)
pnpm test        # core + database tests
pnpm typecheck
pnpm build       # → apps/web/out
pnpm format
```

Run `pnpm typecheck` and `pnpm test` before finishing.

## Must-follow rules

- No server code: no API routes, no SSR, no middleware.
- Domain logic goes in `packages/core` (pure, tested). UI accesses data only through `useNourishData()` and `NourishRepository`.
- Use color tokens (`--accent`, …), never hard-coded colors. Give every animation a reduced-motion fallback.
- Keep commits small, and include only the files that belong to the change.

## Read when relevant

Open only the file you need:

- `docs/agents/architecture.md`: structure, state, storage, data model changes
- `docs/agents/code-style.md`: file types, naming, imports, components, accessibility
- `docs/agents/styling.md`: CSS files, tokens, themes, mobile, motion
- `docs/agents/testing.md`: running tests, UI verification
- `docs/agents/security.md`: secrets, privacy, data handling
