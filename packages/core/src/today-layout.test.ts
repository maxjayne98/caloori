import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyState,
  moveTodaySection,
  normalizeTodayLayout,
  toggleTodaySection,
  validateState,
} from './index';

const ids = (layout: { id: string }[]) => layout.map((s) => s.id);

test('missing or old layouts fall back to the default, keeping saved choices', () => {
  assert.deepEqual(ids(normalizeTodayLayout(undefined)), [
    'greeting',
    'days',
    'summary',
    'meals',
    'activity',
  ]);
  const saved = normalizeTodayLayout([
    { id: 'meals' },
    { id: 'summary', hidden: true },
    { id: 'unknown' },
    { id: 'meals' },
  ]);
  // Layouts saved before the greeting became a section get it back in first place.
  assert.deepEqual(ids(saved), ['greeting', 'days', 'meals', 'summary', 'activity']);
  assert.equal(saved.find((s) => s.id === 'summary')?.hidden, true);
});

test('moving and hiding sections', () => {
  const layout = normalizeTodayLayout([]);
  assert.deepEqual(ids(moveTodaySection(layout, 'meals', -1)), [
    'greeting',
    'days',
    'meals',
    'summary',
    'activity',
  ]);
  assert.deepEqual(ids(moveTodaySection(layout, 'greeting', -1)), ids(layout));
  assert.deepEqual(ids(moveTodaySection(layout, 'activity', 1)), ids(layout));
  assert.equal(toggleTodaySection(layout, 'activity').at(-1)?.hidden, true);
});

test('layout is stored on the profile and validated', () => {
  const state = emptyState();
  const todayLayout = [{ id: 'meals' }, { id: 'summary', hidden: true }];
  assert.deepEqual(
    validateState({ ...state, profile: { ...state.profile, todayLayout } }).profile.todayLayout,
    todayLayout,
  );
  assert.equal(validateState(state).profile.todayLayout, undefined);
});
