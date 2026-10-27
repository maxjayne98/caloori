'use client';
import { Button } from '@nourish/ui';
import { ACCENTS, type Accent, useAppearance } from '@/providers/appearance-provider';
export function SettingsPanel() {
  const { theme, setTheme, accent, setAccent } = useAppearance();
  return (
    <div className="settings-panel">
      <h3>Appearance</h3>
      <p>Make Nourish feel like you.</p>
      <label>Theme</label>
      <div className="settings-segments">
        {['light', 'dark', 'system'].map((value) => (
          <Button
            key={value}
            variant="unstyled"
            aria-pressed={theme === value}
            className={theme === value ? 'selected' : ''}
            onClick={() => setTheme(value)}
          >
            {value[0].toUpperCase() + value.slice(1)}
          </Button>
        ))}
      </div>
      <label>Accent color</label>
      <div className="accent-swatches">
        {Object.entries(ACCENTS).map(([name, color]) => (
          <Button
            variant="unstyled"
            key={name}
            aria-label={`${name} accent`}
            aria-pressed={accent === name}
            onClick={() => setAccent(name as Accent)}
            style={{ background: color }}
            className={accent === name ? 'selected' : ''}
          >
            {accent === name ? '✓' : ''}
          </Button>
        ))}
      </div>
    </div>
  );
}
