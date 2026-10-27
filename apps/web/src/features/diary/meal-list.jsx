'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@nourish/ui';
import { meals, portionNumber, formatPortion } from '@nourish/core';
import { Icon } from '@/components/icon';
export function MealList({ day, list, onAdd, onEdit, onDelete, onMove, onView, onSave }) {
  const [drag, setDrag] = useState(null),
    [over, setOver] = useState(null),
    [logged, setLogged] = useState([]),
    ref = React.useRef(null),
    previous = React.useRef(null);
  // Animate a meal's icon when it gains items on the same day (not when switching days).
  const countKey = meals.map((m) => list.filter((x) => x.meal === m).length).join(',');
  useEffect(() => {
    const counts = Object.fromEntries(countKey.split(',').map((n, i) => [meals[i], +n]));
    const before = previous.current;
    previous.current = { day, counts };
    if (!before || before.day !== day) return;
    const grown = meals.filter((m) => counts[m] > before.counts[m]);
    if (!grown.length) return;
    // Wait for the add sheet (and its scroll lock) to close, bring the meal into view,
    // then celebrate so the animation is actually seen.
    const timers = [];
    timers.push(
      setTimeout(() => {
        const section = document.querySelector(`[data-meal="${grown[0]}"]`);
        const box = section?.getBoundingClientRect();
        const hidden = !!box && (box.top < 70 || box.bottom > innerHeight - 100);
        if (hidden) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        timers.push(setTimeout(() => setLogged(grown), hidden ? 450 : 0));
        timers.push(setTimeout(() => setLogged([]), (hidden ? 450 : 0) + 1300));
      }, 120),
    );
    return () => timers.forEach(clearTimeout);
  }, [day, countKey]);
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
          return (
            <section
              key={m}
              data-meal={m}
              className={'meal-group' + (over === m ? ' drop-over' : '')}
            >
              <div className="meal-heading">
                <div className={'meal-icon' + (logged.includes(m) ? ' is-logged' : '')}>
                  <Icon type={['Sun', 'Lunch', 'Moon', 'Snack'][i]} />
                </div>
                <Button className="meal-body" onClick={() => onView(m)} variant="unstyled">
                  <b>{m}</b>
                  <small>
                    {items.length
                      ? items.length +
                        ' item' +
                        (items.length === 1 ? '' : 's') +
                        ' · ' +
                        Math.round(items.reduce((s, x) => s + x.cal * x.qty, 0)) +
                        ' kcal'
                      : 'Nothing logged yet'}
                  </small>
                </Button>
                <div className="meal-header-actions">
                  {items.length > 0 && (
                    <Button
                      className="save-meal-action"
                      aria-label={'Save ' + m + ' as meal'}
                      onClick={() => onSave(m)}
                      variant="unstyled"
                    >
                      <Icon type="Bookmark" />
                    </Button>
                  )}
                  <Button
                    className="plus"
                    aria-label={'Add to ' + m}
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
                    aria-label={'Drag ' + x.name + ' to another meal'}
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
