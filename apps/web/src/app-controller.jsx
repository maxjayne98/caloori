'use client';
import { buildWeeklyReport } from '@nourish/core';
import { WeeklyReportPage } from '@/features/progress/weekly-report-page';

import { AddFoodSheet } from '@/features/foods/add-sheet';
import { ProfilePage } from '@/features/profile/profile-page';
import { AssistantPage } from '@/features/assistant/assistant-page';
import { Sparkles, Settings } from 'lucide-react';
import { LogWeightSheet } from '@/features/progress/weight-sheet';
import { MealDetailSheet } from '@/features/diary/diary-sheet';
import { CopyDaySheet } from '@/features/diary/copy-sheet';
import { ModalSheet } from '@/components/modal-sheet';
import { SettingsPanel } from '@/features/settings/settings-panel';
import { useState, useEffect } from 'react';
import { Button, Input } from '@nourish/ui';
import {
  foods,
  today,
  freshKey,
  reusableItems,
  appendDiaryEntries,
  rememberScannedFood,
} from '@nourish/core';
import { Icon } from '@/components/icon';
import { ProfileAvatar } from '@/components/profile-photo';
import { BottomNavigation } from '@/components/bottom-navigation';
import { LoggingStreak } from '@/features/diary/logging-streak';
import { FoodPortionEditor } from '@/features/foods/portion-editor';
import { Recipe } from '@/features/recipes/recipe-editor';
import { MealLibrary } from '@/features/meals/meal-library';
import { MealBuilder } from '@/features/meals/meal-builder';
import { UseMealTemplate } from '@/features/meals/use-meal';
import { ActivityEditor } from '@/features/activities/activity-editor';
import { BarcodeScanner } from '@/features/foods/barcode-scanner';
import { TodayPage } from '@/features/diary/today-page';
import { FoodPage } from '@/features/foods/food-page';
import { ProgressPage } from '@/features/progress/progress-page';
import { field, formData } from '@/components/form-fields';
import { useNourishData } from '@/providers/data-provider';
export function App() {
  const {
    entries,
    profile,
    weights,
    custom,
    templates,
    activities,
    setEntries,
    setProfile,
    setWeights,
    setCustom,
    setTemplates,
    setActivities,
    accountId,
  } = useNourishData();
  const [tab, setTab] = useState('Today'),
    [day, setDay] = useState(today),
    [sheet, setSheetState] = useState(null),
    [meal, setMeal] = useState('Breakfast'),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All foods'),
    [chosen, setChosen] = useState(null),
    [qty, setQty] = useState(1),
    [toast, setToast] = useState(''),
    [editing, setEditing] = useState(null),
    [template, setTemplate] = useState(null),
    [activity, setActivity] = useState(null);
  function navigate(next) {
    window.location.hash = next.toLowerCase();
    setTab(next);
    setSheetState(null);
    window.scrollTo(0, 0);
  }
  function setSheet(next) {
    if (next === 'profile') navigate('Profile');
    else setSheetState(next);
  }
  useEffect(() => {
    const readPage = () => {
      const pages = {
        today: 'Today',
        food: 'Food',
        progress: 'Progress',
        profile: 'Profile',
        assistant: 'Assistant',
        weekly: 'Weekly',
      };
      setTab(pages[window.location.hash.slice(1)] || 'Today');
      setSheetState(null);
      window.scrollTo(0, 0);
    };
    readPage();
    window.addEventListener('hashchange', readPage);
    return () => window.removeEventListener('hashchange', readPage);
  }, []);
  useEffect(() => {
    if (!toast) return;
    let t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    document.body.style.overflow = sheet ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [sheet]);
  const list = entries[day] || [],
    tot = list.reduce(
      (s, a) => ({
        cal: s.cal + a.cal * a.qty,
        p: s.p + a.p * a.qty,
        c: s.c + a.c * a.qty,
        f: s.f + a.f * a.qty,
      }),
      {
        cal: 0,
        p: 0,
        c: 0,
        f: 0,
      },
    );
  const notify = (t) => setToast(t),
    openAdd = (m = 'Breakfast') => {
      setMeal(m);
      setQuery('');
      setChosen(null);
      setQty(1);
      setSheet('add');
    };
  function add(food, n = qty) {
    setEntries((prev) =>
      appendDiaryEntries(
        prev,
        day,
        [
          {
            ...food,
            qty: n,
            meal,
          },
        ],
        profile,
      ),
    );
    setChosen(null);
    setQty(1);
    notify('Added to ' + meal);
  }
  function editItem(x) {
    setEditing(x);
    setQty(x.qty);
    setMeal(x.meal);
    setSheet('edit');
  }
  function deleteItem(x) {
    setEntries({
      ...entries,
      [day]: list.filter((y) => y.key !== x.key),
    });
    notify(x.name + ' removed');
  }
  function moveItem(key, target) {
    setEntries((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((x) =>
        x.key === key
          ? {
              ...x,
              meal: target,
            }
          : x,
      ),
    }));
    notify('Moved to ' + target);
  }
  function saveTemplate(t) {
    setTemplates((prev) => [...prev.filter((x) => x.id !== t.id), t]);
    setSheet('meals');
    notify('Meal saved');
  }
  function createTemplate(items = [], name = '') {
    setTemplate({
      items: items.map((x) => ({
        ...x,
        key: freshKey(),
      })),
      name,
    });
    setSheet('mealBuilder');
  }
  function useTemplate(t) {
    setTemplate(t);
    setSheet('useMeal');
  }
  const libraryProps = {
    templates,
    onUse: useTemplate,
    onCreate: () => createTemplate(),
    onEdit: (t) => {
      setTemplate({
        ...t,
        items: reusableItems(t),
      });
      setSheet('mealBuilder');
    },
    onDelete: (t) => {
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
      notify('Saved meal deleted');
    },
  };
  const weeklyReport = buildWeeklyReport(entries, activities, weights);
  let body;
  if (tab === 'Weekly')
    body = <WeeklyReportPage report={weeklyReport} onBack={() => navigate('Today')} />;
  if (tab === 'Today')
    body = (
      <TodayPage
        weeklyReport={weeklyReport}
        onWeeklyReport={() => navigate('Weekly')}
        setDay={setDay}
        profile={profile}
        weight={[...weights].reverse().find((x) => x.date <= day)?.weight || profile.weight}
        day={day}
        entries={entries}
        tot={tot}
        setSheet={setSheet}
        list={list}
        openAdd={openAdd}
        editItem={editItem}
        deleteItem={deleteItem}
        moveItem={moveItem}
        createTemplate={createTemplate}
        setMeal={setMeal}
        activities={activities}
        setActivity={setActivity}
      />
    );
  if (tab === 'Food')
    body = (
      <FoodPage
        filter={filter}
        notify={notify}
        setFilter={setFilter}
        libraryProps={libraryProps}
        query={query}
        setQuery={setQuery}
        templates={templates}
        useTemplate={useTemplate}
        createTemplate={createTemplate}
        setSheet={setSheet}
        entries={entries}
        custom={custom}
        setChosen={setChosen}
        setQty={setQty}
      />
    );
  if (tab === 'Progress')
    body = (
      <ProgressPage
        weights={weights}
        profile={profile}
        setSheet={setSheet}
        entries={entries}
        activities={activities}
        weeklyReport={weeklyReport}
        onWeeklyReport={() => navigate('Weekly')}
      />
    );
  if (tab === 'Profile')
    body = <ProfilePage profile={profile} setProfile={setProfile} notify={notify} />;
  if (tab === 'Assistant') body = <AssistantPage day={day} />;
  let content = null;
  if (sheet === 'edit' && editing)
    content = (
      <FoodPortionEditor
        key={'edit' + editing.key}
        food={editing}
        initialMeal={meal}
        onSave={(data) => {
          setEntries({
            ...entries,
            [day]: list.map((x) =>
              x.key === editing.key
                ? {
                    ...x,
                    qty: data.qty,
                    meal: data.meal,
                    portion: data.portion,
                  }
                : x,
            ),
          });
          setSheet(null);
          notify('Food updated');
        }}
        onDelete={() => {
          deleteItem(editing);
          setSheet(null);
        }}
      />
    );
  if (sheet === 'add')
    content = (
      <AddFoodSheet
        chosen={chosen}
        meal={meal}
        setEntries={setEntries}
        day={day}
        profile={profile}
        setChosen={setChosen}
        setSheet={setSheet}
        notify={notify}
        setMeal={setMeal}
        query={query}
        setQuery={setQuery}
        custom={custom}
        setQty={setQty}
      />
    );
  if (['custom', 'quick'].includes(sheet))
    content = (
      <form
        onSubmit={(e) => {
          let d = formData(e),
            f = {
              id: 'u' + Date.now(),
              name: d.name || 'Quick add',
              serving: d.serving || '1 serving',
              gramsPerServing: +d.grams || null,
              cal: +d.cal,
              p: +d.p || 0,
              c: +d.c || 0,
              f: +d.f || 0,
              emoji: '🍽️',
            };
          if (sheet === 'custom') setCustom([...custom, f]);
          else add(f, 1);
          setSheet(null);
          notify(sheet === 'custom' ? 'Food saved to your library' : 'Added to ' + meal);
        }}
      >
        {field('Food name', 'name', query || '', 'text')}
        {sheet === 'custom' && field('Serving size', 'serving', '1 serving', 'text')}
        {sheet === 'custom' && (
          <div>
            <label htmlFor="food-grams">Grams per serving (optional)</label>
            <Input
              id="food-grams"
              name="grams"
              type="number"
              min={0.001}
              step="any"
              inputMode="decimal"
              placeholder="Add a weight to enable grams"
              unstyled
            />
          </div>
        )}
        {field('Calories (kcal)', 'cal', '')}
        <div className="grid2">
          {field('Protein (g)', 'p', 0)}
          {field('Carbs (g)', 'c', 0)}
        </div>
        {field('Fat (g)', 'f', 0)}
        <Button className="primary" variant="unstyled">
          {sheet === 'custom' ? 'Save food' : 'Add to ' + meal}
        </Button>
      </form>
    );
  if (sheet === 'weight')
    content = (
      <LogWeightSheet
        notify={notify}
        setWeights={setWeights}
        weights={weights}
        setSheet={setSheet}
        profile={profile}
      />
    );
  if (sheet === 'diary')
    content = (
      <MealDetailSheet
        list={list}
        meal={meal}
        setEntries={setEntries}
        entries={entries}
        day={day}
        openAdd={openAdd}
        setSheet={setSheet}
      />
    );
  if (sheet === 'copy')
    content = (
      <CopyDaySheet
        entries={entries}
        notify={notify}
        setEntries={setEntries}
        day={day}
        profile={profile}
        setSheet={setSheet}
      />
    );
  if (sheet === 'saveMeal')
    content = (
      <MealBuilder
        initial={{
          name: meal + ' favorite',
          items: list.filter((x) => x.meal === meal),
        }}
        foods={[...foods, ...custom.filter((x) => !x.saved)]}
        onSave={saveTemplate}
        onCancel={() => setSheet('meals')}
      />
    );
  if (sheet === 'meals') content = <MealLibrary {...libraryProps} />;
  if (sheet === 'mealBuilder')
    content = (
      <MealBuilder
        key={template?.id || 'new-meal'}
        initial={template}
        foods={[...foods, ...custom.filter((x) => !x.saved)]}
        onSave={saveTemplate}
        onCancel={() => setSheet('meals')}
      />
    );
  if (sheet === 'useMeal' && template)
    content = (
      <UseMealTemplate
        key={template.id}
        template={template}
        initialMeal={meal}
        onEdit={libraryProps.onEdit}
        onLog={(items, target) => {
          setEntries((prev) =>
            appendDiaryEntries(
              prev,
              day,
              items.map((x) => ({
                ...x,
                meal: target,
              })),
              profile,
            ),
          );
          setSheet(null);
          notify(items.length + ' foods added to ' + target);
        }}
      />
    );
  if (sheet === 'activity')
    content = (
      <ActivityEditor
        key={activity?.key || 'new-activity'}
        initial={activity}
        weight={[...weights].reverse().find((x) => x.date <= day)?.weight || profile.weight}
        onSave={(x) => {
          setActivities((prev) => ({
            ...prev,
            [day]: [...(prev[day] || []).filter((y) => y.key !== x.key), x],
          }));
          setSheet(null);
          notify('Activity saved');
        }}
        onDelete={
          activity
            ? () => {
                setActivities((prev) => ({
                  ...prev,
                  [day]: (prev[day] || []).filter((x) => x.key !== activity.key),
                }));
                setSheet(null);
                notify('Activity removed');
              }
            : undefined
        }
      />
    );
  if (sheet === 'recipe')
    content = (
      <Recipe
        foods={[...foods, ...custom]}
        save={(f) => {
          setCustom([...custom, f]);
          setSheet(null);
          notify('Recipe saved');
        }}
      />
    );
  if (sheet === 'photo')
    content = (
      <div className="scanbox">
        <div
          style={{
            fontSize: 45,
          }}
        >
          ◎
        </div>
        <h3>Meal scan</h3>
        <p>
          Photo recognition needs a connected nutrition service. For now, search for the foods in
          your meal.
        </p>
        <Button className="primary" onClick={() => setSheet('add')} variant="unstyled">
          Search foods
        </Button>
      </div>
    );
  if (sheet === 'barcode')
    content = (
      <BarcodeScanner
        onCreate={() => setSheet('custom')}
        onFound={(f) => {
          setCustom((previous) => rememberScannedFood(previous, f));
          notify('Food saved to My foods');
          setChosen(f);
          setQty(1);
          setSheet('add');
        }}
        custom={custom}
        notify={notify}
      />
    );
  if (sheet === 'settings') content = <SettingsPanel />;
  const titles = {
    settings: 'Settings',
    meals: 'My meals',
    mealBuilder: template?.id ? 'Edit meal' : 'Create meal',
    useMeal: 'Log saved meal',
    activity: activity ? 'Edit activity' : 'Log activity',
    edit: 'Edit food',
    add: chosen ? 'Food details' : 'Add food',
    profile: 'Made for you',
    weight: 'A little check-in',
    custom: 'Create a food',
    quick: 'Quick add',
    diary: meal,
    copy: 'Copy a day',
    recipe: 'Create a recipe',
    saveMeal: 'Save a meal',
    photo: 'Meal scan',
    barcode: 'Scan a barcode',
  };
  return (
    <main className="app">
      <header className="top">
        <Button
          variant="unstyled"
          className="brand"
          aria-label="Nourish — go to Today"
          onClick={() => navigate('Today')}
        >
          <span className="brand-heart">♥</span>
          nourish
        </Button>
        <div className="header-actions">
          <Button
            variant="unstyled"
            className="assistant-launch"
            aria-label="Open Nourish assistant"
            onClick={() => navigate('Assistant')}
          >
            {/* Google-colored gradient marks the assistant as an outside AI service. */}
            <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
              <linearGradient id="assistant-gradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#34a853" />
                <stop offset="0.35" stopColor="#4285f4" />
                <stop offset="0.7" stopColor="#9b72cb" />
                <stop offset="1" stopColor="#ea4335" />
              </linearGradient>
            </svg>
            <Sparkles size={19} stroke="url(#assistant-gradient)" aria-hidden="true" />
          </Button>
          <LoggingStreak entries={entries} today={today} />
          <Button
            className={tab === 'Profile' ? 'avatar profile-settings' : 'avatar'}
            aria-label={tab === 'Profile' ? 'Appearance & data' : 'Your profile'}
            title={tab === 'Profile' ? 'Appearance & data' : 'Your profile'}
            onClick={() => setSheet(tab === 'Profile' ? 'settings' : 'profile')}
            variant="unstyled"
          >
            {tab === 'Profile' ? (
              <Settings size={20} aria-hidden="true" />
            ) : (
              <ProfileAvatar profile={profile} seed={accountId} />
            )}
          </Button>
        </div>
      </header>
      <div className="page-transition" key={tab}>
        {body}
      </div>
      <BottomNavigation
        tab={tab}
        sheet={sheet}
        onNavigate={(next) => {
          navigate(next);
          setQuery('');
        }}
        onAddFood={() => openAdd()}
        onLogActivity={() => {
          setActivity(null);
          setSheet('activity');
        }}
      />
      {sheet && (
        <ModalSheet title={titles[sheet]} onClose={() => setSheet(null)}>
          {content}
        </ModalSheet>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
