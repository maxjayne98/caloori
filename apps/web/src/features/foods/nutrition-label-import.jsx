'use client';

import { useState } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { Button } from '@nourish/ui';
import { parseNutritionLabel } from '@nourish/core';
import { TextActions } from '@/components/text-actions';

export function NutritionLabelImport({ notify, open, onOpenChange }) {
  const [text, setText] = useState('');
  return (
    <>
      {open && (
        <div className="nutrition-label-panel" id="nutrition-label-panel">
          <p className="nutrition-label-instructions" id="nutrition-label-instructions">
            Paste plain text or a table, with one nutrient and value per line. Include “Per 100
            Gram” if the values are per 100 g. Supported: Energy (kcal or kJ), Fat, Carbohydrates,
            and Proteins. Optional: “Name: …” and “Serving size: 2 slices (50 g)”. A serving weight
            converts per-100-g values; without one, the serving is set to 100 g. Other label rows
            are ignored.
          </p>
          <pre className="nutrition-label-example">{`Per 100 Gram
Energy 1,036 kJ (245 kcal)
Fat 1.2 g
Carbohydrates 48 g
Proteins 8.3 g`}</pre>
          <label htmlFor="nutrition-label">Nutrition label text</label>
          <div className="relative">
            <textarea
              id="nutrition-label"
              name="nutritionLabel"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ paddingInlineEnd: 44 }}
              rows={5}
              aria-describedby="nutrition-label-instructions"
              placeholder={
                'Name: Seeded loaf\nServing size: 2 slices (50 g)\nKind\tPer 100 Gram\nEnergy\t1,036 kJ (245 kcal)\nFat\t1.2 g\nCarbohydrates\t48 g\nProteins\t8.3 g'
              }
            />
            <TextActions value={text} onChange={setText} />
          </div>
          <Button
            type="button"
            className="primary nutrition-label-fill"
            variant="unstyled"
            onClick={(event) => {
              const form = event.currentTarget.form;
              const parsed = parseNutritionLabel(new FormData(form).get('nutritionLabel'));
              if (!parsed) {
                notify('Could not find supported nutrition values in that text.');
                return;
              }
              const values = {
                name: parsed.name,
                serving: parsed.serving,
                grams: parsed.gramsPerServing,
                ...parsed.values,
              };
              for (const [name, value] of Object.entries(values)) {
                if (value === undefined || value === null) continue;
                const input = form.elements.namedItem(name);
                if (input) input.value = String(value);
              }
              notify('Nutrition details filled. Please review before saving.');
              onOpenChange(false);
            }}
          >
            <ArrowDownToLine size={16} aria-hidden="true" />
            Fill nutrition fields
          </Button>
        </div>
      )}
    </>
  );
}
