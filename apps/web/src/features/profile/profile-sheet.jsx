'use client';

import { Button } from '@nourish/ui';
import { DEFAULT_MEAL_CALORIES, ProfileSchema, validMealCalorieShares } from '@nourish/core';
import { SignOutButton } from './sign-out-button';
import { field, select, formData } from '@/components/form-fields';
import { useI18n } from '@/providers/i18n-provider';
export function ProfileForm({ notify, setProfile, profile }) {
  const { t, tMeal } = useI18n();
  const goalOptions = [
    { value: 'Lose weight', label: t('profile.goalLose') },
    { value: 'Maintain weight', label: t('profile.goalMaintain') },
    { value: 'Gain weight', label: t('profile.goalGain') },
  ];
  const activityOptions = [
    { value: 'Not very active', label: t('profile.actNotVery') },
    { value: 'Lightly active', label: t('profile.actLightly') },
    { value: 'Active', label: t('profile.actActive') },
    { value: 'Very active', label: t('profile.actVery') },
  ];
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
          return notify(t('toast.fillProfileFields'));
        if (+d.cal < 1 || +d.p < 1 || +d.c < 1 || +d.f < 1)
          return notify(t('toast.goalsPositive'));
        if (!validMealCalorieShares(mealCalories))
          return notify(t('toast.mealCalories100'));
        const result = ProfileSchema.safeParse({ ...profile, ...d, mealCalories });
        if (!result.success) return notify(t('toast.checkProfileDetails'));
        setProfile(result.data);

        notify(t('toast.goalsSaved'));
      }}
    >
      {!profile.cal && (
        <p className="profile-setup-copy">
          {t('profile.setupCopy')}
        </p>
      )}
      {field(t('profile.yourName'), 'name', profile.name, 'text')}
      <div className="grid2">
        {field(t('profile.age'), 'age', profile.age)}
        {field(t('profile.height'), 'height', profile.height)}
      </div>
      {field(t('profile.weight'), 'weight', profile.weight)}
      {select(t('profile.yourGoal'), 'goal', goalOptions, profile.goal)}
      {select(
        t('profile.activityLevel'),
        'activity',
        activityOptions,
        profile.activity,
      )}
      <p>{t('profile.nutritionGoals')}</p>
      {field(t('profile.dailyEnergy'), 'cal', profile.cal)}
      <div className="grid2">
        {field(t('profile.protein'), 'p', profile.p)}
        {field(t('profile.carbs'), 'c', profile.c)}
      </div>
      {field(t('profile.fat'), 'f', profile.f)}
      <p>{t('profile.mealSplit')}</p>
      <div className="grid2 meal-calorie-fields">
        {Object.entries(DEFAULT_MEAL_CALORIES).map(([meal, defaultShare]) =>
          field(
            `${tMeal(meal)} (%)`,
            'meal' + meal,
            profile.mealCalories?.[meal] ?? defaultShare,
            'number',
            { min: 0, max: 100, step: 1 },
          ),
        )}
      </div>
      <Button className="primary" variant="unstyled">
        {t('profile.saveGoals')}
      </Button>
      <div className="profile-account-row">
        <span>{t('nav.profileAria')}</span>
        <SignOutButton />
      </div>
    </form>
  );
}
