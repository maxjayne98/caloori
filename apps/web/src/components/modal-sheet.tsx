'use client';
import {
  Button,
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from '@nourish/ui';
import { useRef, type ReactNode } from 'react';
export function ModalSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const sheet = useRef<HTMLElement>(null);
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
            <section ref={sheet} tabIndex={-1} className="sheet">
              <div className="handle" />
              <div className="sheet-head">
                <DialogTitle asChild>
                  <h2>{title}</h2>
                </DialogTitle>
                <Button variant="unstyled" className="close" aria-label="Close" onClick={onClose}>
                  ×
                </Button>
              </div>
              {children}
            </section>
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
}
