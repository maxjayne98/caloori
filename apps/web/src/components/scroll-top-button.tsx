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
      className={`pointer-events-none sticky ${offset} z-20 flex h-0 justify-end`}
    >
      <Button
        variant="unstyled"
        aria-label={t('common.scrollTop')}
        title={t('common.scrollTop')}
        tabIndex={shown ? 0 : -1}
        aria-hidden={!shown}
        onClick={toTop}
        // Inline so the global button reset (unlayered CSS) cannot override the colors.
        style={{ background: 'var(--foreground)', color: 'var(--surface)' }}
        className={`grid size-13 -translate-y-full place-items-center rounded-full shadow-[0_8px_22px_var(--neutral-18181e55)] transition-[opacity,scale] duration-200 active:scale-95 motion-reduce:transition-none ${
          shown ? 'pointer-events-auto opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <ArrowUp size={22} strokeWidth={2.4} aria-hidden="true" />
      </Button>
    </div>
  );
}
