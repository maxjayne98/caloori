'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { HeartLoader } from '@/components/heart-loader';
import {
  applyAssistantProposal,
  type AssistantRequest,
  type AssistantProposal,
} from '@nourish/core';
import { emptyState, validateState, type AppState } from '@nourish/core';
import type { NourishRepository } from '@nourish/database';

type Setter<K extends keyof AppState> = (
  update: AppState[K] | ((previous: AppState[K]) => AppState[K]),
) => void;
type DataContext = AppState & {
  setEntries: Setter<'entries'>;
  setProfile: Setter<'profile'>;
  setWeights: Setter<'weights'>;
  setCustom: Setter<'custom'>;
  setTemplates: Setter<'templates'>;
  setActivities: Setter<'activities'>;
  repositoryKind: string;
  status: 'loading' | 'saved' | 'saving' | 'error';
  error: string;
  importBackup: (state: AppState) => void;
  retry: () => void;
  signOut?: () => Promise<void>;
  refreshFoods?: () => Promise<void>;
  askAssistant?: (request: AssistantRequest) => Promise<unknown>;
  applyAssistant: (proposal: AssistantProposal, baseline: string) => Promise<void>;
};
const Context = createContext<DataContext | null>(null);
export function DataProvider({
  repository,
  children,
  onSignOut,
  onAskAssistant,
}: {
  repository: NourishRepository;
  onSignOut?: () => Promise<void>;
  onAskAssistant?: (request: AssistantRequest) => Promise<unknown>;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AppState>(emptyState),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState<DataContext['status']>('loading'),
    [error, setError] = useState('');
  const current = useRef(state),
    revision = useRef(0),
    lastSaved = useRef(''),
    queue = useRef(Promise.resolve()),
    mounted = useRef(true),
    assistantSaving = useRef(false);
  useEffect(() => {
    mounted.current = true;
    repository
      .load()
      .then((snapshot) => {
        if (!mounted.current) return;
        current.current = snapshot.state;
        revision.current = snapshot.revision;
        lastSaved.current = JSON.stringify(snapshot.state);
        setState(snapshot.state);
        setReady(true);
        setStatus('saved');
      })
      .catch(() => {
        if (mounted.current) {
          setError('Could not read your saved data. Nothing has been overwritten.');
          setStatus('error');
        }
      });
    return () => {
      mounted.current = false;
    };
  }, [repository]);
  const persist = useCallback(() => {
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        if (!mounted.current) return;
        const value = current.current,
          text = JSON.stringify(value);
        if (text === lastSaved.current) return;
        setStatus('saving');
        try {
          revision.current = await repository.save(value, revision.current);
          lastSaved.current = text;
          if (mounted.current) {
            setStatus('saved');
            setError('');
          }
        } catch (e) {
          if (mounted.current) {
            setStatus('error');
            setError(e instanceof Error ? e.message : 'Could not save your changes.');
          }
        }
      });
  }, [repository]);
  useEffect(() => {
    if (ready) persist();
  }, [state, ready, persist]);
  function update<K extends keyof AppState>(
    key: K,
    value: AppState[K] | ((previous: AppState[K]) => AppState[K]),
  ) {
    if (assistantSaving.current) {
      setError('Please wait for your assistant changes to finish saving.');
      return;
    }
    try {
      const next =
        typeof value === 'function'
          ? (value as (p: AppState[K]) => AppState[K])(current.current[key])
          : value;
      const valid = validateState({ ...current.current, [key]: next });
      current.current = valid;
      setState(valid);
      setError('');
    } catch {
      setError('Please check the values you entered. Your saved data has not changed.');
      setStatus('error');
    }
  }
  const value = {
    ...state,
    setEntries: (v: Parameters<Setter<'entries'>>[0]) => update('entries', v),
    setProfile: (v: Parameters<Setter<'profile'>>[0]) => update('profile', v),
    setWeights: (v: Parameters<Setter<'weights'>>[0]) => update('weights', v),
    setCustom: (v: Parameters<Setter<'custom'>>[0]) => update('custom', v),
    setTemplates: (v: Parameters<Setter<'templates'>>[0]) => update('templates', v),
    setActivities: (v: Parameters<Setter<'activities'>>[0]) => update('activities', v),
    signOut: onSignOut,
    askAssistant: onAskAssistant,
    applyAssistant: async (proposal: AssistantProposal, baseline: string) => {
      if (assistantSaving.current) throw new Error('Your changes are already being saved.');
      assistantSaving.current = true;
      try {
        await persist();
        await queue.current;
        if (JSON.stringify(current.current) !== lastSaved.current)
          throw new Error('Save your pending changes first.');
        if (JSON.stringify(current.current) !== baseline)
          throw new Error(
            'Your diary or goals changed. Please ask again to review an up-to-date suggestion.',
          );
        const next = applyAssistantProposal(current.current, proposal);
        setStatus('saving');
        const nextRevision = await repository.save(next, revision.current);
        if (!mounted.current) return;
        revision.current = nextRevision;
        current.current = next;
        lastSaved.current = JSON.stringify(next);
        setState(next);
        setError('');
        setStatus('saved');
      } catch (e) {
        if (mounted.current) setStatus('error');
        throw e;
      } finally {
        assistantSaving.current = false;
      }
    },
    refreshFoods: repository.refreshFoods
      ? async () => {
          if (assistantSaving.current)
            throw new Error('Please wait for your assistant changes to finish saving.');
          await persist();
          await queue.current;
          if (JSON.stringify(current.current) !== lastSaved.current)
            throw new Error('Save your pending changes before refreshing foods.');
          const before = JSON.stringify(current.current);
          const snapshot = await repository.refreshFoods!();
          if (!mounted.current) return;
          if (JSON.stringify(current.current) !== before)
            throw new Error('Your data changed while refreshing. Please try again.');
          repository.acceptSnapshot?.(snapshot);
          current.current = snapshot.state;
          revision.current = snapshot.revision;
          lastSaved.current = JSON.stringify(snapshot.state);
          setState(snapshot.state);
          setError('');
          setStatus('saved');
        }
      : undefined,
    repositoryKind: repository.kind,
    status,
    error,
    retry: persist,
    importBackup: (next: AppState) => {
      if (assistantSaving.current) return;
      const valid = validateState(next);
      current.current = valid;
      setState(valid);
    },
  };
  if (!ready)
    return (
      <main className="app">
        <div className="brand">
          <span>♥</span>nourish
        </div>
        {error ? <p role="alert">{error}</p> : <HeartLoader label="Opening your diary…" />}
        {error && <p>Export your browser data before attempting recovery. Refresh to retry.</p>}
      </main>
    );
  return (
    <Context.Provider value={value}>
      {error && (
        <div role="alert" className="sync-warning">
          {error} <button onClick={persist}>Retry save</button>
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export function useNourishData() {
  const value = useContext(Context);
  if (!value) throw new Error('DataProvider is required');
  return value;
}
