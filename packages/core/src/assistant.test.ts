import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyState,
  applyAssistantProposal,
  assistantContext,
  parseAssistantProposal,
} from './index';
const bean = {
  name: 'Red kidney beans, cooked',
  serving: '100 g',
  gramsPerServing: 100,
  cal: 127,
  p: 8.7,
  c: 22.8,
  f: 0.5,
  estimated: true,
};
test('assistant creates a reusable food without logging it or changing the source state', () => {
  const state = emptyState();
  const result = applyAssistantProposal(state, {
    reply: 'Review this food.',
    actions: [{ type: 'create_food', food: bean }],
  });
  assert.equal(result.custom.length, 1);
  assert.deepEqual(result.entries, {});
  assert.equal(state.custom.length, 0);
  assert.equal(result.custom[0].nutritionEstimated, true);
  assert.ok(result.custom[0].id.startsWith('ai-'));
});
test('assistant rejects duplicates, missing foods, unsupported actions and invalid nutrition', () => {
  const state = emptyState();
  assert.throws(
    () =>
      applyAssistantProposal(state, {
        reply: 'x',
        actions: [{ type: 'create_food', food: { ...bean, name: 'Banana' } }],
      }),
    /already/,
  );
  assert.throws(
    () =>
      applyAssistantProposal(state, {
        reply: 'x',
        actions: [
          { type: 'log_food', foodId: 'missing', quantity: 1, meal: 'Lunch', date: '2026-10-27' },
        ],
      }),
    /available/,
  );
  assert.throws(() =>
    parseAssistantProposal({ reply: 'x', actions: [{ type: 'delete_account' }] }),
  );
  assert.throws(() =>
    applyAssistantProposal(state, {
      reply: 'x',
      actions: [{ type: 'create_food', food: { ...bean, cal: -1 } }],
    }),
  );
});
test('confirmed logging uses serving quantities and captures the goal at that time', () => {
  const state = emptyState();
  state.profile.cal = 2100;
  state.profile.p = 120;
  state.profile.c = 250;
  state.profile.f = 70;
  const library = assistantContext(state, [], '2026-10-27').library;
  const egg = library.find((x) => x.name === 'Egg')!;
  const next = applyAssistantProposal(state, {
    reply: 'Review eggs.',
    actions: [
      { type: 'log_food', foodId: egg.id, quantity: 3, meal: 'Breakfast', date: '2026-10-27' },
    ],
  });
  const entry = next.entries['2026-10-27'][0];
  assert.equal(entry.qty, 3);
  assert.equal(entry.cal * entry.qty!, 216);
  assert.equal(entry.goalAtLog?.cal, 2100);
  assert.throws(() =>
    parseAssistantProposal({
      reply: 'x',
      actions: [
        { type: 'log_food', foodId: egg.id, quantity: 1, meal: 'Lunch', date: '2026-02-30' },
      ],
    }),
  );
});
test('goal proposals cannot change profile identity or historical goals', () => {
  const state = emptyState();
  state.profile.name = 'Alex';
  const next = applyAssistantProposal(state, {
    reply: 'Review goals.',
    actions: [
      {
        type: 'update_goals',
        goals: { cal: 2200, p: 140, c: 260, f: 70, goal: 'Maintain weight' },
      },
    ],
  });
  assert.equal(next.profile.cal, 2200);
  assert.equal(next.profile.name, 'Alex');
  assert.equal(state.profile.cal, null);
  assert.throws(() =>
    parseAssistantProposal({
      reply: 'x',
      actions: [
        { type: 'update_goals', goals: { cal: 0, p: 140, c: 260, f: 70, goal: 'Maintain weight' } },
      ],
    }),
  );
});
test('only selected goals and food data are included, not identity or diary history', () => {
  const state = emptyState();
  state.profile.name = 'Private';
  state.profile.age = 35;
  state.profile.weight = 80;
  const request = assistantContext(state, [{ role: 'user', text: 'Hello' }], '2026-10-27');
  assert.equal('name' in request.goals, false);
  assert.equal('age' in request.goals, false);
  assert.equal('weight' in request.goals, false);
  assert.equal('entries' in request, false);
  assert.ok(!JSON.stringify(request).includes('Private'));
});
test('flat Gemini action envelopes normalize safely to domain actions', () => {
  const result = parseAssistantProposal({
    reply: 'Review this food.',
    actions: [
      {
        type: 'create_food',
        food: bean,
        foodId: null,
        quantity: null,
        meal: null,
        date: null,
        goals: null,
      },
    ],
  });
  assert.equal(result.actions[0].type, 'create_food');
  assert.equal('foodId' in result.actions[0], false);
});
