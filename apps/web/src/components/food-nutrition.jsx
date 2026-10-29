'use client';
import { ExtraNutrientList } from '@/components/extra-nutrients';

import { RollingNumber } from '@/components/rolling-number';
export function FoodNutrition({ values }) {
  const macroEnergy = Math.max(0, values.p * 4 + values.c * 4 + values.f * 9);
  return (
    <div className="food-nutrition" aria-live="polite">
      <div className="portion-energy">
        <span className="nutrition-caption">Energy</span>
        <div>
          <b>
            <RollingNumber value={values.cal} decimals={2} />
          </b>
          <span>{' kcal'}</span>
        </div>
      </div>
      <div className="portion-macros">
        {[
          ['Protein', 'p', 'protein'],
          ['Carbs', 'c', 'carbs'],
          ['Fat', 'f', 'fat'],
        ].map(([label, key, cls]) => (
          <div key={key} className={'portion-macro ' + cls}>
            <span>{label}</span>
            <b>
              <RollingNumber value={values[key]} decimals={2} />
              <small>{' g'}</small>
            </b>
            <div
              className="nutrition-track"
              role="progressbar"
              aria-label={label + ' share of macro energy'}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(
                macroEnergy ? ((values[key] * (key === 'f' ? 9 : 4)) / macroEnergy) * 100 : 0,
              )}
              title="Share of energy from protein, carbs and fat"
            >
              <i
                style={{
                  width:
                    (macroEnergy
                      ? ((values[key] * (key === 'f' ? 9 : 4)) / macroEnergy) * 100
                      : 0) + '%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <ExtraNutrientList values={values} />
    </div>
  );
}
