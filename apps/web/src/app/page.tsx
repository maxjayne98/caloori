'use client';
import { App } from '@/app-controller';
import { RepositoryProvider } from '@/providers/repository-provider';
import { useEffect } from 'react';
export default function Page() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    } else {
      // Production service workers must never serve stale development bundles.
      navigator.serviceWorker
        .getRegistrations()
        .then(async (registrations) => {
          const ours = registrations.filter(
            (registration) => registration.active?.scriptURL === `${window.location.origin}/sw.js`,
          );
          if (!ours.length) return;
          await Promise.all(ours.map((registration) => registration.unregister()));
          const keys = await caches.keys();
          await Promise.all(
            keys
              .filter((key) => key.startsWith('nourish-static-'))
              .map((key) => caches.delete(key)),
          );
          if (navigator.serviceWorker.controller) window.location.reload();
        })
        .catch(() => {});
    }
  }, []);
  return (
    <RepositoryProvider>
      <App />
    </RepositoryProvider>
  );
}
