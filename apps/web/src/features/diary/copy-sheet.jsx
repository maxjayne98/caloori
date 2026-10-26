'use client';

import { Button } from '@nourish/ui';
import { iso, appendDiaryEntries } from '@nourish/core';
import { field, formData } from '@/components/form-fields';
export function CopyDaySheet({ entries, notify, setEntries, day, profile, setSheet }) {
  return (
    <form
      onSubmit={(e) => {
        let d = formData(e),
          src = entries[d.date] || [];
        if (!src.length) return notify('No meals logged on that day');
        setEntries((prev) => appendDiaryEntries(prev, day, src, profile));
        setSheet(null);
        notify('Meals copied');
      }}
    >
      <p>Add all meals from another day to the selected day.</p>
      {field(
        'Copy from',
        'date',
        iso(new Date(new Date(day + 'T12:00:00').getTime() - 86400000)),
        'date',
      )}
      <Button className="primary" variant="unstyled">
        Copy meals
      </Button>
    </form>
  );
}
