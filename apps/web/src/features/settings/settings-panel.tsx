'use client';
import { Button } from '@nourish/ui';
import { useRef, useState, type ChangeEvent } from 'react';
import { ACCENTS, type Accent, useAppearance } from '@/providers/appearance-provider';
import { useNourishData } from '@/providers/data-provider';
import {
  PATTERN_COUNT,
  PIXEL_COUNT,
  ProfileAvatar,
  avatarChoice,
  resizeProfilePhoto,
} from '@/components/profile-photo';
export function SettingsPanel() {
  const { theme, setTheme, accent, setAccent } = useAppearance();
  const { profile, setProfile, accountId } = useNourishData();
  const picker = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState('');
  const [showAll, setShowAll] = useState(false);
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
  return (
    <div className="settings-panel">
      <div className="settings-heading">
        <h3>Avatar</h3>
        <div className="settings-photo-actions">
          <Button
            variant="unstyled"
            className="settings-photo-choose"
            onClick={() => picker.current?.click()}
          >
            {profile.photo ? 'Change photo' : 'Upload photo'}
          </Button>
          {profile.photo && (
            <Button variant="unstyled" className="settings-photo-remove" onClick={removePhoto}>
              Remove photo
            </Button>
          )}
          <input ref={picker} type="file" accept="image/*" hidden onChange={choosePhoto} />
          <Button variant="unstyled" className="link" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : 'View all'}
          </Button>
        </div>
      </div>
      <div className="avatar-choices" role="radiogroup" aria-label="Avatar">
        {visible.map((choice) => (
          <Button
            key={choice}
            variant="unstyled"
            role="radio"
            aria-checked={current === choice}
            aria-label={
              choice === 'initial'
                ? 'First letter of your name'
                : choice === 'photo'
                  ? 'Your photo'
                  : choice.startsWith('pixel:')
                    ? `Pixel character ${Number(choice.slice(6)) + 1}`
                    : `Pattern ${Number(choice.slice(8)) + 1}`
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
        <h3>Appearance</h3>
        <p>Make Nourish feel like you.</p>
      </div>
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
