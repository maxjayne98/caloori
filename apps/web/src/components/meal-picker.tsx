'use client';
import { Button, cn } from '@nourish/ui';
import { Icon } from '@/components/icon';
import { useI18n } from '@/providers/i18n-provider';

const MEALS = [
  {
    meal: 'Breakfast',
    icon: 'Sun',
    color: 'var(--meal-breakfast)',
    soft: 'var(--meal-breakfast-soft)',
  },
  { meal: 'Lunch', icon: 'Lunch', color: 'var(--meal-lunch)', soft: 'var(--meal-lunch-soft)' },
  { meal: 'Dinner', icon: 'Moon', color: 'var(--meal-dinner)', soft: 'var(--meal-dinner-soft)' },
  { meal: 'Snacks', icon: 'Snack', color: 'var(--meal-snacks)', soft: 'var(--meal-snacks-soft)' },
] as const;

/** Four round meal icons; the chosen one grows slightly and gets a ring in its meal color. */
export function MealPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (meal: string) => void;
}) {
  const { t, tMeal } = useI18n();
  return (
    <div
      role="radiogroup"
      aria-label={t('meals.logTo')}
      className="flex items-center gap-1.5 border-s border-[var(--neutral-e2e2e8)] ps-3"
    >
      {MEALS.map(({ meal, icon, color, soft }) => {
        const selected = value === meal;
        return (
          <Button
            key={meal}
            type="button"
            variant="unstyled"
            role="radio"
            aria-checked={selected}
            aria-label={tMeal(meal)}
            title={tMeal(meal)}
            onClick={() => onChange(meal)}
            className={cn(
              'grid size-8 place-items-center rounded-full transition-[transform,box-shadow,opacity] duration-200 ease-out motion-reduce:transition-none [&_svg]:size-4',
              selected ? 'scale-110' : 'opacity-55 hover:opacity-80',
            )}
            style={{
              color,
              background: soft,
              boxShadow: selected ? `0 0 0 2px var(--surface), 0 0 0 3.5px ${color}` : 'none',
            }}
          >
            <Icon type={icon} />
          </Button>
        );
      })}
    </div>
  );
}
