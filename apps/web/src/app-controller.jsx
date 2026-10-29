'use client';
import { WeeklyReportPage } from '@/features/progress/weekly-report-page';

import { AddFoodSheet } from '@/features/foods/add-sheet';
import { ProfilePage } from '@/features/profile/profile-page';
import { AssistantPage } from '@/features/assistant/assistant-page';
import { ClipboardPaste, Sparkles, Settings, X } from 'lucide-react';
import { LogWeightSheet } from '@/features/progress/weight-sheet';
import { MealDetailSheet } from '@/features/diary/diary-sheet';
import { CopyDaySheet } from '@/features/diary/copy-sheet';
import { ModalSheet } from '@/components/modal-sheet';
import { SettingsPanel } from '@/features/settings/settings-panel';
import { useState, useEffect } from 'react';
import { Button, Input } from '@nourish/ui';
import {
  APP_VERSION,
  buildWeeklyReport,
  foods,
  today,
  freshKey,
  reusableItems,
  appendDiaryEntries,
  rememberScannedFood,
  sumExtraNutrients,
  scoreDay,
  mealForTime,
  foodLibrary,
  saveFoodEdit,
  resetFoodEdit,
  isCatalogFood,
  scoreMeal,
  suggestFoods,
  suggestionPrompt,
  extraNutrientsFromInput,
} from '@nourish/core';
import { LayoutGrid } from 'lucide-react';
import { ExtraNutrientFields } from '@/components/extra-nutrients';
import { ScoreInsights } from '@/components/score-insights';
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
import { NutritionLabelImport } from '@/features/foods/nutrition-label-import';
import { TodayPage } from '@/features/diary/today-page';
import { FoodPage } from '@/features/foods/food-page';
import { ProgressPage } from '@/features/progress/progress-page';
import { field, formData } from '@/components/form-fields';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';

const VERSION_CONFETTI_COLORS = [
  '--accent',
  '--grade-a',
  '--grade-b',
  '--grade-c',
  '--grade-d',
  '--grade-e',
  '--macro-protein',
  '--macro-carbs',
  '--macro-fat',
];
const VERSION_CONFETTI = Array.from({ length: 64 }, (_, index) => ({
  x: (index * 37) % 100,
  delay: (index * 67) % 650,
  drift: ((index * 29) % 101) - 50,
  rotation: 240 + ((index * 97) % 540),
  duration: 1800 + ((index * 71) % 900),
  color: VERSION_CONFETTI_COLORS[index % VERSION_CONFETTI_COLORS.length],
}));

