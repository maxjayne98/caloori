# Free static hosting

This project uses Next.js App Router with `output: 'export'`. There are no server routes, SSR workloads or rented servers. Supabase provides the optional managed data/auth layer.

## Cloudflare Pages (recommended free static host)

After reviewing the new app, publish it as a **new project**, never over the original Nourish deployment.

- Repository root: this monorepo.
- Build command: `pnpm install && pnpm build`.
- Output directory: `apps/web/out`.
- Node: 22 or later.
- Set public storage/Supabase environment values in build settings if using cloud mode.
- Use the free `pages.dev` address; a custom domain is optional.

`apps/web/public/_headers` is copied into the export and supplies Cloudflare security headers. It is a Cloudflare-specific file: configure equivalent headers separately on another host.

Vercel Hobby is another option for personal, non-commercial usage. Its free plan restrictions differ. Neither provider's free plan promises unlimited resources or permanent free availability.

## iPhone

Open your deployed HTTPS URL in Safari → Share → Add to Home Screen → Open as Web App. The app does not require App Store distribution. Camera testing must be done on the actual iPhone; browser preview tests cannot certify camera permission behavior on every iOS version.

Sources checked during implementation:

- https://nextjs.org/docs/app/guides/static-exports
- https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
- https://supabase.com/pricing
- https://vercel.com/docs/plans/hobby
