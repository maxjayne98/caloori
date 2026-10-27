# Styling

- The design is plain CSS in `apps/web/src/styles/`, imported from `src/app/globals.css`:
  - `nourish.css`: base styles
  - `experience.css`: newer features and animations
  - `settings.css`, `login.css`, `select.css`, `mobile-inputs.css`

  Put new rules next to related ones.

- Tailwind utilities exist, but Preflight is off. Prefer CSS classes over utility soup.
- **Colors come only from tokens** in `themes.css`: `--accent`, `--accent-soft`, `--accent-text`, `--surface`, and `--neutral-*`. Dark mode and `[data-accent='blue'|'purple'|'green'|'orange'|'teal']` redefine the tokens. Use white text on an `--accent` background.
- Mobile first: check at about 375px wide. Use the existing `@media (max-width: 360px)` blocks for very small phones.
- Every animation needs a `@media (prefers-reduced-motion: reduce)` override.
- Clip only the axis you need. For example, `RollingNumber` uses `clip-path: inset(0 -0.15em)`, not `overflow: hidden`.
- Keep the established pink/light look. Don't restyle unrelated areas.
