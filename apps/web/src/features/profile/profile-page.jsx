'use client';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@nourish/ui';
import { ProfileForm } from './profile-sheet';
export function ProfilePage({ profile, setProfile, notify, onBack, onSettings }) {
  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="page-toolbar">
        <Button
          variant="unstyled"
          className="back-button"
          onClick={onBack}
          aria-label="Back to diary"
        >
          <ArrowLeft size={18} />
        </Button>
        <span>YOUR SPACE</span>
      </div>
      <div className="intro">
        <h1 id="profile-title">Made for you.</h1>
        <p>Your details. Your goals. Your own pace.</p>
      </div>
      <div className="card profile-card">
        <ProfileForm
          profile={profile}
          setProfile={setProfile}
          notify={notify}
          onSettings={onSettings}
        />
      </div>
    </section>
  );
}
