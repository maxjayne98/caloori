'use client';

import { Button } from '@nourish/ui';
import { today } from '@nourish/core';
import { field, formData } from '@/components/form-fields';
export function LogWeightSheet({ notify, setWeights, weights, setSheet, profile }) {
  return (
    <form
      onSubmit={(e) => {
        let d = formData(e);
        if (+d.weight <= 0) return notify('Enter a weight greater than zero');
        setWeights(
          [
            ...weights.filter((x) => x.date !== d.date),
            {
              date: d.date,
              weight: +d.weight,
            },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        );
        setSheet(null);
        notify('Check-in saved');
      }}
    >
      {field('Weight (kg)', 'weight', weights.at(-1)?.weight || profile.weight)}
      {field('Date', 'date', today, 'date')}
      <Button className="primary" variant="unstyled">
        Save check-in
      </Button>
    </form>
  );
}
