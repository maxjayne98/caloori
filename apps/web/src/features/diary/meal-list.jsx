'use client';
import { GradeDot, GradeMark } from '@/components/score-badge';

import React, { useState, useEffect } from 'react';
import { Button } from '@nourish/ui';
import {
  meals,
  portionNumber,
  formatPortion,
  mealCalorieTarget,
  scoreMeal,
  scoreFood,
} from '@nourish/core';
import { Icon } from '@/components/icon';
import { useI18n } from '@/providers/i18n-provider';
export function MealList({
  day,
  list,
  profile,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  onView,
  onSave,
  onScore,
}) {
  const { t, tMeal } = useI18n();
  const [drag, setDrag] = useState(null),
    [over, setOver] = useState(null),
    [logged, setLogged] = useState([]),
    ref = React.useRef(null),
    previous = React.useRef(null);
  // Track all logged-item edits, but do not animate when switching days.
  const mealSignatures = Object.fromEntries(
    meals.map((meal) => [
      meal,
      list
        .filter((item) => item.meal === meal)
        .map((item) =>
          JSON.stringify({
            key: item.key,
            name: item.name,
            qty: item.qty,
            cal: item.cal,
            p: item.p,
            c: item.c,
            f: item.f,
            serving: item.serving,
            portion: item.portion,
          }),
        )
        .sort()
        .join('|'),
    ]),
  );
  const signatureKey = JSON.stringify(mealSignatures);
  useEffect(() => {
    const before = previous.current;
    previous.current = { day, mealSignatures };
    if (!before || before.day !== day) return;
    const changed = meals.filter((meal) => mealSignatures[meal] !== before.mealSignatures[meal]);
    if (!changed.length) return;
    setLogged([]);
    // Wait for the add sheet (and its scroll lock) to close, bring the meal into view,
    // then celebrate so the animation is actually seen.
    const timers = [];
    timers.push(
      setTimeout(() => {
        const section = document.querySelector(`[data-meal="${changed[0]}"]`);
        const box = section?.getBoundingClientRect();
        const hidden = !!box && (box.top < 70 || box.bottom > innerHeight - 100);
        if (hidden) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        timers.push(setTimeout(() => setLogged(changed), hidden ? 450 : 0));
        timers.push(setTimeout(() => setLogged([]), (hidden ? 450 : 0) + 1300));
      }, 120),
    );
    return () => timers.forEach(clearTimeout);
  }, [day, signatureKey]);
  function finish() {
    const d = ref.current;
    if (d && d.target) onMove(d.key, d.target);
    ref.current = null;
    setDrag(null);
    setOver(null);
  }
  useEffect(() => {
    if (!drag) return;
    function move(e) {
      let el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-meal]');
      let target = el?.dataset.meal;
      ref.current.target = target;
      setOver(target);
      setDrag({
        ...ref.current,
        x: e.clientX,
        y: e.clientY,
      });
      const edge = 65;
      if (e.clientY < edge) window.scrollBy(0, -12);
      else if (e.clientY > innerHeight - edge - 85) window.scrollBy(0, 12);
    }
    function cancel() {
      ref.current = null;
      setDrag(null);
      setOver(null);
    }
    window.addEventListener('pointermove', move, {
      passive: false,
    });
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [!!drag]);
  return (
    <>
      <div className="meal-groups">
        {meals.map((m, i) => {
          let items = list.filter((x) => x.meal === m);
          const target = mealCalorieTarget(profile?.cal, m, profile?.mealCalories);
          const consumed = Math.round(items.reduce((sum, item) => sum + item.cal * item.qty, 0));
          const goalPercent = target > 0 ? Math.round((consumed / target) * 100) : null;
          const mealScore = scoreMeal(items);
          return (
            <section
              key={m}
              data-meal={m}
              className={'meal-group' + (over === m ? ' drop-over' : '')}
            >
              <div className="meal-heading">
                <div
                  className={
                    'meal-icon' +
                    (logged.includes(m) ? ' is-logged' : '') +
                    (goalPercent !== null ? ' has-goal-progress' : '')
                  }
                >
                  <Icon type={['Sun', 'Lunch', 'Moon', 'Snack'][i]} />
                  {goalPercent !== null && (
                    <>
                      <svg
                        className="meal-icon-progress"
                        viewBox="0 0 48 48"
                        role="progressbar"
                        aria-label={`${m}: ${goalPercent}% of meal calorie target`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(goalPercent, 100)}
                      >
                        <circle className="meal-icon-progress-track" cx="24" cy="24" r="21" />
                        <circle
                          className="meal-icon-progress-value"
                          cx="24"
                          cy="24"
                          r="21"
                          strokeDasharray={131.95}
                          strokeDashoffset={131.95 * (1 - Math.min(goalPercent, 100) / 100)}
                        />
                      </svg>
                      <span className="meal-icon-percent">{goalPercent}%</span>
                    </>
                  )}
                </div>
                <Button className="meal-body" onClick={() => onView(m)} variant="unstyled">
                  <b>{tMeal(m)}</b>
                  <small>
                    {items.length
                      ? `${consumed} / ${target !== null ? `~${target}` : '—'} ${t('common.kcal')}`
                      : target !== null
                        ? t('meals.aboutTargetNothing', { target })
                        : t('meals.nothingLogged')}
                  </small>
                </Button>
                <div className="meal-header-actions">
                  {mealScore && (
                    // Only the grade opens suggestions; tapping the meal itself still opens it.
                    <Button
                      variant="unstyled"
                      className="grid"
                      aria-label={t('insights.mealTitle', { meal: tMeal(m) })}
                      onClick={() => onScore?.(m)}
                    >
                      <GradeMark {...mealScore} size="md" />
                    </Button>
                  )}
                  {items.length > 0 && (
                    <Button
                      className="save-meal-action"
                      aria-label={t('meals.saveAsMeal', { meal: tMeal(m) })}
                      onClick={() => onSave(m)}
                      variant="unstyled"
                    >
                      <Icon type="Bookmark" />
                    </Button>
                  )}
                  <Button
                    className="plus"
                    aria-label={t('meals.addToMeal', { meal: tMeal(m) })}
                    onClick={() => onAdd(m)}
                    variant="unstyled"
                  >
                    +
                  </Button>
                </div>
              </div>
              {items.map((x) => (
                <div
                  key={x.key}
                  className={'diary-item' + (drag?.key === x.key ? ' dragging' : '')}
                >
                  <Button
                    className="drag-handle"
                    aria-label={t('meals.dragToOther', { name: x.name })}
                    onPointerDown={(e) => {
                      if (e.button !== 0) return;
                      e.preventDefault();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      ref.current = {
                        key: x.key,
                        name: x.name,
                        x: e.clientX,
                        y: e.clientY,
                        target: m,
                      };
                      setDrag(ref.current);
                      setOver(m);
                    }}
                    variant="unstyled"
                  >
                    <Icon type="Grip" />
                  </Button>
                  <Button className="item-details" onClick={() => onEdit(x)} variant="unstyled">
                    <b>{x.name}</b>
                    <small>
                      {formatPortion(x) + ' · ' + portionNumber(x.cal * x.qty) + ' kcal'}
                      <GradeDot score={scoreFood(x)} />
                    </small>
                  </Button>
                  <Button
                    className="item-action"
                    aria-label={'Edit ' + x.name}
                    onClick={() => onEdit(x)}
                    variant="unstyled"
                  >
                    <Icon type="Edit" />
                  </Button>
                  <Button
                    className="item-action remove"
                    aria-label={'Delete ' + x.name}
                    onClick={() => onDelete(x)}
                    variant="unstyled"
                  >
                    <Icon type="Trash" />
                  </Button>
                </div>
              ))}
            </section>
          );
        })}
      </div>
      {drag && (
        <div
          className="drag-preview"
          style={{
            left: Math.max(12, Math.min(drag.x - 80, innerWidth - 180)),
            top: drag.y - 55,
          }}
        >
          {drag.name}
        </div>
      )}
    </>
  );
}
