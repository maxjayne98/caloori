'use client';
import React, { useEffect, useState, useRef } from 'react';
import type { AssistantRequest } from '@nourish/core';
import { createClient, type SupabaseClient, type Session } from '@nourish/database';
import { LocalRepository, SupabaseRepository, type NourishRepository } from '@nourish/database';
import { FoodCache, SnapshotCache } from '@nourish/database';
import { DataProvider } from './data-provider';
import { LoginScreen } from '@/features/auth/login-screen';
import { AppLoading } from '@/components/heart-loader';

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const [repository, setRepository] = useState<NourishRepository | null>(null);
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [localPreview, setLocalPreview] = useState(false);
  const [accountId, setAccountId] = useState('');
  const owner = useRef<string | null>(null);
  const activeCache = useRef<SnapshotCache | null>(null);
  function createFoodCache(id: string) {
    try {
      return new FoodCache(localStorage, id);
    } catch {
      return undefined;
    }
  }
  function createSnapshotCache(id: string) {
    try {
      return new SnapshotCache(sessionStorage, id);
    } catch {
      return null;
    }
  }
  const driver = process.env.NEXT_PUBLIC_STORAGE_DRIVER || 'local';

  useEffect(() => {
    if (driver === 'local') {
      setChecking(false);
      return;
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (driver !== 'supabase' || !url || !key) {
      setMessage('Sign-in is not configured yet. Please try again once setup is complete.');
      setChecking(false);
      return;
    }
    let active = true;
    const supabase = createClient(url, key, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    setClient(supabase);
    function sessionChanged(session: Session | null) {
      if (!active) return;
      setChecking(false);
      if (owner.current === (session?.user.id ?? null)) return;
      activeCache.current?.dispose();
      activeCache.current = session ? createSnapshotCache(session.user.id) : null;
      owner.current = session?.user.id ?? null;
      setAccountId(session?.user.id ?? '');
      setRepository(
        session
          ? new SupabaseRepository(
              supabase,
              session.user.id,
              activeCache.current ?? undefined,
              createFoodCache(session.user.id),
            )
          : null,
      );
      setBusy(false);
      setMessage('');
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => sessionChanged(session));
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setMessage('Your sign-in could not be completed. Please try again.');
          setChecking(false);
          return;
        }
        sessionChanged(data.session);
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.has('error')) {
          setMessage('Google sign-in was not completed. You can try again whenever you’re ready.');
          window.history.replaceState(null, '', window.location.pathname);
        }
      })
      .catch(() => {
        if (active) {
          setMessage('Could not connect to sign-in. Check your connection and try again.');
          setChecking(false);
        }
      });
    return () => {
      active = false;
      owner.current = null;
      data.subscription.unsubscribe();
    };
  }, [driver]);

  async function signInWithGoogle() {
    if (!client || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch {
      setMessage('Could not start Google sign-in. Please check your connection and try again.');
      setBusy(false);
    }
  }
  if (repository && (driver !== 'local' || localPreview)) {
    return (
      <DataProvider
        key={repository.kind + ':' + accountId}
        repository={repository}
        accountId={accountId || 'local'}
        onAskAssistant={
          client
            ? async (request: AssistantRequest) => {
                const { data, error } = await client.functions.invoke('nourish-assistant', {
                  body: request,
                });
                if (error) {
                  let message =
                    'The assistant is not connected yet. Its secure function and Gemini API key need to be configured.';
                  try {
                    const body = await error.context?.json();
                    if (typeof body?.message === 'string')
                      message = /jwt/i.test(body.message)
                        ? 'The assistant sign-in connection still needs setup. Your account data has not changed.'
                        : body.message;
                  } catch {}
                  throw new Error(message);
                }
                return data;
              }
            : undefined
        }
        onSignOut={
          client
            ? async () => {
                const { error } = await client.auth.signOut({ scope: 'local' });
                if (error) throw new Error('Could not sign out. Please try again.');
                activeCache.current?.dispose();
              }
            : async () => {
                setLocalPreview(false);
                setRepository(null);
              }
        }
      >
        {children}
      </DataProvider>
    );
  }
  // Restoring a saved session: show the diary loader rather than flashing the login page.
  if (checking) return <AppLoading />;
  return (
    <LoginScreen
      ready={!!client}
      busy={busy}
      checking={checking}
      message={message}
      onGoogle={signInWithGoogle}
      onPreview={
        driver === 'local'
          ? () => {
              setRepository(new LocalRepository(localStorage));
              setLocalPreview(true);
            }
          : undefined
      }
    />
  );
}
