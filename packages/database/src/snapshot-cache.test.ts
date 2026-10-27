import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState } from '@nourish/core';
import { SnapshotCache, SupabaseRepository, RevisionConflict, type SupabaseClient } from './index';
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}
test('snapshots are isolated per account, copied, expire after one minute and clear on logout', () => {
  let now = 1000;
  const store = storage();
  const a = new SnapshotCache(store, 'a', () => now);
  const b = new SnapshotCache(store, 'b', () => now);
  a.write({ state: emptyState(), revision: 2 });
  assert.equal(b.read(), null);
  const copy = a.read()!;
  copy.state.profile.name = 'Changed';
  assert.equal(a.read()!.state.profile.name, '');
  now += 60_000;
  assert.equal(a.read(), null);
  a.write({ state: emptyState(), revision: 3 });
  a.clear();
  assert.equal(a.read(), null);
});
test('disabled storage fails open to the repository, never to another account', () => {
  const store = {
    getItem() {
      throw Error('disabled');
    },
    setItem() {
      throw Error('full');
    },
    removeItem() {
      throw Error('disabled');
    },
  };
  const cache = new SnapshotCache(store, 'a');
  cache.write({ state: emptyState(), revision: 0 });
  assert.equal(cache.read(), null);
  cache.clear();
});
test('cached reloads skip document reads but still verify the authenticated user', async () => {
  let reads = 0,
    checks = 0,
    now = 1,
    owner = 'a';
  const cache = new SnapshotCache(storage(), 'a', () => now);
  const client = {
    auth: {
      getUser: async () => {
        checks++;
        return { data: { user: { id: owner } }, error: null };
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            reads++;
            return { data: { data: emptyState(), revision: 1 }, error: null };
          },
        }),
      }),
    }),
  } as unknown as SupabaseClient;
  const repository = new SupabaseRepository(client, 'a', cache);
  await repository.load();
  await repository.load();
  assert.equal(reads, 1);
  assert.equal(checks, 2);
  now += 60_000;
  await repository.load();
  assert.equal(reads, 2);
  owner = 'b';
  await assert.rejects(repository.load(), /sign in again/);
  assert.equal(cache.read(), null);
});
test('confirmed saves refresh the cache, revision conflicts invalidate it', async () => {
  const cache = new SnapshotCache(storage(), 'a');
  let conflict = false;
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'a' } }, error: null }) },
    rpc: async () =>
      conflict ? { data: null, error: { code: '40001' } } : { data: 2, error: null },
  } as unknown as SupabaseClient;
  const repository = new SupabaseRepository(client, 'a', cache);
  const state = emptyState();
  state.profile.name = 'Saved';
  await repository.save(state, 1);
  assert.equal(cache.read()!.state.profile.name, 'Saved');
  conflict = true;
  await assert.rejects(repository.save(state, 1), RevisionConflict);
  assert.equal(cache.read(), null);
});

test('a completed request cannot recreate a snapshot after sign-out disposal', () => {
  const cache = new SnapshotCache(storage(), 'a');
  cache.write({ state: emptyState(), revision: 1 });
  cache.dispose();
  cache.write({ state: emptyState(), revision: 2 });
  assert.equal(cache.read(), null);
});
