'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';

type DigitMotion = { digit: number; direction: number; place: number; value: number };

function RollingDigit({ digit, direction, place, value }: DigitMotion) {
  const reel = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);
  const lastTarget = useRef<number | null>(null);
  const startDigit = useRef(0);
  const lastValue = useRef<number | null>(null);
  const fullTurn = useRef(false);
  // Motion options must not restart a wheel when unrelated data (e.g. save status) re-renders.
  const options = useRef({ direction, place });
  options.current = { direction, place };

  useLayoutEffect(() => {
    const element = reel.current;
    if (!element) return;
    // Keep the same starting point across Strict Mode's setup/cleanup/setup cycle.
    if (lastTarget.current !== digit || lastValue.current !== value) {
      // A carry such as 100 → 0 still moves the surviving zero wheel.
      fullTurn.current =
        lastValue.current !== null && lastValue.current !== value && previous.current === digit;
      lastValue.current = value;
      startDigit.current = previous.current;
      previous.current = digit;
      lastTarget.current = digit;
    }
    const from = startDigit.current;
    if (
      (from === digit && !fullTurn.current) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !element.animate
    ) {
      element.style.transform = `translateY(-${digit + 10}em)`;
      return;
    }
    const forward = (digit - from + 10) % 10;
    const backward = (from - digit + 10) % 10;
    const travel =
      options.current.direction >= 0
        ? forward || (fullTurn.current ? 10 : 0)
        : -(backward || (fullTurn.current ? 10 : 0));
    const start = from + 10;
    const end = start + travel;
    element.style.transform = `translateY(-${end}em)`;
    const animation = element.animate(
      [{ transform: `translateY(-${start}em)` }, { transform: `translateY(-${end}em)` }],
      {
        duration: 760 + Math.min(options.current.place, 4) * 35,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
      },
    );
    return () => animation.cancel();
  }, [digit, value]);

  return (
    <span className="number-slot">
      <span
        ref={reel}
        className="number-reel"
        style={{ transform: `translateY(-${digit + 10}em)` }}
      >
        {Array.from({ length: 30 }, (_, i) => (
          <span key={i}>{i % 10}</span>
        ))}
      </span>
    </span>
  );
}

/** Stable place-value keys preserve the same wheel when commas or decimals change. */
export function RollingNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const previous = useRef(value);
  const direction = value >= previous.current ? 1 : -1;
  useEffect(() => {
    previous.current = value;
  }, [value]);
  const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals });
  const parts = formatter.formatToParts(value);
  const text = formatter.format(value);
  let integerPlace = parts
    .filter((p) => p.type === 'integer')
    .reduce((count, p) => count + p.value.length, 0);
  let fractionPlace = 0;
  return (
    <span className="rolling-number">
      <span className="sr-only">{text}</span>
      <span className="number-digits" aria-hidden="true">
        {parts.flatMap((part, partIndex) =>
          part.type === 'integer' || part.type === 'fraction' ? (
            [...part.value].map((character) => {
              const integer = part.type === 'integer';
              const place = integer ? --integerPlace : fractionPlace++;
              return (
                <RollingDigit
                  key={`${integer ? 'integer' : 'fraction'}-${place}`}
                  digit={Number(character)}
                  value={value}
                  direction={direction}
                  place={place}
                />
              );
            })
          ) : (
            <span className="number-mark" key={`mark-${part.type}-${partIndex}`}>
              {part.value}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
