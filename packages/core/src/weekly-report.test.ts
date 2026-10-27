import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWeeklyReport, balanceStatus } from './weekly-report';

test('report uses completed Monday–Sunday week across year boundaries', () => {
  const report = buildWeeklyReport({}, {}, [], new Date(2027, 0, 4, 10));
  assert.equal(report.days[0].date, '2026-12-28');
  assert.equal(report.days[6].date, '2027-01-03');
  assert.equal(report.ready, false);
});
test('report excludes missing days and compares historical goals only', () => {
  const report = buildWeeklyReport(
    {
      '2026-10-20': [{ cal: 100, qty: 2, goalAtLog: { cal: 300, p: 1, c: 1, f: 1 } }],
      '2026-10-21': [{ cal: 400, qty: 1 }],
      '2026-10-27': [{ cal: 999, qty: 1 }],
    },
    {},
    [],
    new Date(2026, 9, 27),
  );
  assert.equal(report.loggedDays, 2);
  assert.equal(report.average, 300);
  assert.equal(report.comparedDays, 1);
  assert.equal(report.averageDifference, -100);
  assert.equal(report.ready, true);
});
test('activity alone makes a weekly report available', () => {
  const report = buildWeeklyReport(
    {},
    { '2026-10-20': [{ minutes: 30, cal: 200, type: 'bike' }] },
    [],
    new Date(2026, 9, 27),
  );
  assert.equal(report.ready, true);
  assert.equal(report.average, null);
  assert.equal(report.minutes, 30);
  assert.equal(report.sessions, 1);
});
test('balance applies evening reminder only to today, and handles boundaries', () => {
  const now = new Date(2026, 9, 27, 20);
  assert.equal(balanceStatus(1000, 2000, '2026-10-27', now), 'low');
  assert.equal(balanceStatus(1600, 2000, '2026-10-27', now), 'neutral');
  assert.equal(balanceStatus(1000, 2000, '2026-10-26', now), 'neutral');
  assert.equal(balanceStatus(1000, 2000, '2026-10-27', new Date(2026, 9, 27, 19, 59)), 'neutral');
  assert.equal(balanceStatus(2001, 2000, '2026-10-27', now), 'over');
  assert.equal(balanceStatus(2000, 2000, '2026-10-27', now), 'reached');
  assert.equal(balanceStatus(0, null, '2026-10-27', now), 'neutral');
});
