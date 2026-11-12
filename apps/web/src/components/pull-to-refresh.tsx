'use client';

import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';

const REFRESH_THRESHOLD = 64;
const MAX_PULL_DISTANCE = 88;
const REFRESH_START_REGION = 0.25;
type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'failed';

export function PullToRefresh() {
  const { prepareRefresh } = useNourishData();
  const { t } = useI18n();
  const [pullState, setPullState] = useState<PullState>('idle');
  const indicator = useRef<HTMLDivElement>(null);
  const icon = useRef<SVGSVGElement>(null);
  const startY = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const pullStateRef = useRef<PullState>('idle');
  const animationFrame = useRef<number | null>(null);
  const failureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function updatePullState(next: PullState) {
      if (pullStateRef.current === next) return;
      pullStateRef.current = next;
      setPullState(next);
    }

    function paintPull(distance: number, immediate = false, hidden = false) {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      const paint = () => {
        animationFrame.current = null;
        if (indicator.current)
          indicator.current.style.transform = `translate(-50%, ${distance || (hidden ? -48 : 0)}px)`;
        if (icon.current) icon.current.style.transform = `rotate(${distance * 4}deg)`;
      };
      if (immediate) paint();
      else animationFrame.current = requestAnimationFrame(paint);
    }

    function resetPull() {
      startY.current = null;
      pullDistanceRef.current = 0;
      if (indicator.current) indicator.current.style.transition = '';
      paintPull(0, true, true);
      if (pullStateRef.current !== 'refreshing') updatePullState('idle');
    }

    function onTouchStart(event: TouchEvent) {
      if (pullStateRef.current === 'refreshing' || event.touches.length !== 1 || window.scrollY > 0)
        return;
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
      const touchY = event.touches[0].clientY;
      if (touchY > window.innerHeight * REFRESH_START_REGION) return;
      startY.current = touchY;
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
      if (indicator.current) indicator.current.style.transition = 'none';
      paintPull(dampenedDistance);
      updatePullState(dampenedDistance >= REFRESH_THRESHOLD ? 'ready' : 'pulling');
    }

    function onTouchEnd(event: TouchEvent) {
      if (event.touches.length > 0) return;
      startY.current = null;
      if (pullDistanceRef.current < REFRESH_THRESHOLD || pullStateRef.current === 'refreshing') {
        pullDistanceRef.current = 0;
        if (indicator.current) indicator.current.style.transition = '';
        paintPull(0, true, true);
        updatePullState('idle');
        return;
      }

      pullDistanceRef.current = REFRESH_THRESHOLD;
      if (indicator.current) indicator.current.style.transition = '';
      paintPull(REFRESH_THRESHOLD, true);
      updatePullState('refreshing');
      void prepareRefresh()
        .then(() => window.location.reload())
        .catch((error: unknown) => {
          console.error('Could not refresh the app.', error);
          pullDistanceRef.current = 0;
          paintPull(0, true);
          updatePullState('failed');
          failureTimer.current = setTimeout(() => updatePullState('idle'), 4000);
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
      if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
    };
  }, [prepareRefresh]);

  const visible = pullState !== 'idle';
  const label =
    pullState === 'failed'
      ? t('refresh.failed')
      : pullState === 'refreshing'
        ? t('refresh.loading')
        : pullState === 'ready'
          ? t('refresh.release')
          : t('refresh.pull');

  return (
    <div
      ref={indicator}
      className={`fixed left-1/2 z-[100] grid size-11 will-change-transform place-items-center rounded-full border border-[var(--accent)] bg-[var(--accent)] text-[var(--surface)] shadow-lg transition-[opacity,transform] duration-150 motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{
        top: 'calc(env(safe-area-inset-top) + 10px)',
        transform: 'translate(-50%, -48px)',
      }}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <RefreshCw
        ref={icon}
        size={16}
        aria-hidden="true"
        className={pullState === 'refreshing' ? 'animate-spin motion-reduce:animate-none' : ''}
      />
    </div>
  );
}
