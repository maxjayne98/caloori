import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState } from '@nourish/core';
import { FoodCache, SupabaseRepository, RevisionConflict, type SupabaseClient } from './index';
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
const food = { id: 'test-food', name: 'Test food', serving: '100 g', cal: 100, p: 10, c: 10, f: 2 };
test('personal foods persist across instances, are copied and isolated by account', () => {
  const store = storage();
  const cache = new FoodCache(store, 'a');
  cache.write([]);
  assert.deepEqual(new FoodCache(store, 'a').read(), []);
  assert.equal(new FoodCache(store, 'b').read(), null);
  cache.write([food]);
  const copy = new FoodCache(store, 'a').read()!;
  copy[0].name = 'Changed';
  assert.equal(cache.read()![0].name, 'Test food');
});
test('corrupt or unavailable storage falls back to a fetch', () => {
  assert.equal(new FoodCache({ getItem: () => '{', setItem() {} }, 'a').read(), null);
  const cache = new FoodCache(
    {
      getItem() {
        throw Error('disabled');
      },
      setItem() {
        throw Error('quota');
      },
    },
    'a',
  );
  assert.doesNotThrow(() => cache.write([food]));
  assert.equal(cache.read(), null);
});
function setup() {
  const cache = new FoodCache(storage(), 'a');
  let cloud = emptyState();
  cloud.custom = [food];
  const queries: string[] = [];
  const writes: Array<{ name: string; params: Record<string, unknown> }> = [];
  let fail = false;
  const query = (projection: string) => {
    queries.push(projection);
    const builder = {
      eq: () => builder,
      returns: () => builder,
      maybeSingle: async () => ({
        data:
          projection === 'data, revision'
            ? { data: structuredClone(cloud), revision: 1 }
            : { ...structuredClone(cloud), revision: 1 },
        error: null,
      }),
    };
    return builder;
  };
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'a' } }, error: null }) },
    from: () => ({ select: query }),
    rpc: async (name: string, params: Record<string, unknown>) => {
      writes.push({ name, params });
      return fail ? { data: null, error: { code: '40001' } } : { data: 2, error: null };
    },
  } as unknown as SupabaseClient;
  return {
    cache,
    queries,
    writes,
    repository: new SupabaseRepository(client, 'a', undefined, cache),
    setCloud: (state: typeof cloud) => {
      cloud = state;
    },
    conflict: () => {
      fail = true;
    },
  };
}
test('first fetch seeds the cache; ordinary loads exclude the personal library', async () => {
  const x = setup();
  await x.repository.load();
  const changed = emptyState();
  changed.custom = [{ ...food, id: 'remote-food' }];
  x.setCloud(changed);
  const loaded = await x.repository.load();
  assert.equal(x.queries[0], 'data, revision');
  assert.ok(!x.queries[1].includes('custom'));
  assert.equal(loaded.state.custom[0].id, 'test-food');
});
test('manual refresh accepts remote foods only after the caller accepts the snapshot', async () => {
  const x = setup();
  await x.repository.load();
  const changed = emptyState();
  changed.custom = [{ ...food, id: 'remote-food' }];
  x.setCloud(changed);
  const refreshed = await x.repository.refreshFoods();
  assert.equal(x.queries.at(-1), 'data, revision');
  assert.equal(x.cache.read()![0].id, 'test-food');
  x.repository.acceptSnapshot(refreshed);
  assert.equal(x.cache.read()![0].id, 'remote-food');
  assert.equal(x.writes.length, 0);
});
test('unrelated saves omit foods; food edits carry a baseline and conflicts do not overwrite cache', async () => {
  const x = setup();
  const loaded = await x.repository.load();
  loaded.state.profile.name = 'Updated';
  await x.repository.save(loaded.state, 1);
  assert.equal(x.writes[0].name, 'save_nourish_cached_document');
  assert.equal(x.writes[0].params.p_save_custom, false);
  assert.deepEqual((x.writes[0].params.p_data as typeof loaded.state).custom, []);
  loaded.state.custom.push({ ...food, id: 'new-food' });
  x.conflict();
  await assert.rejects(x.repository.save(loaded.state, 2), RevisionConflict);
  assert.equal(x.writes[1].params.p_save_custom, true);
  assert.equal((x.writes[1].params.p_expected_custom as unknown[]).length, 1);
  assert.equal(x.cache.read()!.length, 1);
});

test('confirmed personal-food edits immediately update the persistent cache', async () => {
  const x = setup();
  const loaded = await x.repository.load();
  loaded.state.custom.push({ ...food, id: 'new-food' });
  await x.repository.save(loaded.state, 1);
  assert.equal(x.cache.read()!.length, 2);
  assert.equal(x.writes[0].params.p_save_custom, true);
});
