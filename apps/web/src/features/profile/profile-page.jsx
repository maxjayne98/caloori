'use client';
import { ProfileForm } from './profile-sheet';
import { useI18n } from '@/providers/i18n-provider';
export function ProfilePage({ profile, setProfile, notify }) {
  const { t } = useI18n();
  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="intro">
        <h1 id="profile-title">{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>
      <ProfileForm profile={profile} setProfile={setProfile} notify={notify} />
    </section>
  );
}
