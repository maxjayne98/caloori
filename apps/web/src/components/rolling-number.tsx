'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';

function RollingDigit({
  digit,
  direction,
  place,
}: {
  digit: number;
  direction: number;
  place: number;
}) {
  const reel = useRef<HTMLSpanElement>(null);
  const previous = useRef(digit);
  useLayoutEffect(() => {
    const element = reel.current;
    const from = previous.current;
    previous.current = digit;
    if (!element || from === digit) return;
    const travel = direction >= 0 ? (digit - from + 10) % 10 : -((from - digit + 10) % 10);
    const start = from + 10;
    const end = start + travel;
    element.style.transform = `translateY(-${end}em)`;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !element.animate) return;
    const animation = element.animate(
      [{ transform: `translateY(-${start}em)` }, { transform: `translateY(-${end}em)` }],
      { duration: 560 + Math.min(place, 4) * 35, easing: 'cubic-bezier(.22, 1, .36, 1)' },
    );
    return () => animation.cancel();
  }, [digit, direction, place]);
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
/** Digit wheels move only on value changes; the accessible value never contains intermediate digits. */
export function RollingNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const previous = useRef(value);
  const direction = value >= previous.current ? 1 : -1;
  useEffect(() => {
    previous.current = value;
  }, [value]);
  const text = new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(value);
  return (
    <span className="rolling-number">
      <span className="sr-only">{text}</span>
      <span className="number-digits" aria-hidden="true">
        {[...text].map((character, index) =>
          /\d/.test(character) ? (
            <RollingDigit
              key={text.length - index}
              digit={Number(character)}
              direction={direction}
              place={text.length - index - 1}
            />
          ) : (
            <span className="number-mark" key={text.length - index}>
              {character}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
