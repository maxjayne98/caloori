import test from 'node:test';
import assert from 'node:assert/strict';
import { ActivitySchema, emptyState, validateState } from './models';
import { activityTypes, estimateActivity } from './activities';
import { buildProgressDays } from './progress';

test('running can be saved in the document and contributes to activity history', () => {
  const running = activityTypes.find((item) => item.id === 'running')!;
  const met = running.levels[1][1] as number;
  const activity = ActivitySchema.parse({
    key: 'run-test',
    type: 'running',
    name: 'Running',
    level: 'Moderate',
    minutes: 30,
    weight: 70,
    met,
    cal: estimateActivity(met, 70, 30),
  });
  assert.equal(activity.cal, 312);
  const state = emptyState();
  state.activities['2026-10-27'] = [activity];
  assert.equal(validateState(state).activities['2026-10-27'][0].type, 'running');
  const days = buildProgressDays({}, state.activities, '2026-10-27', 1, 'running');
  assert.equal(days[0].sessions, 1);
  assert.equal(days[0].minutes, 30);
  assert.equal(days[0].burned, 312);
});
