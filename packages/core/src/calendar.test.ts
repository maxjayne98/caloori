import test from 'node:test';
import assert from 'node:assert/strict';
import { getLoggingStreak, hasFoodLog, monthCells, shiftDay, shiftMonth } from './index';
const food = { id: 'test-food', name: 'Yogurt', serving: '100 g', cal: 100, p: 17, c: 6, f: 0, qty: 1 };

test('streak counts consecutive food days, not individual foods', () => {
  assert.equal(
    getLoggingStreak(
      { '2026-10-26': [food, food], '2026-10-25': [food], '2026-10-24': [food] },
      '2026-10-26',
    ),
    3,
  );
});
test('yesterday remains active before today is logged, gaps reset the streak', () => {
  assert.equal(getLoggingStreak({ '2026-10-25': [food], '2026-10-24': [food] }, '2026-10-26'), 2);
  assert.equal(getLoggingStreak({ '2026-10-24': [food] }, '2026-10-26'), 0);
  assert.equal(getLoggingStreak({ '2026-10-26': [food], '2026-10-24': [food] }, '2026-10-26'), 1);
});
test('future entries and zero-quantity rows never inflate a streak', () => {
  assert.equal(getLoggingStreak({ '2026-10-27': [food] }, '2026-10-26'), 0);
  assert.equal(getLoggingStreak({ '2026-10-26': [{ ...food, qty: 0 }] }, '2026-10-26'), 0);
  assert.equal(hasFoodLog({}, '2026-10-26'), false);
});
test('calendar grids align Monday-first and handle leap years', () => {
  const october = monthCells('2026-10');
  assert.equal(october[3], '2026-10-01');
  assert.equal(october.filter(Boolean).length, 31);
  assert.equal(october.length % 7, 0);
  assert.equal(monthCells('2024-02').filter(Boolean).length, 29);
  assert.equal(monthCells('2025-02').filter(Boolean).length, 28);
});
test('month and day navigation crosses year and daylight-saving boundaries', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftDay('2026-03-29', -1), '2026-03-28');
  assert.equal(shiftDay('2026-10-25', 1), '2026-10-26');
});
