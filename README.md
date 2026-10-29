# Nourish — independent Next.js monorepo

This is a separate rebuild of `../nourish`. The original directory, deployment and browser data are not modified. Default light/pink styling, labels, icons, portions, meals, activities and historical-goal behavior are preserved.

## Run

Use Node.js 22+ and pnpm 11+:

```sh
pnpm install
pnpm dev
```

New preview: **http://localhost:5174**. Original preview stays on port 5173. The delivered preview may already occupy 5174; stop that preview before starting a separate dev process, or run `pnpm --filter @nourish/web exec next dev --port 5175`.

```sh
pnpm test
pnpm typecheck
pnpm build
```

The production static site is `apps/web/out`. It has no Next.js server process or paid server requirement.

## Changelog

Enable the post-commit changelog hook once per clone:

```sh
git config core.hooksPath .githooks
```

After each commit, the hook regenerates `CHANGELOG.md`, grouping commit hashes and full messages by the `APP_VERSION` in each commit. The generated changelog is left unstaged for review. Regenerate it manually at any time with `pnpm changelog`.

## Workspace

- `apps/web/src/features`: readable JSX components, grouped by feature; original behavior kept during migration.
- `apps/web/src/providers`: typed state persistence, authentication boundary and appearance.
- `apps/web/src/styles`: original design rules and theme tokens. Tailwind utilities are enabled without Preflight to avoid changing the original layout.
- `packages/core`: pure calculations, food definitions, Zod data schemas and TypeScript models. No React or database SDK.
- `packages/database`: the repository interface and local, in-memory, Supabase implementations.
- `packages/ui`: shadcn-style Radix dialog, Button/Input primitives and shared Tailwind utilities. `unstyled` variants preserve the exact established design.
- `docs`: deployment, security, database switching and migration instructions.

## Storage defaults

No database account is needed. Default `local` mode uses a NEW browser key: `nourish-next:state:v1`. It does not read or overwrite the original six storage keys. The app starts with its own data.

Set appearance through **profile → Appearance & data**. Light/pink is the default; dark/system modes and six accents are available. Export/import backups from the same screen. Imports are validated and require a separate confirmation before replacing this new version's data.

## Cloud later

See `docs/database.md`. Connecting Supabase requires your own free account and running the included SQL migration. No live database has been provisioned or tested yet. Switching providers means implementing `NourishRepository`, not rewriting the UI.

## iPhone and hosting

A manifest, icons and a public-asset-only service worker are included. Add the deployed HTTPS website from Safari using Add to Home Screen. Data is not cached by the service worker; cloud access requires connectivity. See `docs/deployment.md` for static hosting on a free Cloudflare Pages plan, within its quotas. A custom domain is optional and can cost money. Free services are not an unlimited availability guarantee.

Use `localhost` consistently: `127.0.0.1` is a different browser origin and has separate local data.
