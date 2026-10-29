'use client';
import { Button } from '@nourish/ui';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { ProfileForm } from './profile-sheet';
import { useI18n } from '@/providers/i18n-provider';
export function ProfilePage({ profile, setProfile, notify, onEditTodayLayout }) {
  const { t } = useI18n();
  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="intro">
        <h1 id="profile-title">{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>
      <Button
        variant="unstyled"
        className="card mb-3.5 flex w-full items-center gap-3 text-start"
        onClick={onEditTodayLayout}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
          <LayoutGrid size={18} aria-hidden="true" />
        </span>
        <span className="grid flex-1 gap-0.5">
          <strong className="text-[15px]">{t('today.editLayout')}</strong>
          <small className="text-xs text-[var(--neutral-85858b)]">
            {t('profile.editLayoutHint')}
          </small>
        </span>
        <ChevronRight
          size={18}
          aria-hidden="true"
          className="text-[var(--neutral-85858b)] rtl:rotate-180"
        />
      </Button>
      <ProfileForm profile={profile} setProfile={setProfile} notify={notify} />
    </section>
  );
}
