'use client';

import { CalendarDays, BookOpen, Plus, Dumbbell, ChartNoAxesCombined } from 'lucide-react';
import { Button } from '@nourish/ui';

const items = [
  { name: 'Today', icon: CalendarDays },
  { name: 'Food', icon: BookOpen },
  { name: 'Add', icon: Plus, action: 'food' },
  { name: 'Activity', icon: Dumbbell, action: 'activity' },
  { name: 'Progress', icon: ChartNoAxesCombined },
];

export function BottomNavigation({ tab, sheet, onNavigate, onAddFood, onLogActivity }) {
  return (
    <nav className="nav floating-dock" aria-label="Main navigation">
      {items.map(({ name, icon: Glyph, action }) => {
        const selected = !action && tab === name;
        const expanded =
          action === 'activity'
            ? sheet === 'activity'
            : action === 'food'
              ? sheet === 'add'
              : undefined;
        return (
          <Button
            key={name}
            type="button"
            variant="unstyled"
            className={['dock-item', action === 'food' ? 'add-nav' : '', selected ? 'active' : '']
              .filter(Boolean)
              .join(' ')}
            aria-label={
              action === 'activity' ? 'Log activity' : action === 'food' ? 'Add food' : name
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
            <span className="nav-label">{name}</span>
          </Button>
        );
      })}
    </nav>
  );
}
