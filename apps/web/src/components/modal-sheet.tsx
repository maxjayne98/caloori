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
import { useRef, type PointerEvent, type ReactNode, type TransitionEvent } from 'react';

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
  const drag = useRef<{
    pointerId: number;
    startY: number;
    lastY: number;
    lastTime: number;
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
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const activeDrag = drag.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId || !sheet.current) return;
    const distance = Math.max(0, event.clientY - activeDrag.startY);
    activeDrag.lastY = event.clientY;
    activeDrag.lastTime = event.timeStamp;
    if (distance > 0) {
      sheet.current.style.transition = 'none';
      sheet.current.style.transform = `translate3d(0, ${distance}px, 0)`;
    }
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const activeDrag = drag.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId || !sheet.current) return;
    drag.current = null;
    const distance = Math.max(0, event.clientY - activeDrag.startY);
    const elapsed = Math.max(1, event.timeStamp - activeDrag.lastTime);
    const velocity = Math.max(0, (event.clientY - activeDrag.lastY) / elapsed);
    if (distance >= DISMISS_DISTANCE || (distance >= 32 && velocity >= DISMISS_VELOCITY)) {
      onClose();
      return;
    }
    sheet.current.style.transition = 'transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)';
    sheet.current.style.transform = 'translate3d(0, 0, 0)';
  }

  function cancelDrag() {
    drag.current = null;
    if (!sheet.current) return;
    sheet.current.style.transition = 'transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)';
    sheet.current.style.transform = 'translate3d(0, 0, 0)';
  }

  function clearDragStyles(event: TransitionEvent<HTMLElement>) {
    if (event.target !== sheet.current || event.propertyName !== 'transform') return;
    sheet.current.style.transition = '';
    sheet.current.style.transform = '';
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