export function App() {
  const { t, tMeal } = useI18n();
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
    [activity, setActivity] = useState(null),
    [nutritionLabelOpen, setNutritionLabelOpen] = useState(false),
    // Today's layout edit mode; started from the Profile page.
    [todayEditing, setTodayEditing] = useState(false),
    // Food being edited in the Food library (built-in or the user's own).
    [editingFood, setEditingFood] = useState(null),
    // Prefilled message when the score insights hand off to the assistant.
    [assistantDraft, setAssistantDraft] = useState('');
  const [showVersionNotice, setShowVersionNotice] = useState(false);
  const [versionNoticeEntered, setVersionNoticeEntered] = useState(false);
  const [showChangelogOnSettings, setShowChangelogOnSettings] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem('nourish-next:seen-app-version') === APP_VERSION) return;
      setShowVersionNotice(true);
      const frame = requestAnimationFrame(() => setVersionNoticeEntered(true));
      return () => cancelAnimationFrame(frame);
    } catch (error) {
      console.error('Could not check the app version notice.', error);
    }
  }, []);
  function acknowledgeVersionNotice() {
    setShowVersionNotice(false);
    setVersionNoticeEntered(false);
    try {
      localStorage.setItem('nourish-next:seen-app-version', APP_VERSION);
    } catch (error) {
      console.error('Could not save the seen app version.', error);
    }
  }
  function openVersionChangelog() {
    acknowledgeVersionNotice();
    setShowChangelogOnSettings(true);
    setSheetState('settings');
  }
  function navigate(next) {
    if (next !== 'Today') setTodayEditing(false);
    window.location.hash = next.toLowerCase();
    setTab(next);
    setSheetState(null);
    setNutritionLabelOpen(false);
    window.scrollTo(0, 0);
  }
  function setSheet(next) {
    setNutritionLabelOpen(false);
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
  tot.extras = sumExtraNutrients(list);
  // Energy and protein only count toward the day score once the day is over.
  tot.dayScore = scoreDay(list, profile, { complete: day < today });
  const notify = (t) => setToast(t),
    // Without a chosen meal (bottom Add button), default to the meal that fits the time of day.
    openAdd = (m = mealForTime(new Date())) => {
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
    notify(t('toast.addedTo', { meal: tMeal(meal) }));
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
    notify(t('toast.removed', { name: x.name }));
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
    notify(t('toast.movedTo', { target: tMeal(target) }));
  }
  function saveTemplate(tObj) {
    setTemplates((prev) => [...prev.filter((x) => x.id !== tObj.id), tObj]);
    setSheet('meals');
    notify(t('toast.mealSaved'));
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
    onDelete: (tObj) => {
      setTemplates((prev) => prev.filter((x) => x.id !== tObj.id));
      notify(t('toast.savedMealDeleted'));
    },
  };
  const weeklyReport = buildWeeklyReport(entries, activities, weights);
  let body;
  if (tab === 'Weekly')
    body = <WeeklyReportPage report={weeklyReport} onBack={() => navigate('Today')} />;
  if (tab === 'Today')
    body = (
      <TodayPage
        onDayScore={() => {
          setMeal(mealForTime(new Date()));
          setSheet('dayInsights');
        }}
        onMealScore={(m) => {
          setMeal(m);
          setSheet('mealInsights');
        }}
        editing={todayEditing}
        setEditing={setTodayEditing}
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
        onEditFood={(food) => {
          setEditingFood(food);
          setSheet('editFood');
        }}
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
    body = (
      <ProfilePage
        profile={profile}
        setProfile={setProfile}
        notify={notify}
        onEditTodayLayout={() => {
          navigate('Today');
          setTodayEditing(true);
        }}
      />
    );
  if (tab === 'Assistant')
    body = <AssistantPage key={assistantDraft} day={day} initialPrompt={assistantDraft} />;
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
          notify(t('toast.foodUpdated'));
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
  if (['custom', 'quick', 'editFood'].includes(sheet)) {
    // The same form creates foods, quick-adds, and edits an existing food (prefilled).
    const draft = sheet === 'editFood' ? editingFood : null;
    const editingCatalog = draft && isCatalogFood(draft.id, foods);
    content = (
      <form
        onSubmit={(e) => {
          let d = formData(e),
            f = {
              ...(draft || {}),
              id: draft?.id || 'u' + Date.now(),
              name: d.name || 'Quick add',
              serving: d.serving || '1 serving',
              gramsPerServing: +d.grams || null,
              cal: +d.cal,
              p: +d.p || 0,
              c: +d.c || 0,
              f: +d.f || 0,
              ...extraNutrientsFromInput(d),
              emoji: '🍽️',
            };
          if (draft) setCustom(saveFoodEdit(custom, f, foods));
          else if (sheet === 'custom') setCustom([...custom, f]);
          else add(f, 1);
          setSheet(null);
          notify(
            draft
              ? t('toast.foodUpdated')
              : sheet === 'custom'
                ? t('toast.foodSavedLibrary')
                : t('toast.addedTo', { meal: tMeal(meal) }),
          );
        }}
      >
        {sheet === 'custom' && (
          <NutritionLabelImport
            notify={notify}
            open={nutritionLabelOpen}
            onOpenChange={setNutritionLabelOpen}
          />
        )}
        {field(t('food.searchPlaceholder'), 'name', draft?.name ?? (query || ''), 'text')}
        {sheet !== 'quick' &&
          field(t('portion.servingSize'), 'serving', draft?.serving ?? '1 serving', 'text')}
        {sheet !== 'quick' && (
          <div>
            <label htmlFor="food-grams">{t('portion.gramsPerServing')}</label>
            <Input
              id="food-grams"
              name="grams"
              type="number"
              min={0.001}
              step="any"
              inputMode="decimal"
              placeholder="Add a weight to enable grams"
              defaultValue={draft?.gramsPerServing ?? ''}
              unstyled
            />
          </div>
        )}
        {field(`${t('summary.dailyEnergy')} (${t('common.kcal')})`, 'cal', draft?.cal ?? '')}
        <div className="grid2">
          {field(`${t('summary.protein')} (${t('common.grams')})`, 'p', draft?.p ?? 0)}
          {field(`${t('summary.carbs')} (${t('common.grams')})`, 'c', draft?.c ?? 0)}
        </div>
        {field(`${t('summary.fat')} (${t('common.grams')})`, 'f', draft?.f ?? 0)}
        <ExtraNutrientFields values={draft || undefined} />
        <Button className="primary" variant="unstyled">
          {sheet === 'quick' ? t('meals.addToMeal', { meal: tMeal(meal) }) : t('portion.saveFood')}
        </Button>
        {draft && editingCatalog && draft.edited && (
          <Button
            className="secondary"
            type="button"
            variant="unstyled"
            onClick={() => {
              setCustom(resetFoodEdit(custom, draft.id));
              setSheet(null);
              notify(t('toast.foodReset'));
            }}
          >
            {t('food.resetToOriginal')}
          </Button>
        )}
        {draft && !editingCatalog && (
          <Button
            className="secondary"
            type="button"
            variant="unstyled"
            onClick={() => {
              setCustom(custom.filter((x) => x.id !== draft.id));
              setSheet(null);
              notify(t('toast.foodDeleted'));
            }}
          >
            {t('food.deleteFood')}
          </Button>
        )}
      </form>
    );
  }
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
        foods={foodLibrary(foods, custom).filter((x) => !x.saved)}
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
        foods={foodLibrary(foods, custom).filter((x) => !x.saved)}
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
          notify(t('toast.activitySaved'));
        }}
        onDelete={
          activity
            ? () => {
                setActivities((prev) => ({
                  ...prev,
                  [day]: (prev[day] || []).filter((x) => x.key !== activity.key),
                }));
                setSheet(null);
                notify(t('toast.activityRemoved'));
              }
            : undefined
        }
      />
    );
  if (sheet === 'recipe')
    content = (
      <Recipe
        foods={foodLibrary(foods, custom)}
        save={(f) => {
          setCustom([...custom, f]);
          setSheet(null);
          notify(t('toast.recipeSaved'));
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
  if (sheet === 'settings')
    content = <SettingsPanel showChangelogInitially={showChangelogOnSettings} />;
  if (sheet === 'dayInsights' || sheet === 'mealInsights') {
    // Day insights suggest for the meal that fits now; meal insights for the tapped meal.
    const insight =
      sheet === 'dayInsights' ? tot.dayScore : scoreMeal(list.filter((x) => x.meal === meal));
    const recentIds = [
      ...new Set(
        Object.values(entries)
          .flat()
          .map((x) => x.id),
      ),
    ];
    const suggestions = suggestFoods(list, foodLibrary(foods, custom), profile, { recentIds });
    if (insight)
      content = (
        <ScoreInsights
          insight={insight}
          suggestions={suggestions}
          onLog={(suggestion) => {
            add(suggestion.food, suggestion.qty);
            setSheet(null);
            notify(t('toast.addedTo', { meal: tMeal(meal) }));
          }}
          onAsk={() => {
            setAssistantDraft(
              suggestionPrompt({
                score: tot.dayScore?.score ?? insight.score,
                reasons: (tot.dayScore?.reasons ?? insight.reasons).map((r) =>
                  t(`score.reason.${r}`),
                ),
                remaining: (profile.cal || 2000) - tot.cal,
                eatenNames: list.map((x) => x.name),
              }),
            );
            navigate('Assistant');
          }}
        />
      );
  }
  const titles = {
    dayInsights: t('insights.dayTitle'),
    mealInsights: t('insights.mealTitle', { meal: tMeal(meal) }),
    editFood: t('sheet.editFood'),
    settings: t('sheet.settings'),
    meals: t('sheet.meals'),
    mealBuilder: template?.id ? t('meals.editMeal') : t('meals.createMeal'),
    useMeal: t('sheet.useMeal'),
    activity: activity ? t('activity.editButton') : t('activity.logButton'),
    edit: t('sheet.edit'),
    add: chosen ? t('sheet.add') : t('sheet.addFood'),
    profile: t('sheet.profile'),
    weight: t('sheet.weight'),
    custom: t('sheet.custom'),
    quick: t('sheet.quick'),
    diary: tMeal(meal),
    copy: t('sheet.copy'),
    recipe: t('sheet.recipe'),
    saveMeal: t('sheet.saveMeal'),
    photo: t('sheet.photo'),
    barcode: t('sheet.barcode'),
  };
  return (
    <main className="app">
      <header className="top">
        <Button
          variant="unstyled"
          className="brand"
          aria-label={t('nav.brandAria')}
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
          {tab === 'Profile' ? (
            // Opens Today straight into layout edit mode; styled apart from the round settings button.
            <Button
              variant="unstyled"
              className="grid size-[42px] place-items-center rounded-[14px] bg-[var(--accent-soft)] text-[var(--accent-text)]"
              aria-label={t('today.editLayout')}
              title={t('today.editLayout')}
              onClick={() => {
                navigate('Today');
                setTodayEditing(true);
              }}
            >
              <LayoutGrid size={18} aria-hidden="true" />
            </Button>
          ) : null}
          <Button
            className={tab === 'Profile' ? 'avatar profile-settings' : 'avatar'}
            aria-label={tab === 'Profile' ? t('nav.settingsAria') : t('nav.profileAria')}
            title={tab === 'Profile' ? t('nav.settingsAria') : t('nav.profileAria')}
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
      {showVersionNotice && (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
            aria-hidden="true"
          >
            {VERSION_CONFETTI.map((piece, index) => (
              <i
                key={index}
                className={`update-confetti-piece ${
                  index % 3 === 0 ? 'h-3 w-1' : index % 3 === 1 ? 'size-2 rounded-full' : 'size-2'
                }`}
                style={{
                  left: `${piece.x}%`,
                  backgroundColor: `var(${piece.color})`,
                  animationDelay: `${piece.delay}ms`,
                  animationDuration: `${piece.duration}ms`,
                  '--confetti-drift': `${piece.drift}px`,
                  '--confetti-rotation': `${piece.rotation}deg`,
                }}
              />
            ))}
          </div>
          <div
            role="status"
            className={`fixed inset-x-4 bottom-[calc(92px+env(safe-area-inset-bottom))] z-[70] mx-auto flex max-w-md items-center gap-3 rounded-2xl border-2 border-(--accent) bg-[var(--surface)] p-3 text-[var(--foreground)] shadow-lg transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
              versionNoticeEntered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            <Sparkles size={18} className="shrink-0 text-[var(--accent)]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-xs font-semibold">{t('settings.updateAvailable')}</p>
              <p className="m-0 text-[10px] text-[var(--neutral-85858b)]">
                {t('settings.updateVersion', { version: APP_VERSION })}
              </p>
            </div>
            <Button
              variant="unstyled"
              className="shrink-0 rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent-text)]"
              onClick={openVersionChangelog}
            >
              {t('settings.whatsNew')}
            </Button>
            <Button
              variant="unstyled"
              className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--neutral-85858b)] hover:bg-[var(--neutral-e9e9ee)]"
              aria-label={t('settings.dismissUpdate')}
              onClick={acknowledgeVersionNotice}
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </div>
        </>
      )}
      {sheet && (
        <ModalSheet
          title={titles[sheet]}
          headerAction={
            sheet === 'custom' ? (
              <Button
                type="button"
                variant="unstyled"
                className="nutrition-label-header-action"
                aria-label="Import from nutrition label"
                title="Import from nutrition label"
                aria-expanded={nutritionLabelOpen}
                aria-controls={nutritionLabelOpen ? 'nutrition-label-panel' : undefined}
                onClick={() => setNutritionLabelOpen((open) => !open)}
              >
                <ClipboardPaste size={18} aria-hidden="true" />
              </Button>
            ) : null
          }
          onClose={() => {
            setSheet(null);
            setShowChangelogOnSettings(false);
          }}
        >
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
