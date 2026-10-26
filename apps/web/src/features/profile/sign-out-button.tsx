'use client';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@nourish/ui';
import { useNourishData } from '@/providers/data-provider';

export function SignOutButton() {
  const { signOut, status } = useNourishData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!signOut) return null;
  return <div className="sign-out-control">
    <Button type="button" variant="unstyled" className="sign-out-button" disabled={busy || status === 'saving'}
      onClick={async () => {
        setBusy(true);
        setError('');
        try { await signOut(); }
        catch { setError('Could not sign out. Please try again.'); setBusy(false); }
      }}>
      <LogOut size={16} aria-hidden="true" />
      {busy ? 'Signing out…' : 'Sign out'}
    </Button>
    {error && <p role="alert" className="portion-error">{error}</p>}
  </div>;
}
