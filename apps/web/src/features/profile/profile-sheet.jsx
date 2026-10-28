'use client';

import { Button } from '@nourish/ui';
import { DEFAULT_MEAL_CALORIES, ProfileSchema, validMealCalorieShares } from '@nourish/core';
import { SignOutButton } from './sign-out-button';
import { field, select, formData } from '@/components/form-fields';
export function ProfileForm({ notify, setProfile, profile }) {
  return (
    <form
      className="profile-form"
      onSubmit={(e) => {
        const d = formData(e);
        const mealCalories = Object.fromEntries(
          ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => [
            meal,
            Number(d['meal' + meal]),
          ]),
        );
        if (![d.age, d.height, d.weight].every((value) => Number.isFinite(+value) && +value > 0))
          return notify('Please enter your age, height and weight');
        if (+d.cal < 1 || +d.p < 1 || +d.c < 1 || +d.f < 1)
          return notify('Goals must be greater than zero');
        if (!validMealCalorieShares(mealCalories))
          return notify('Meal calorie shares must add up to 100%');
        const result = ProfileSchema.safeParse({ ...profile, ...d, mealCalories });
        if (!result.success) return notify('Please check your profile details and goals');
        setProfile(result.data);

        notify('Your goals are saved');
      }}
    >
      {!profile.cal && (
        <p className="profile-setup-copy">
          Complete your profile to set your personal goals. All fields start empty.
        </p>
      )}
      {field('Your name', 'name', profile.name, 'text')}
      <div className="grid2">
        {field('Age', 'age', profile.age)}
        {field('Height (cm)', 'height', profile.height)}
      </div>
      {field('Weight (kg)', 'weight', profile.weight)}
      {select('Your goal', 'goal', ['Lose weight', 'Maintain weight', 'Gain weight'], profile.goal)}
      {select(
        'Activity level',
        'activity',
        ['Not very active', 'Lightly active', 'Active', 'Very active'],
        profile.activity,
      )}
      <p>Set your own daily nutrition goals.</p>
      {field('Daily energy (kcal)', 'cal', profile.cal)}
      <div className="grid2">
        {field('Protein (g)', 'p', profile.p)}
        {field('Carbs (g)', 'c', profile.c)}
      </div>
      {field('Fat (g)', 'f', profile.f)}
      <p>Choose roughly how to split your daily calories between meals. Total: 100%.</p>
      <div className="grid2 meal-calorie-fields">
        {Object.entries(DEFAULT_MEAL_CALORIES).map(([meal, defaultShare]) =>
          field(
            `${meal} (%)`,
            'meal' + meal,
            profile.mealCalories?.[meal] ?? defaultShare,
            'number',
            { min: 0, max: 100, step: 1 },
          ),
        )}
      </div>
      <Button className="primary" variant="unstyled">
        Save profile & goals
      </Button>
      <div className="profile-account-row">
        <span>Your account</span>
        <SignOutButton />
      </div>
    </form>
  );
}
