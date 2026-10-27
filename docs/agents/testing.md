# Testing

- Tests use `node:test` with `node:assert/strict` and live next to the source as `*.test.ts`. They exist only for `packages/core` and `packages/database`.
- Single file: `pnpm exec tsx --test packages/core/src/weekly-report.test.ts`. Add `--test-name-pattern "<pattern>"` to filter by test name.
- Pass explicit `Date` values into date logic so tests are deterministic.
- There are no UI tests. Verify UI changes at http://127.0.0.1:5174. When colors change, also check dark mode and one non-default accent.
- `localhost` and `127.0.0.1` are separate origins with separate local data.
