# Code style

- Prettier is the source of truth: single quotes, trailing commas, width 100.
- Feature components are mostly untyped `.jsx`. Providers, shared components and packages are TypeScript. Write new shared or non-trivial code as `.ts`/`.tsx`, and don't convert existing `.jsx` unless asked.
- Use named function exports (`export function TodayPage`), kebab-case file names, and `'use client'` at the top of web components.
- Import via the `@/` alias and package names (`@nourish/core`, `@nourish/ui`). Re-export new package modules from the package's `src/index.ts`.
- Use `Button` from `@nourish/ui` with `variant="unstyled"` plus a project CSS class.
- Icons: use `Icon` (`components/icon.jsx`), `@tabler/icons-react`, or an inline SVG with `stroke="currentColor"`. Keep the stroke width around 1.7.
- Wrap `localStorage`/`sessionStorage` access in `try/catch`.
- Accessibility: `aria-label` on icon-only buttons, `aria-hidden` on decorative SVGs, `role="status"` on transient messages.
- Keep comments brief and explain _why_. UI copy is short, warm English.
