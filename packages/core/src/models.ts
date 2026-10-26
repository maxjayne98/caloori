import { z } from 'zod';

const finite = z.coerce.number().finite();
const nonnegative = finite.nonnegative();
const positive = finite.positive();
export const MealNameSchema = z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snacks']);
export const NutrientsSchema = z.object({
  cal: nonnegative,
  p: nonnegative,
  c: nonnegative,
  f: nonnegative,
});
export const ProfileSchema = z
  .object({
    name: z.string().max(100),
    cal: positive.max(20000).nullable(),
    p: positive.max(3000).nullable(),
    c: positive.max(3000).nullable(),
    f: positive.max(3000).nullable(),
    height: positive.max(300).nullable(),
    age: finite.int().min(1).max(130).nullable(),
    weight: positive.max(700).nullable(),
    goal: z.enum(['Lose weight', 'Maintain weight', 'Gain weight']).nullable(),
    activity: z.enum(['Not very active', 'Lightly active', 'Active', 'Very active']).nullable(),
  })
  .passthrough();
export const PortionSchema = z.object({
  unit: z.string().max(100),
  amount: positive.max(1000000),
  text: z.string().max(200),
  mode: z.enum(['decimal', 'fraction']),
  gramOverride: positive.nullable().optional(),
});
export const FoodSchema = NutrientsSchema.extend({
  id: z.string().min(1).max(200),
  name: z.string().min(1).max(500),
  serving: z.string().min(1).max(200),
  gramsPerServing: positive.nullable().optional(),
  qty: nonnegative.max(1000000).optional(),
  meal: MealNameSchema.optional(),
  key: z.union([z.string().max(200), z.number().finite()]).optional(),
  portion: PortionSchema.optional(),
  goalAtLog: NutrientsSchema.optional(),
  loggedAt: z.string().max(100).optional(),
  recipe: z.boolean().optional(),
  saved: z.boolean().optional(),
  brand: z.string().optional(),
  barcode: z.string().optional(),
}).passthrough();
export const WeightSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weight: positive.max(700),
});
export const ActivitySchema = z.object({
  key: z.union([z.string(), z.number()]),
  type: z.enum(['gym', 'bike', 'treadmill', 'elliptical', 'padel']),
  name: z.string().max(100),
  level: z.enum(['Light', 'Moderate', 'Hard']),
  minutes: positive.max(1440),
  weight: positive.max(700),
  met: positive.max(30),
  cal: nonnegative.max(50000),
});
export const MealTemplateSchema = z.object({
  id: z.string().max(200),
  name: z.string().min(1).max(100),
  items: z.array(FoodSchema).min(1).max(200),
});
const dates = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const AppStateSchema = z.object({
  version: z.literal(1),
  profile: ProfileSchema,
  entries: z.record(dates, z.array(FoodSchema).max(500)),
  weights: z.array(WeightSchema).max(10000),
  custom: z.array(FoodSchema).max(10000),
  templates: z.array(MealTemplateSchema).max(2000),
  activities: z.record(dates, z.array(ActivitySchema).max(100)),
});
export type AppState = z.infer<typeof AppStateSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Food = z.infer<typeof FoodSchema>;
export type Nutrients = z.infer<typeof NutrientsSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type MealTemplate = z.infer<typeof MealTemplateSchema>;
export type Diary = AppState['entries'];
export type Activities = AppState['activities'];
export interface FoodUnit {
  id: string;
  label: string;
  factor: number;
  grams: number | null;
  estimated: boolean;
}
export interface PortionDefinition {
  grams: number;
  estimatedBase?: boolean;
  base?: string;
  units: Array<[string, number]>;
}
export interface BarcodeProduct {
  product_name?: string;
  generic_name?: string;
  brands?: string;
  quantity?: string;
  nutriments?: Record<string, number | string | null | undefined>;
}
export const DEFAULT_PROFILE: Profile = {
  name: '',
  cal: null,
  p: null,
  c: null,
  f: null,
  height: null,
  age: null,
  weight: null,
  goal: null,
  activity: null,
};
const LEGACY_PLACEHOLDER = {
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
/** Only the exact untouched, nameless preset is cleared. User-entered profiles are preserved. */
export function normalizeProfile(profile: Profile): Profile {
  return Object.entries(LEGACY_PLACEHOLDER).every(([key, value]) => profile[key] === value)
    ? { ...DEFAULT_PROFILE }
    : profile;
}
export function emptyState(): AppState {
  return {
    version: 1,
    profile: { ...DEFAULT_PROFILE },
    entries: {},
    weights: [],
    custom: [],
    templates: [],
    activities: {},
  };
}
export function validateState(value: unknown): AppState {
  const state = AppStateSchema.parse(value);
  return { ...state, profile: normalizeProfile(state.profile) };
}

/** Import old six-key backups without ever reading/writing the original project's browser storage. */
export function importState(value: unknown): AppState {
  const source = z.record(z.string(), z.unknown()).parse(value);
  const legacy = 'nourish-diary' in source;
  const defaultState = emptyState();
  const templates = (legacy ? source['nourish-meal-templates'] : source.templates) ?? [];
  const migratedTemplates = z
    .array(z.record(z.string(), z.unknown()))
    .parse(templates)
    .map((t) => {
      if (Array.isArray(t.items) && t.items.length) return t;
      const food = FoodSchema.parse(t);
      return {
        id: food.id,
        name: food.name,
        items: [{ ...food, qty: food.qty ?? 1 }],
      };
    });
  return validateState({
    ...defaultState,
    ...(!legacy ? source : {}),
    version: 1,
    profile: (legacy ? source['nourish-profile'] : source.profile) ?? defaultState.profile,
    entries: (legacy ? source['nourish-diary'] : source.entries) ?? {},
    weights: (legacy ? source['nourish-weights'] : source.weights) ?? [],
    custom: (legacy ? source['nourish-foods'] : source.custom) ?? [],
    templates: migratedTemplates,
    activities: (legacy ? source['nourish-activities'] : source.activities) ?? {},
  });
}
