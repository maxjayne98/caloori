'use client';

import { Button } from '@nourish/ui';
import { portionNumber } from '@nourish/core';
export function FoodRows({ items, setChosen, setQty, setSheet }) {
  return items.map((f) => (
    <div className="food-row" key={f.id}>
      <Button
        className="info"
        onClick={() => {
          setChosen(f);
          setQty(1);
          setSheet('add');
        }}
        variant="unstyled"
      >
        <b>{f.name}</b>
        <small>{f.serving + ' · ' + f.cal + ' kcal'}</small>
        <span className="food-row-macros">
          {'Protein ' +
            portionNumber(f.p) +
            ' g · Carbs ' +
            portionNumber(f.c) +
            ' g · Fat ' +
            portionNumber(f.f) +
            ' g'}
        </span>
      </Button>
      <Button
        className="plus"
        aria-label={'Add ' + f.name}
        onClick={() => {
          setChosen(f);
          setQty(1);
          setSheet('add');
        }}
        variant="unstyled"
      >
        +
      </Button>
    </div>
  ));
}
