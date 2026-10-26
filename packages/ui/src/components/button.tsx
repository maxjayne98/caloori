'use client';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

// shadcn/ui button, with an unstyled variant to preserve the existing Nourish design exactly.
export const buttonVariants = cva('', {
  variants: {
    variant: {
      default:
        'inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50',
      outline:
        'inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-sm',
      ghost: 'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm hover:bg-muted',
      unstyled: '',
    },
  },
  defaultVariants: { variant: 'default' },
});
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';
    return (
      <Component
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
