'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, type ComponentProps, type ReactNode } from 'react';

type Choice = { value: string; label: ReactNode; disabled?: boolean };
type Props = ComponentProps<typeof SelectPrimitive.Root> & {
  id?: string;
  className?: string;
  'aria-label'?: string;
  placeholder?: string;
  options: Choice[];
};

/** One accessible, touch-friendly select for every Nourish form and filter. */
export function Select({
  id,
  className = '',
  'aria-label': ariaLabel,
  placeholder = 'Select an option',
  options,
  open: controlledOpen,
  onOpenChange,
  ...props
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  function changeOpen(next: boolean) { setInternalOpen(next); onOpenChange?.(next); }
  return (
    <SelectPrimitive.Root {...props} open={open} onOpenChange={changeOpen}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        className={`nourish-select ${className}`}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown size={16} aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          onEscapeKeyDown={(event) => { event.preventDefault(); event.stopPropagation(); changeOpen(false); }}
          className="nourish-select-menu"
          position="popper"
          sideOffset={6}
          collisionPadding={12}
        >
          <SelectPrimitive.ScrollUpButton className="nourish-select-scroll">
            <ChevronUp size={15} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="nourish-select-options">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="nourish-select-option"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="nourish-select-check">
                  <Check size={15} aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="nourish-select-scroll">
            <ChevronDown size={15} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
