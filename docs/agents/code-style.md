# Code style

- Prettier is the source of truth: single quotes, trailing commas, width 100.
- Feature components are mostly untyped `.jsx`. Providers, shared components and packages are TypeScript. **Write all new files as `.ts`/`.tsx`** — do not create new `.jsx` files. Migrate a feature file to TypeScript only when you are already touching it for another reason.
- Use Tailwind utility classes for all new styling. Do **not** write new project-level CSS classes for new features; prefer Tailwind utilities and compose with `cn()` / `clsx`. Existing CSS classes may be left in place but should not be extended.
- Use named function exports (`export function TodayPage`), kebab-case file names, and `'use client'` at the top of web components.
- Import via the `@/` alias and package names (`@nourish/core`, `@nourish/ui`). Re-export new package modules from the package's `src/index.ts`.
- Use `Button` from `@nourish/ui` with `variant="unstyled"` plus a project CSS class.
- Icons: use `Icon` (`components/icon.jsx`), `@tabler/icons-react`, or an inline SVG with `stroke="currentColor"`. Keep the stroke width around 1.7.
- Wrap `localStorage`/`sessionStorage` access in `try/catch`.
- Accessibility: `aria-label` on icon-only buttons, `aria-hidden` on decorative SVGs, `role="status"` on transient messages.
- Keep comments brief and explain _why_. UI copy is short, warm English.
- **i18n**: all user-visible strings must be wrapped with `t('key')` from `useI18n()`. Add new keys to both `en` and `fa` translation objects in `packages/core/src/i18n.ts`.
- **Version bump**: whenever a change is meaningful enough to ship (new feature, bug fix, or i18n addition) increment `APP_VERSION` in `packages/core/src/version.ts` following semver (`patch` for fixes/copy, `minor` for new features). Update the matching `assert.equal` in `packages/core/src/i18n.test.ts` to the same version string.
