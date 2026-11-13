'use client';

import { Button } from '@nourish/ui';
import { portionNumber } from '@nourish/core';
import { Check, Pencil, Plus, Zap } from 'lucide-react';
import { useI18n } from '@/providers/i18n-provider';

/**
 * Library rows. The row and its + open the portion editor. The add sheet also passes
 * `onQuickAdd` (a ⚡ button that adds the usual amount in one tap), `count` for how many are
 * already picked and `detail` for the remembered amount.
 */
export function FoodRows({
  items,
  setChosen,
  setQty,
  setSheet,
  onEdit,
  onOpen,
  onQuickAdd,
  count,
  detail,
}) {
  const { t } = useI18n();
  const open =
    onOpen ||
    ((f) => {
      setChosen(f);
      setQty(1);
      setSheet('add');
    });
  return items.map((f) => {
    const picked = count?.(f) ?? 0;
    const remembered = detail?.(f);
    return (
      <div className="food-row" key={f.id}>
        <Button className="info" onClick={() => open(f)} variant="unstyled">
          <b>{f.name}</b>
          <small>
            {remembered
              ? t('add.usual', { amount: remembered })
              : f.serving + ' · ' + f.cal + ' kcal'}
          </small>
          <span className="food-row-macros">
            {'Protein ' +
              portionNumber(f.p) +
              ' g · Carbs ' +
              portionNumber(f.c) +
              ' g · Fat ' +
              portionNumber(f.f) +
              ' g'}
          </span>
        </Button>
        {onEdit && (
          <Button
            className="item-action"
            aria-label={t('food.editFood', { name: f.name })}
            title={t('food.editFood', { name: f.name })}
            onClick={() => onEdit(f)}
            variant="unstyled"
          >
            <Pencil size={16} aria-hidden="true" />
          </Button>
        )}
        {onQuickAdd && (
          // One-tap quick add of the usual amount; the + next to it opens the amount screen.
          <Button
            className="plus relative"
            aria-label={t('add.quickAdd', { name: f.name })}
            title={t('add.quickAdd', { name: f.name })}
            onClick={() => onQuickAdd(f)}
            variant="unstyled"
            // Picked foods turn solid so the list shows what is already in the basket.
            style={picked ? { background: 'var(--accent)', color: 'var(--surface)' } : undefined}
          >
            {picked ? <Check size={17} aria-hidden="true" /> : <Zap size={16} aria-hidden="true" />}
            {picked > 1 && (
              <span
                className="absolute -end-1 -top-1 grid size-4 place-items-center rounded-full text-[10px] font-bold"
                style={{ background: 'var(--foreground)', color: 'var(--surface)' }}
              >
                {picked}
              </span>
            )}
          </Button>
        )}
        <Button
          className="plus"
          aria-label={t('add.open', { name: f.name })}
          onClick={() => open(f)}
          variant="unstyled"
        >
          <Plus size={18} aria-hidden="true" />
        </Button>
      </div>
    );
  });
}
