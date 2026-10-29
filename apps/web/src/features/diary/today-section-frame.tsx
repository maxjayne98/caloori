'use client';
import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Button, cn } from '@nourish/ui';
import { useI18n } from '@/providers/i18n-provider';

const iconButton =
  'grid size-8 place-items-center rounded-full bg-[var(--surface)] text-[var(--foreground)] transition-opacity disabled:opacity-30 motion-reduce:transition-none';

/**
 * Wraps one Today section. Outside edit mode it renders the section as is (or nothing when
 * hidden); in edit mode it adds move and hide controls and makes the content inert.
 */
export function TodaySectionFrame({
  label,
  editing,
  hidden,
  first,
  last,
  onMove,
  onToggle,
  children,
}: {
  label: string;
  editing: boolean;
  hidden: boolean;
  first: boolean;
  last: boolean;
  onMove: (step: -1 | 1) => void;
  onToggle: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();
  if (!editing) return hidden ? null : <>{children}</>;
  return (
    <section
      aria-label={label}
      className="my-3 rounded-[24px] border-2 border-dashed border-[var(--neutral-e2e2e8)] p-2 motion-safe:animate-[today-edit-in_0.2s_ease-out]"
    >
      <div className="flex items-center gap-1.5 px-1 pb-1.5">
        <span className="flex-1 text-xs font-semibold text-[var(--neutral-85858b)]">
          {label}
          {hidden && ` · ${t('today.hiddenSection')}`}
        </span>
        <Button
          variant="unstyled"
          className={iconButton}
          aria-label={t('today.moveUp')}
          disabled={first}
          onClick={() => onMove(-1)}
        >
          <ChevronUp size={16} aria-hidden="true" />
        </Button>
        <Button
          variant="unstyled"
          className={iconButton}
          aria-label={t('today.moveDown')}
          disabled={last}
          onClick={() => onMove(1)}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </Button>
        <Button
          variant="unstyled"
          className={iconButton}
          aria-label={hidden ? t('today.showSection') : t('today.hideSection')}
          aria-pressed={hidden}
          onClick={onToggle}
        >
          {hidden ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </Button>
      </div>
      {/* Content stays visible for orientation but can't be used while rearranging. */}
      <div inert className={cn('pointer-events-none select-none', hidden && 'opacity-35')}>
        {children}
      </div>
    </section>
  );
}
