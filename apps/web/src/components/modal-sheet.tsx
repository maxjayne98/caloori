'use client';
import {
  Button,
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from '@nourish/ui';
import { ScrollTopButton } from '@/components/scroll-top-button';
import { useEffect, useRef, type PointerEvent, type ReactNode, type TransitionEvent } from 'react';

const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.7;

export function ModalSheet({
  title,
  headerAction,
  onClose,
  children,
}: {
  title: string;
  headerAction?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const sheet = useRef<HTMLElement>(null);
  // Marks the page while any sheet is open, so floating notices outside it can step aside
  // (a modal sheet blocks clicks everywhere else). Counted, since sheets can stack.
  useEffect(() => {
    const body = document.body;
    body.dataset.sheetsOpen = String(Number(body.dataset.sheetsOpen || 0) + 1);
    return () => {
      const left = Number(body.dataset.sheetsOpen || 1) - 1;
      if (left > 0) body.dataset.sheetsOpen = String(left);
      else delete body.dataset.sheetsOpen;
    };
  }, []);
  const drag = useRef<{
    pointerId: number;
    startY: number;
    lastY: number;
    lastTime: number;
    distance: number;
    frame: number | null;
  } | null>(null);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      (event.target instanceof Element && event.target.closest('button'))
    )
      return;
    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      distance: 0,
      frame: null,
    };
    if (sheet.current) sheet.current.style.willChange = 'transform';
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function applyDragPosition() {
    const activeDrag = drag.current;
    if (!activeDrag || !sheet.current) return;
    activeDrag.frame = null;
    sheet.current.style.transition = 'none';
    sheet.current.style.transform = `translate3d(0, ${activeDrag.distance}px, 0)`;
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const activeDrag = drag.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId || !sheet.current) return;
    const distance = Math.max(0, event.clientY - activeDrag.startY);
    activeDrag.lastY = event.clientY;
    activeDrag.lastTime = event.timeStamp;
    activeDrag.distance = distance;
    if (activeDrag.frame === null) {
      activeDrag.frame = requestAnimationFrame(applyDragPosition);
    }
  }

  function restorePosition() {
    if (!sheet.current) return;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280;
    if (duration === 0) {
      sheet.current.style.transition = '';
      sheet.current.style.transform = '';
      sheet.current.style.willChange = '';
      return;
    }
    sheet.current.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    sheet.current.style.transform = 'translate3d(0, 0, 0)';
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const activeDrag = drag.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId || !sheet.current) return;
    drag.current = null;
    if (activeDrag.frame !== null) cancelAnimationFrame(activeDrag.frame);
    const distance = Math.max(0, event.clientY - activeDrag.startY);
    const elapsed = Math.max(1, event.timeStamp - activeDrag.lastTime);
    const velocity = Math.max(0, (event.clientY - activeDrag.lastY) / elapsed);
    sheet.current.style.transition = 'none';
    sheet.current.style.transform = `translate3d(0, ${distance}px, 0)`;
    if (distance >= DISMISS_DISTANCE || (distance >= 32 && velocity >= DISMISS_VELOCITY)) {
      onClose();
      return;
    }
    void sheet.current.offsetHeight;
    restorePosition();
  }

  function cancelDrag() {
    if (drag.current?.frame !== null && drag.current?.frame !== undefined)
      cancelAnimationFrame(drag.current.frame);
    drag.current = null;
    restorePosition();
  }

  function clearDragStyles(event: TransitionEvent<HTMLElement>) {
    if (event.target !== sheet.current || event.propertyName !== 'transform') return;
    sheet.current.style.transition = '';
    sheet.current.style.transform = '';
    sheet.current.style.willChange = '';
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay
          className="overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <DialogContent
            asChild
            aria-describedby={undefined}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              sheet.current?.focus({ preventScroll: true });
            }}
            onEscapeKeyDown={(event) => {
              if (document.querySelector('.nourish-select-menu')) event.preventDefault();
            }}
          >
            <section ref={sheet} tabIndex={-1} className="sheet" onTransitionEnd={clearDragStyles}>
              <div
                className="touch-none cursor-grab active:cursor-grabbing"
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={finishDrag}
                onPointerCancel={cancelDrag}
              >
                <div className="handle" />
                <div className="sheet-head">
                  <div className="sheet-title-group">
                    <DialogTitle asChild>
                      <h2>{title}</h2>
                    </DialogTitle>
                    {headerAction}
                  </div>
                  <Button variant="unstyled" className="close" aria-label="Close" onClick={onClose}>
                    ×
                  </Button>
                </div>
              </div>
              {children}
              <ScrollTopButton />
            </section>
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
}
