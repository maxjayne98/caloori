'use client';
import type { ReactNode } from 'react';
import { Button, Input } from '@nourish/ui';
import { StickyContainer } from '@/components/sticky-container';
import { ClearTextButton } from '@/components/text-actions';
import { useI18n } from '@/providers/i18n-provider';

export interface FoodSearchAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  /** Ways to bring in a new food stand out in the accent color. */
  accent?: boolean;
}

const chip =
  'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-medium [&_svg]:size-[13px]';
// Inline so the global button reset cannot override size and colors.
const chipSize = { height: 30, padding: '0 9px', fontSize: 12 };

/**
 * Sticky food search shared by the Food page and the Add food sheet: the search box, then one
 * compact row with an optional start group (e.g. the meal picker) and the action chips.
 */
export function FoodSearchBar({
  query,
  setQuery,
  start,
  actions,
  iconOnly = false,
}: {
  query: string;
  setQuery: (query: string) => void;
  start?: ReactNode;
  actions: readonly FoodSearchAction[];
  /** Always show the actions as round icons (when the start group needs the room). */
  iconOnly?: boolean;
}) {
  const { t } = useI18n();
  return (
    <StickyContainer className="food-search-sticky">
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
      <div className="@container mb-[18px] flex flex-nowrap items-center gap-1.5">
        {start && (
          // min-w-0 lets a scrolling start group (the Food filters) shrink; no overflow here,
          // so the meal picker's selection ring is never clipped.
          <div className="food-search-group flex min-w-0">{start}</div>
        )}
        <span className="flex-1" />
        <div className="food-search-group flex items-center gap-1.5">
          {actions.map((action) => (
            <Button
              key={action.key}
              onClick={action.onClick}
              variant="unstyled"
              aria-label={action.label}
              title={action.label}
              className={chip}
              style={{
                ...chipSize,
                background: action.accent ? 'var(--accent-soft)' : 'var(--neutral-eaeaf0)',
                color: action.accent ? 'var(--accent-text)' : 'var(--foreground)',
              }}
            >
              <span className="grid size-[13px]" aria-hidden="true">
                {action.icon}
              </span>
              {/* Labels only when the row has room; narrow phones get icon chips. */}
              <span
                className={
                  iconOnly
                    ? 'sr-only'
                    : start
                      ? 'hidden @min-[430px]:inline'
                      : 'hidden @min-[300px]:inline'
                }
              >
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </StickyContainer>
  );
}
