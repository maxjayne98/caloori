import { z } from 'zod';
import {
  FoodSchema,
  ProfileSchema,
  MealNameSchema,
  validateState,
  type AppState,
  type Food,
} from './models';
import { foods as bundledFoods } from './food-data';
const foods: Food[] = bundledFoods.map((food) => FoodSchema.parse(food));
import { appendDiaryEntries, freshKey } from './meals';
const number = z.number().finite().nonnegative().max(20000);
export const AssistantFoodSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    serving: z.string().trim().min(1).max(100),
    gramsPerServing: z.number().finite().positive().max(100000).nullable(),
    cal: number,
    p: number,
    c: number,
    f: number,
    estimated: z.boolean(),
  })
  .strict();
const goals = ProfileSchema.pick({ cal: true, p: true, c: true, f: true, goal: true }).strict();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + 'T12:00:00Z');
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
  });
export const AssistantActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('create_food'), food: AssistantFoodSchema }).strict(),
  z
    .object({
      type: z.literal('log_food'),
      foodId: z.string().min(1).max(200),
      quantity: z.number().finite().positive().max(1000),
      meal: MealNameSchema,
      date,
    })
    .strict(),
  z.object({ type: z.literal('update_goals'), goals }).strict(),
]);
// The provider's flat JSON envelope is normalized before strict domain validation.
export function parseAssistantProposal(value: unknown) {
  const envelope = z
    .object({
      reply: z.string().trim().min(1).max(6000),
      actions: z.array(z.record(z.string(), z.unknown())).max(10),
    })
    .strict()
    .parse(value);
  return {
    reply: envelope.reply,
    actions: envelope.actions.map((a) =>
      AssistantActionSchema.parse(
        a.type === 'create_food'
          ? { type: a.type, food: a.food }
          : a.type === 'log_food'
            ? { type: a.type, foodId: a.foodId, quantity: a.quantity, meal: a.meal, date: a.date }
            : a.type === 'update_goals'
              ? { type: a.type, goals: a.goals }
              : a,
      ),
    ),
  };
}
export type AssistantProposal = ReturnType<typeof parseAssistantProposal>;
export type AssistantMessage = { role: 'user' | 'assistant'; text: string };
export type AssistantRequest = {
  messages: AssistantMessage[];
  day: string;
  goals: Pick<AppState['profile'], 'cal' | 'p' | 'c' | 'f' | 'goal'>;
  library: Array<
    Pick<Food, 'id' | 'name' | 'serving' | 'cal' | 'p' | 'c' | 'f' | 'gramsPerServing'>
  >;
};
export function assistantContext(
  state: AppState,
  messages: AssistantMessage[],
  day: string,
): AssistantRequest {
  date.parse(day);
  const { cal, p, c, f, goal } = state.profile;
  const library = [...state.custom.filter((x) => !x.saved), ...foods]
    .slice(0, 400)
    .map((x) => ({
      id: x.id,
      name: x.name,
      serving: x.serving,
      cal: x.cal,
      p: x.p,
      c: x.c,
      f: x.f,
      gramsPerServing: x.gramsPerServing ?? null,
    }));
  return { messages: messages.slice(-10), day, goals: { cal, p, c, f, goal }, library };
}
export function applyAssistantProposal(state: AppState, value: unknown): AppState {
  const proposal = parseAssistantProposal(value);
  const next = structuredClone(state);
  for (const a of proposal.actions) {
    if (a.type === 'create_food') {
      const normalized = a.food.name.toLocaleLowerCase().trim();
      if ([...foods, ...next.custom].some((f) => f.name.toLocaleLowerCase().trim() === normalized))
        throw Error('This food is already in your library. Ask to log the existing food instead.');
      next.custom.push(
        FoodSchema.parse({
          ...a.food,
          id: 'ai-' + freshKey(),
          source: 'assistant',
          nutritionEstimated: a.food.estimated,
        }),
      );
    } else if (a.type === 'log_food') {
      const food = [...next.custom, ...foods].find((f) => f.id === a.foodId && !f.saved);
      if (!food) throw Error('This food is no longer available. Please ask again.');
      next.entries = appendDiaryEntries(
        next.entries,
        a.date,
        [{ ...food, qty: a.quantity, meal: a.meal }],
        next.profile,
      );
    } else {
      next.profile = ProfileSchema.parse({ ...next.profile, ...a.goals });
    }
  }
  return validateState(next);
}
