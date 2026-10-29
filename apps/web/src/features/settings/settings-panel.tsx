'use client';
import { Button } from '@nourish/ui';
import { useRef, useState, type ChangeEvent } from 'react';
import { APP_VERSION, SUPPORTED_LOCALES, LOCALE_METADATA } from '@nourish/core';
import { ChevronDown } from 'lucide-react';
import { ACCENTS, type Accent, useAppearance } from '@/providers/appearance-provider';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';
import { CHANGELOG } from './changelog-data';
import {
  PATTERN_COUNT,
  PIXEL_COUNT,
  ProfileAvatar,
  avatarChoice,
  resizeProfilePhoto,
} from '@/components/profile-photo';
export function SettingsPanel({
  showChangelogInitially = false,
}: {
  showChangelogInitially?: boolean;
}) {
  const { theme, setTheme, accent, setAccent } = useAppearance();
  const { profile, setProfile, accountId } = useNourishData();
  const { locale, setLocale, t } = useI18n();
  const picker = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [showChangelog, setShowChangelog] = useState(showChangelogInitially);
  const current = avatarChoice(profile);
  function setAvatar(avatar: string) {
    setProfile((previous) => ({ ...previous, avatar }));
  }
  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoError('');
    try {
      const photo = await resizeProfilePhoto(file);
      setProfile((previous) => ({ ...previous, photo, avatar: 'photo' }));
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'That photo could not be used.');
    }
  }
  function removePhoto() {
    setProfile(({ photo: _removed, ...rest }) => ({
      ...rest,
      avatar: rest.avatar === 'photo' ? 'pattern:0' : rest.avatar,
    }));
  }
  const choices = [
    'initial',
    ...Array.from({ length: PIXEL_COUNT }, (_, i) => `pixel:${i}`),
    ...Array.from({ length: PATTERN_COUNT }, (_, i) => `pattern:${i}`),
  ];
  if (profile.photo) choices.splice(1, 0, 'photo');
  // Collapsed: one row, always including the current choice so the selection stays visible.
  const COLLAPSED = 7;
  const visible = showAll
    ? choices
    : choices.slice(0, COLLAPSED).includes(current)
      ? choices.slice(0, COLLAPSED)
      : [...choices.slice(0, COLLAPSED - 1), current];
  const currentVersion = String(APP_VERSION);
  return (
    <div className="settings-panel">
      <div className="settings-heading">
        <h3>{t('settings.avatar')}</h3>
        <div className="settings-photo-actions">
          <Button
            variant="unstyled"
            className="settings-photo-choose"
            onClick={() => picker.current?.click()}
          >
            {profile.photo ? t('settings.changePhoto') : t('settings.uploadPhoto')}
          </Button>
          {profile.photo && (
            <Button variant="unstyled" className="settings-photo-remove" onClick={removePhoto}>
              {t('settings.removePhoto')}
            </Button>
          )}
          <input ref={picker} type="file" accept="image/*" hidden onChange={choosePhoto} />
          <Button variant="unstyled" className="link" onClick={() => setShowAll(!showAll)}>
            {showAll ? t('settings.showLess') : t('settings.viewAll')}
          </Button>
        </div>
      </div>
      <div className="avatar-choices" role="radiogroup" aria-label={t('settings.avatar')}>
        {visible.map((choice) => (
          <Button
            key={choice}
            variant="unstyled"
            role="radio"
            aria-checked={current === choice}
            aria-label={
              choice === 'initial'
                ? t('settings.avatarInitial')
                : choice === 'photo'
                  ? t('settings.avatarPhoto')
                  : choice.startsWith('pixel:')
                    ? t('settings.avatarPixel', { n: Number(choice.slice(6)) + 1 })
                    : t('settings.avatarPattern', { n: Number(choice.slice(8)) + 1 })
            }
            className={current === choice ? 'selected' : ''}
            onClick={() => setAvatar(choice)}
          >
            <ProfileAvatar profile={profile} seed={accountId} choice={choice} size={26} />
          </Button>
        ))}
      </div>
      {photoError && <p role="alert">{photoError}</p>}
      <div className="settings-heading">
        <h3>{t('settings.appearance')}</h3>
        <p>{t('settings.appearanceDesc')}</p>
      </div>
      <label>{t('settings.theme')}</label>
      <div className="settings-segments">
        {(['light', 'dark', 'system'] as const).map((value) => (
          <Button
            key={value}
            variant="unstyled"
            aria-pressed={theme === value}
            className={theme === value ? 'selected' : ''}
            onClick={() => setTheme(value)}
          >
            {value === 'light'
              ? t('settings.themeLight')
              : value === 'dark'
                ? t('settings.themeDark')
                : t('settings.themeSystem')}
          </Button>
        ))}
      </div>
      <label>{t('settings.accentColor')}</label>
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
      <label>{t('settings.language')}</label>
      <div className="settings-segments">
        {SUPPORTED_LOCALES.map((code) => (
          <Button
            key={code}
            variant="unstyled"
            aria-pressed={locale === code}
            className={locale === code ? 'selected' : ''}
            onClick={() => setLocale(code)}
          >
            {LOCALE_METADATA[code].label}
          </Button>
        ))}
      </div>
      <div className="settings-heading settings-about">
        <h3>{t('settings.about')}</h3>
      </div>
      <Button
        variant="unstyled"
        className="settings-version w-full text-left transition-colors hover:bg-[var(--accent-soft)] motion-reduce:transition-none"
        aria-expanded={showChangelog}
        aria-controls="settings-changelog"
        onClick={() => setShowChangelog((open) => !open)}
      >
        <span>{t('settings.version')}</span>
        <span className="flex items-center gap-2">
          <span className="settings-version-number">{APP_VERSION}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 motion-reduce:transition-none ${
              showChangelog ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </span>
      </Button>
      {showChangelog && (
        <div
          id="settings-changelog"
          className="mt-2 space-y-2 rounded-xl bg-[var(--neutral-e9e9ee)] p-3 text-[var(--foreground)]"
        >
          <h4 className="m-0 text-sm font-semibold">{t('settings.releaseNotes')}</h4>
          {CHANGELOG.length ? (
            <div className="space-y-2">
              {!CHANGELOG.some((release) => release.version === currentVersion) && (
                <details open className="rounded-lg bg-[var(--surface)] px-3 py-2">
                  <summary className="cursor-pointer text-xs font-semibold">
                    {currentVersion}
                  </summary>
                  <p className="mb-0 mt-2 text-xs text-[var(--neutral-85858b)]">
                    {t('settings.noReleaseNotes')}
                  </p>
                </details>
              )}
              {CHANGELOG.map((release, index) => (
                <details
                  key={release.version}
                  open={release.version === currentVersion || index === 0}
                  className="rounded-lg bg-[var(--surface)] px-3 py-2"
                >
                  <summary className="cursor-pointer text-xs font-semibold">
                    {release.version}
                  </summary>
                  <ul className="mt-2 space-y-2 ps-4 text-xs">
                    {release.entries.map((entry) => (
                      <li key={entry.hash}>
                        <div className="flex items-start justify-between gap-2">
                          <span>{entry.subject}</span>
                        </div>
                        {entry.body && (
                          <p className="mb-0 mt-1 whitespace-pre-line text-[var(--neutral-85858b)]">
                            {entry.body}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          ) : (
            <p className="m-0 text-xs text-[var(--neutral-85858b)]">
              {t('settings.noReleaseNotes')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
