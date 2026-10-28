'use client';

import { Button } from '@nourish/ui';
import { iso, appendDiaryEntries } from '@nourish/core';
import { field, formData } from '@/components/form-fields';
import { useI18n } from '@/providers/i18n-provider';
export function CopyDaySheet({ entries, notify, setEntries, day, profile, setSheet }) {
  const { t } = useI18n();
  return (
    <form
      onSubmit={(e) => {
        let d = formData(e),
          src = entries[d.date] || [];
        if (!src.length) return notify(t('toast.noMealsCopied'));
        setEntries((prev) => appendDiaryEntries(prev, day, src, profile));
        setSheet(null);
        notify(t('toast.mealsCopied'));
      }}
    >
      <p>{t('copy.desc')}</p>
      {field(
        t('copy.from'),
        'date',
        iso(new Date(new Date(day + 'T12:00:00').getTime() - 86400000)),
        'date',
      )}
      <Button className="primary" variant="unstyled">
        {t('copy.button')}
      </Button>
    </form>
  );
}
