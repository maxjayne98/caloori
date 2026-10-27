'use client';
import { NourishCompanion } from './nourish-companion';
export function HeartLoader({
  label = 'A little moment…',
  inline = false,
}: {
  label?: string;
  inline?: boolean;
}) {
  return (
    <div
      className={'heart-loader' + (inline ? ' is-inline' : '')}
      role={label ? 'status' : undefined}
      aria-label={label || undefined}
    >
      <div className="loader-heart" aria-hidden="true">
        <NourishCompanion />
      </div>
      {label && <span>{label}</span>}
    </div>
  );
}
