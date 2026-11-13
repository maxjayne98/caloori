'use client';

import { ClearTextButton } from '@/components/text-actions';
import { Button, Input } from '@nourish/ui';
import { Bookmark, Plus } from 'lucide-react';
import { Icon } from '@/components/icon';
import { MealPicker } from '@/components/meal-picker';
import { StickyContainer } from '@/components/sticky-container';
import { foods, appendDiaryEntries, foodLibrary } from '@nourish/core';
import { FoodPortionEditor } from '@/features/foods/portion-editor';
import { FoodRows } from '@/features/foods/food-rows';
import { useI18n } from '@/providers/i18n-provider';
const chip = 'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-medium';
// Inline so the global button reset cannot override size and colors.
const chipSize = { height: 30, padding: '0 9px', fontSize: 12 };
const accentChip = { background: 'var(--accent-soft)', color: 'var(--accent-text)' };

export function AddFoodSheet({
  chosen,
  meal,
  setEntries,
  day,
  profile,
  setChosen,
  setSheet,
  notify,
  setMeal,
  query,
  setQuery,
  custom,
  setQty,
}) {
  const { t, tMeal } = useI18n();
  return chosen ? (
    <FoodPortionEditor
      key={'add' + chosen.id}
      food={{
        ...chosen,
        qty: undefined,
        portion: undefined,
      }}
      initialMeal={meal}
      onSave={(data) => {
        setEntries((prev) =>
          appendDiaryEntries(
            prev,
            day,
            [
              {
                ...chosen,
                qty: data.qty,
                meal: data.meal,
                portion: data.portion,
              },
            ],
            profile,
          ),
        );
        setChosen(null);
        setSheet(null);
        notify(t('toast.addedTo', { meal: tMeal(data.meal) }));
      }}
      onBack={() => setChosen(null)}
    />
  ) : (
    <>
      <StickyContainer className="add-food-sticky">
        <div className="relative mb-[15px]">
          <Input
            className="search"
            style={{ marginBottom: 0, paddingInlineEnd: 44 }}
            placeholder={t('food.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('food.searchAria')}
            unstyled
          />
          <ClearTextButton value={query} onChange={setQuery} />
        </div>
        {/* One compact row: meal on the start side, actions on the end. The two ways to bring
            in a new food stand out in the accent color. */}
        <div className="@container mb-[18px] flex flex-nowrap items-center gap-1.5">
          <MealPicker value={meal} onChange={setMeal} divider={false} />
          <span className="flex-1" />
          <Button
            onClick={() => setSheet('meals')}
            variant="unstyled"
            aria-label={t('food.mealsShort')}
            title={t('food.mealsShort')}
            className={chip}
            style={{ ...chipSize, background: 'var(--neutral-eaeaf0)', color: 'var(--foreground)' }}
          >
            <Bookmark size={13} aria-hidden="true" />
            {/* Labels only when the row has room; narrow phones get icon chips. */}
            <span className="hidden @min-[430px]:inline">{t('food.mealsShort')}</span>
          </Button>
          <Button
            onClick={() => setSheet('barcode')}
            variant="unstyled"
            aria-label={t('food.barcode')}
            title={t('food.barcode')}
            className={chip}
            style={{ ...chipSize, ...accentChip }}
          >
            <span className="grid size-[13px] [&_svg]:size-[13px]">
              <Icon type="Barcode" />
            </span>
            <span className="hidden @min-[430px]:inline">{t('food.barcode')}</span>
          </Button>
          <Button
            onClick={() => setSheet('custom')}
            variant="unstyled"
            aria-label={t('sheet.custom')}
            title={t('sheet.custom')}
            className={chip}
            style={{ ...chipSize, ...accentChip }}
          >
            <Plus size={13} aria-hidden="true" />
            <span className="hidden @min-[430px]:inline">{t('sheet.custom')}</span>
          </Button>
        </div>
      </StickyContainer>
      <div className="eyebrow">{query ? t('food.searchResults') : t('food.everydayFavorites')}</div>
      {
        <FoodRows
          items={foodLibrary(foods, custom).filter((x) =>
            x.name.toLowerCase().includes(query.toLowerCase()),
          )}
          setChosen={setChosen}
          setQty={setQty}
          setSheet={setSheet}
        />
      }
      {!foodLibrary(foods, custom).some((x) =>
        x.name.toLowerCase().includes(query.toLowerCase()),
      ) && <div className="empty">{t('food.noMatch')}</div>}
      <Button className="secondary" onClick={() => setSheet('custom')} variant="unstyled">
        + {t('food.createFood')}
      </Button>
    </>
  );
}
