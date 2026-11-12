'use client';

import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';

const REFRESH_THRESHOLD = 64;
const MAX_PULL_DISTANCE = 88;

export function PullToRefresh() {
  const { prepareRefresh } = useNourishData();
  const { t } = useI18n();
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const startY = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const failureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetPull() {
      startY.current = null;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    }

    function onTouchStart(event: TouchEvent) {
      if (refreshingRef.current || event.touches.length !== 1 || window.scrollY > 0) return;
      const target = event.target;
      if (target instanceof Element) {
        if (
          target.closest(
            'input, textarea, select, [contenteditable="true"], .overlay, [data-pull-refresh-disabled]',
          )
        )
          return;
        for (let element: Element | null = target; element; element = element.parentElement) {
          const overflowY = window.getComputedStyle(element).overflowY;
          if (
            (overflowY === 'auto' || overflowY === 'scroll') &&
            element.scrollHeight > element.clientHeight
          )
            return;
        }
      }
      startY.current = event.touches[0].clientY;
    }

    function onTouchMove(event: TouchEvent) {
      if (startY.current === null || event.touches.length !== 1) return;
      if (window.scrollY > 0) {
        resetPull();
        return;
      }

      const distance = event.touches[0].clientY - startY.current;
      if (distance <= 0) {
        resetPull();
        return;
      }
      if (event.cancelable) event.preventDefault();

      const dampenedDistance = Math.min(MAX_PULL_DISTANCE, distance * 0.75);
      pullDistanceRef.current = dampenedDistance;
      setPullDistance(dampenedDistance);
    }

    function onTouchEnd(event: TouchEvent) {
      if (event.touches.length > 0) return;
      startY.current = null;
      if (pullDistanceRef.current < REFRESH_THRESHOLD || refreshingRef.current) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }

      refreshingRef.current = true;
      setRefreshing(true);
      setFailed(false);
      setPullDistance(REFRESH_THRESHOLD);
      void prepareRefresh()
        .then(() => window.location.reload())
        .catch((error: unknown) => {
          console.error('Could not refresh the app.', error);
          refreshingRef.current = false;
          setRefreshing(false);
          setPullDistance(0);
          pullDistanceRef.current = 0;
          setFailed(true);
          failureTimer.current = setTimeout(() => setFailed(false), 4000);
        });
    }

    function onTouchCancel() {
      resetPull();
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchCancel, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
      if (failureTimer.current) clearTimeout(failureTimer.current);
    };
  }, [prepareRefresh]);

  const visible = pullDistance > 0 || refreshing || failed;
  const label = failed
    ? t('refresh.failed')
    : refreshing
      ? t('refresh.loading')
      : pullDistance >= REFRESH_THRESHOLD
        ? t('refresh.release')
        : t('refresh.pull');

  return (
    <div
      className={`fixed left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--neutral-e9e9ee)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-lg transition-[opacity,transform] duration-150 motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{
        top: 'calc(env(safe-area-inset-top) + 10px)',
        transform: `translate(-50%, ${visible ? Math.max(pullDistance, refreshing ? REFRESH_THRESHOLD : 0) : -48}px)`,
      }}
      role="status"
      aria-live="polite"
    >
      <RefreshCw
        size={16}
        aria-hidden="true"
        className={`text-[var(--accent)] ${refreshing ? 'animate-spin motion-reduce:animate-none' : ''}`}
        style={{
          transform: `rotate(${pullDistance * 4}deg)`,
        }}
      />
      {label}
    </div>
  );
}
