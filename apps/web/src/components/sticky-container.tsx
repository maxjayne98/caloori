'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export function StickyContainer({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const target = sentinel.current;
    if (!target) return;
    // Inside a sheet the sheet scrolls, not the page, so watch against the sheet's edge.
    const root = target.closest<HTMLElement>('.sheet');
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(
          !entry.isIntersecting && entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0),
        );
      },
      { root },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} className="sticky-sentinel h-px -mb-px" aria-hidden="true" />
      <div className={`${className}${stuck ? ' is-stuck' : ''}`}>{children}</div>
    </>
  );
}
