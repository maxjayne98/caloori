'use client';

import { useState } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { Button } from '@nourish/ui';
import { parseNutritionLabel } from '@nourish/core';
import { TextActions } from '@/components/text-actions';
import { SERVING_FILL_EVENT } from '@/features/foods/serving-fields';
import { useI18n } from '@/providers/i18n-provider';

export function NutritionLabelImport({ notify, open, onOpenChange }) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  return (
    <>
      {open && (
        <div className="nutrition-label-panel" id="nutrition-label-panel">
          <p className="nutrition-label-instructions" id="nutrition-label-instructions">
            {t('label.instructions')}
          </p>
          <pre className="nutrition-label-example">{`Per 100 gram
Energie 1.036 kJ (245 kcal)
Vet 1,2 g
Koolhydraten 48 g
Eiwitten 8,3 g`}</pre>
          <label htmlFor="nutrition-label">{t('label.text')}</label>
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
                notify(t('label.notFound'));
                return;
              }
              const values = { name: parsed.name, ...parsed.values };
              for (const [name, value] of Object.entries(values)) {
                if (value === undefined || value === null) continue;
                const input = form.elements.namedItem(name);
                if (input) input.value = String(value);
              }
              if (parsed.serving)
                form.dispatchEvent(
                  new CustomEvent(SERVING_FILL_EVENT, {
                    detail: { serving: parsed.serving, grams: parsed.gramsPerServing },
                  }),
                );
              notify(t('label.filled'));
              onOpenChange(false);
            }}
          >
            <ArrowDownToLine size={16} aria-hidden="true" />
            {t('label.fill')}
          </Button>
        </div>
      )}
    </>
  );
}
