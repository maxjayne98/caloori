'use client';
import * as React from 'react';
import { cn } from '../utils';
export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & { unstyled?: boolean }
>(({ className, unstyled = false, ...props }, ref) => (
  <input
    ref={ref}
    data-slot="input"
    className={cn(
      !unstyled &&
        'flex min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
