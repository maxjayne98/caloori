'use client';
import { Button } from '@nourish/ui';
import { ClipboardPaste, X } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';

/**
 * Small paste / clear buttons for a text box, placed in its top-end corner (the parent must be
 * `relative`). Paste shows while the box is empty, clear once it has text.
 */
export function TextActions({
  value,
  onChange,
  disabled,
  inline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Sit in the parent's flow (e.g. beside a send button) instead of the top-end corner. */
  inline?: boolean;
}) {
  const { t } = useI18n();
  // Older browsers or denied permission: hide paste rather than show a button that fails.
  const canPaste = typeof navigator !== 'undefined' && !!navigator.clipboard?.readText;
  const button =
    'grid size-8 place-items-center rounded-full text-[var(--neutral-85858b)] active:scale-95 motion-reduce:transition-none';

  const wrapper = inline ? 'flex shrink-0 self-end pb-1.5' : 'absolute end-2 top-2 z-10 flex';
  // Inline so the global button reset cannot override them.
  const look = {
    background: 'var(--sheet-background)',
    color: 'var(--neutral-85858b)',
    width: 32,
    height: 32,
    padding: 0,
    borderRadius: 999,
  };

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(value ? value + '\n' + text : text);
    } catch {
      // Permission denied: the user can still long-press and paste.
    }
  }

  if (value)
    return (
      <div className={wrapper}>
        <Button
          type="button"
          variant="unstyled"
          className={button}
          style={look}
          aria-label={t('common.clearText')}
          title={t('common.clearText')}
          disabled={disabled}
          onClick={() => onChange('')}
        >
          <X size={16} aria-hidden="true" />
        </Button>
      </div>
    );
  if (!canPaste) return null;
  return (
    <div className={wrapper}>
      <Button
        type="button"
        variant="unstyled"
        className={button}
        style={look}
        aria-label={t('common.paste')}
        title={t('common.paste')}
        disabled={disabled}
        onClick={paste}
      >
        <ClipboardPaste size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}

/** A clear (✕) button for a one-line field; wrap the field in a `relative` element. */
export function ClearTextButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  if (!value) return null;
  return (
    <Button
      type="button"
      variant="unstyled"
      aria-label={t('common.clearText')}
      title={t('common.clearText')}
      onClick={() => onChange('')}
      className="absolute end-3 top-1/2 grid -translate-y-1/2 place-items-center active:scale-95 motion-reduce:transition-none"
      // Inline so the global button reset cannot override them.
      style={{
        width: 28,
        height: 28,
        padding: 0,
        borderRadius: 999,
        background: 'var(--sheet-background)',
        color: 'var(--neutral-85858b)',
      }}
    >
      <X size={15} aria-hidden="true" />
    </Button>
  );
}
