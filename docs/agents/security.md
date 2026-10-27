# Security and privacy

Summary of `docs/security.md`:

- No secrets in source. `.env*` files are ignored. Only the Supabase publishable key may be public.
- Health data never goes to analytics or third parties, and is never cached by the service worker (`public/sw.js` caches static assets only).
- Barcode images are decoded on-device. Only the code is sent to Open Food Facts.
- Validate imported or loaded state with the shared Zod schema. Never render arbitrary HTML.
