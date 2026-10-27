'use client';
import { HeartLoader } from '@/components/heart-loader';
import { useRef, useState } from 'react';
import { SignOutButton } from '@/features/profile/sign-out-button';
import { Button, Input } from '@nourish/ui';
import { importState, AppStateSchema } from '@nourish/core';
import { ACCENTS, type Accent, useAppearance } from '@/providers/appearance-provider';
import { useNourishData } from '@/providers/data-provider';
export function SettingsPanel() {
  const { theme, setTheme, accent, setAccent } = useAppearance(),
    data = useNourishData(),
    file = useRef<HTMLInputElement>(null),
    [message, M] = useState(''),
    [pending, P] = useState<ReturnType<typeof importState> | null>(null);
  function exportData() {
    const state = AppStateSchema.parse(data),
      blob = new Blob([JSON.stringify(state, null, 2)], {
        type: 'application/json',
      }),
      url = URL.createObjectURL(blob),
      link = document.createElement('a');
    link.href = url;
    link.download = 'nourish-backup.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
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
      <h3 className="mt-8">Your data</h3>
      <SignOutButton />
      <p>
        {data.repositoryKind === 'local'
          ? 'Stored on this browser. Cloud storage has not been configured.'
          : 'Stored in your private cloud account.'}
      </p>
      <div role="status">
        {data.status === 'saved' ? (
          'All changes saved.'
        ) : data.status === 'saving' ? (
          <HeartLoader inline label="Saving…" />
        ) : (
          data.error || 'Opening your data…'
        )}
      </div>
      <Button variant="unstyled" className="primary" onClick={exportData}>
        Export backup
      </Button>
      <Button variant="unstyled" className="secondary" onClick={() => file.current?.click()}>
        Import backup
      </Button>
      <Input
        ref={file}
        unstyled
        hidden
        type="file"
        accept="application/json,.json"
        aria-label="Import backup file"
        onChange={async (e) => {
          const input = e.currentTarget,
            item = input.files?.[0];
          if (!item) return;
          if (item.size > 8 * 1024 * 1024) {
            M('This backup is too large.');
            return;
          }
          try {
            P(importState(JSON.parse(await item.text())));
            M('Backup checked. Review before replacing this version’s data.');
          } catch {
            M('This file is not a valid Nourish backup. No data changed.');
          }
          input.value = '';
        }}
      />
      {pending && (
        <div className="import-review">
          <p>
            Replace this version’s data with {Object.values(pending.entries).flat().length} food
            entries, {pending.weights.length} weigh-ins and {pending.templates.length} saved meals?
            Export your current backup first.
          </p>
          <Button
            variant="unstyled"
            className="primary"
            onClick={() => {
              data.importBackup(pending);
              P(null);
              M('Backup imported.');
            }}
          >
            Replace this version’s data
          </Button>
          <Button variant="unstyled" className="secondary" onClick={() => P(null)}>
            Cancel
          </Button>
        </div>
      )}
      {message && <div role="status">{message}</div>}
    </div>
  );
}
