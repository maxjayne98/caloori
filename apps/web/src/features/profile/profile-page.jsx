'use client';
import { ProfileForm } from './profile-sheet';
export function ProfilePage({ profile, setProfile, notify }) {
  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="intro">
        <h1 id="profile-title">Made for you.</h1>
        <p>Your details. Your goals. Your own pace.</p>
      </div>
      <ProfileForm profile={profile} setProfile={setProfile} notify={notify} />
    </section>
  );
}
