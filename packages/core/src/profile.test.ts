import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, validateState, appendDiaryEntries, savedDayGoal } from './index';

test('new accounts contain no invented personal details or goals', () => {
  const state = validateState(emptyState());
  for (const key of ['age', 'height', 'weight', 'cal', 'p', 'c', 'f', 'goal', 'activity'])
    assert.equal(state.profile[key], null);
  assert.equal(state.profile.name, '');
  const logs = appendDiaryEntries(
    {},
    '2026-10-26',
    [{ id: 'food', name: 'Food', serving: '100 g', cal: 100, p: 1, c: 1, f: 1, qty: 1 }],
    state.profile,
  );
  assert.equal(savedDayGoal(logs['2026-10-26']), null);
  assert.equal(logs['2026-10-26'][0].goalAtLog, undefined);
});
test('only the untouched old nameless preset is cleared, entered values survive', () => {
  const old = {
    name: '',
    cal: 2000,
    p: 120,
    c: 250,
    f: 65,
    height: 175,
    age: 30,
    weight: 72,
    goal: 'Maintain weight',
    activity: 'Lightly active',
  };
  assert.deepEqual(validateState({ ...emptyState(), profile: old }).profile, emptyState().profile);
  const real = { ...old, name: 'Alex', age: 40 };
  assert.deepEqual(validateState({ ...emptyState(), profile: real }).profile, real);
  assert.throws(() => validateState({ ...emptyState(), profile: { ...real, weight: -1 } }));
});
test('profile photo accepts small image data URLs and rejects anything else', () => {
  const base = emptyState();
  const photo = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
  assert.equal(
    validateState({ ...base, profile: { ...base.profile, photo } }).profile.photo,
    photo,
  );
  assert.equal(validateState(base).profile.photo, undefined);
  for (const bad of [
    'https://example.com/a.jpg',
    'data:image/svg+xml;base64,PHN2Zz4=',
    'data:text/html,<b>',
  ])
    assert.throws(() => validateState({ ...base, profile: { ...base.profile, photo: bad } }));
});
test('profile avatar choice accepts initial, photo and pattern variants only', () => {
  const base = emptyState();
  for (const avatar of ['initial', 'photo', 'pattern:0', 'pattern:7', 'pixel:12'])
    assert.equal(
      validateState({ ...base, profile: { ...base.profile, avatar } }).profile.avatar,
      avatar,
    );
  for (const bad of ['pattern:', 'pattern:123', 'emoji'])
    assert.throws(() => validateState({ ...base, profile: { ...base.profile, avatar: bad } }));
});

test('validation repairs duplicate and missing keys in logged, activity and saved-meal items', () => {
  const base = emptyState();
  const food = {
    id: 'food',
    name: 'Food',
    serving: '1 serving',
    cal: 10,
    p: 1,
    c: 1,
    f: 1,
  };
  const state = validateState({
    ...base,
    entries: {
      '2026-10-28': [{ ...food, key: 1 }, { ...food, key: '1' }, food],
    },
    activities: {
      '2026-10-28': [
        {
          key: 1,
          type: 'running',
          name: 'Run',
          level: 'Moderate',
          minutes: 30,
          weight: 70,
          met: 8,
          cal: 200,
        },
        {
          key: 1,
          type: 'running',
          name: 'Run',
          level: 'Moderate',
          minutes: 30,
          weight: 70,
          met: 8,
          cal: 200,
        },
      ],
    },
    templates: [
      {
        id: 'meal',
        name: 'Saved meal',
        items: [
          { ...food, key: 1 },
          { ...food, key: 1 },
        ],
      },
    ],
  });

  const keysByList = [
    state.entries['2026-10-28'].map((item) => String(item.key)),
    state.activities['2026-10-28'].map((item) => String(item.key)),
    state.templates[0].items.map((item) => String(item.key)),
  ];
  for (const keys of keysByList) assert.equal(new Set(keys).size, keys.length);
  assert.equal(state.entries['2026-10-28'][0].key, 1);
  assert.equal(state.entries['2026-10-28'][1].key, 'entry-2026-10-28-1');
  assert.equal(state.entries['2026-10-28'][2].key, 'entry-2026-10-28-2');
});
