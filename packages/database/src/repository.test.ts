import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState } from '@nourish/core';
import {
  LocalRepository,
  MemoryRepository,
  SupabaseRepository,
  RevisionConflict,
  type SupabaseClient,
} from './index';
function storage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) || null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    map,
  };
}
test('memory repository isolates returned values and rejects stale revisions', async () => {
  const repo = new MemoryRepository();
  let loaded = await repo.load();
  loaded.state.profile.name = 'Not saved';
  assert.equal((await repo.load()).state.profile.name, '');
  const state = emptyState();
  state.profile.name = 'Saved';
  assert.equal(await repo.save(state, 0), 1);
  await assert.rejects(repo.save(state, 0), RevisionConflict);
});
test('local repository never overwrites original storage keys', async () => {
  const store = storage();
  store.setItem('nourish-diary', 'ORIGINAL');
  const repo = new LocalRepository(store);
  await repo.save(emptyState(), 0);
  assert.equal(store.getItem('nourish-diary'), 'ORIGINAL');
  assert.equal((await repo.load()).revision, 1);
  await assert.rejects(repo.save(emptyState(), 0), RevisionConflict);
});
test('corrupted local backups fail without silent replacement', async () => {
  const store = storage();
  store.setItem('nourish-next:state:v1', 'broken');
  const repo = new LocalRepository(store);
  await assert.rejects(repo.load());
  assert.equal(store.getItem('nourish-next:state:v1'), 'broken');
});
test('cloud adapter blocks account mismatch before querying data', async () => {
  let calls = 0;
  const fake = {
    auth: { getUser: async () => ({ data: { user: { id: 'user-b' } }, error: null }) },
    from: () => {
      calls++;
      throw Error('Should not query');
    },
  } as unknown as SupabaseClient;
  const repo = new SupabaseRepository(fake, 'user-a');
  await assert.rejects(repo.load(), /sign in again/);
  assert.equal(calls, 0);
});
test('cloud conflicts are surfaced instead of overwriting newer data', async () => {
  const fake = {
    auth: { getUser: async () => ({ data: { user: { id: 'user-a' } }, error: null }) },
    rpc: async () => ({ error: { code: '40001' }, data: null }),
  } as unknown as SupabaseClient;
  await assert.rejects(
    new SupabaseRepository(fake, 'user-a').save(emptyState(), 1),
    RevisionConflict,
  );
});
