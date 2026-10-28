'use client';

import { CalendarDays, BookOpen, Plus, Dumbbell, ChartNoAxesCombined } from 'lucide-react';
import { Button } from '@nourish/ui';
import { useI18n } from '@/providers/i18n-provider';

const items = [
  { name: 'Today', icon: CalendarDays, key: 'nav.today' },
  { name: 'Food', icon: BookOpen, key: 'nav.food' },
  { name: 'Add', icon: Plus, action: 'food', key: 'nav.add' },
  { name: 'Activity', icon: Dumbbell, action: 'activity', key: 'nav.activity' },
  { name: 'Progress', icon: ChartNoAxesCombined, key: 'nav.progress' },
];

export function BottomNavigation({ tab, sheet, onNavigate, onAddFood, onLogActivity }) {
  const { t } = useI18n();
  return (
    <nav className="nav floating-dock" aria-label="Main navigation">
      {items.map(({ name, icon: Glyph, action, key }) => {
        const selected = !action && tab === name;
        const expanded =
          action === 'activity'
            ? sheet === 'activity'
            : action === 'food'
              ? sheet === 'add'
              : undefined;
        const label = t(key);
        return (
          <Button
            key={name}
            type="button"
            variant="unstyled"
            className={['dock-item', action === 'food' ? 'add-nav' : '', selected ? 'active' : '']
              .filter(Boolean)
              .join(' ')}
            aria-label={
              action === 'activity'
                ? t('activity.logButton')
                : action === 'food'
                  ? t('sheet.addFood')
                  : label
            }
            aria-current={selected ? 'page' : undefined}
            aria-haspopup={action ? 'dialog' : undefined}
            aria-expanded={expanded}
            onClick={() =>
              action === 'food'
                ? onAddFood()
                : action === 'activity'
                  ? onLogActivity()
                  : onNavigate(name)
            }
          >
            <span className="nav-icon">
              <Glyph size={23} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="nav-label">{label}</span>
          </Button>
        );
      })}
    </nav>
  );
}
