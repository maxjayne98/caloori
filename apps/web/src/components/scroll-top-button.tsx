'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@nourish/ui';
import { ArrowUp } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';

/**
 * Floating "back to top" button for long lists. It follows the nearest sheet when inside one,
 * otherwise the page, and appears only after scrolling down a little. Takes no layout space.
 */
export function ScrollTopButton({ offset = 'bottom-4' }: { offset?: string }) {
  const { t } = useI18n();
  const anchor = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const sheet = anchor.current?.closest<HTMLElement>('.sheet');
    const target: HTMLElement | Window = sheet ?? window;
    const read = () => setShown((sheet ? sheet.scrollTop : window.scrollY) > 400);
    read();
    target.addEventListener('scroll', read, { passive: true });
    return () => target.removeEventListener('scroll', read);
  }, []);

  function toTop() {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    const sheet = anchor.current?.closest<HTMLElement>('.sheet');
    (sheet ?? window).scrollTo({ top: 0, behavior });
  }

  return (
    <div
      ref={anchor}
      className={`pointer-events-none sticky ${offset} z-20 flex h-0 justify-center`}
    >
      <Button
        variant="unstyled"
        aria-label={t('common.scrollTop')}
        title={t('common.scrollTop')}
        tabIndex={shown ? 0 : -1}
        aria-hidden={!shown}
        onClick={toTop}
        className={`grid h-12 w-40 -translate-y-full place-items-center rounded-lg border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] text-[var(--foreground)] shadow-[0_8px_22px_var(--neutral-18181e55)] backdrop-blur-xl backdrop-saturate-150 transition-[background-color,opacity,scale] duration-200 hover:bg-[color-mix(in_srgb,var(--surface)_84%,transparent)] active:scale-95 motion-reduce:transition-none ${
          shown ? 'pointer-events-auto opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <ArrowUp size={23} strokeWidth={3.5} aria-hidden="true" />
      </Button>
    </div>
  );
}
