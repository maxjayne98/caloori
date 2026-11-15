'use client';
import { macroSegments, macroTargetBand } from '@nourish/core';
import { DayEnergyHeader, useDayEnergy, WeightEstimate } from '@/features/diary/daily-summary';
import { useI18n } from '@/providers/i18n-provider';

const SEGMENTS = 24;
const MACROS = [
  { key: 'p', label: 'summary.protein', color: 'var(--macro-protein)' },
  { key: 'c', label: 'summary.carbs', color: 'var(--macro-carbs)' },
  { key: 'f', label: 'summary.fat', color: 'var(--macro-fat)' },
] as const;
const MACRO_COLOR = { p: 'var(--macro-protein)', c: 'var(--macro-carbs)', f: 'var(--macro-fat)' };

type Totals = { cal: number; p: number; c: number; f: number };
type Goals = { cal?: number | null; p?: number | null; c?: number | null; f?: number | null };

/** SVG arc path from angle a0 to a1 (degrees, 0 = 3 o'clock, clockwise). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const point = (a: number) => [
    cx + r * Math.cos((a * Math.PI) / 180),
    cy + r * Math.sin((a * Math.PI) / 180),
  ];
  const [x0, y0] = point(a0);
  const [x1, y1] = point(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/**
 * A macro dial: a 240° track, a lighter "on target" band, the eaten amount, and the value in the
 * middle. The scale runs to 130% of the goal so being over is still visible.
 */
function MacroGauge({
  value,
  goal,
  color,
  label,
  perKg,
  row = false,
}: {
  value: number;
  goal: number;
  color: string;
  label: string;
  perKg: string | null;
  /** Row: a smaller dial with the name beside it, for a stacked column next to the main dial. */
  row?: boolean;
}) {
  const start = 150;
  const sweep = 240;
  const angle = (ratio: number) => start + (sweep * Math.min(Math.max(ratio, 0), 1.3)) / 1.3;
  const band = macroTargetBand(goal);
  const ratio = goal > 0 ? value / goal : 0;
  return (
    <div className={row ? 'flex items-center gap-1.5' : 'grid justify-items-center text-center'}>
      <svg
        width={row ? 62 : 84}
        height={row ? 52 : 70}
        viewBox="0 0 84 70"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d={arc(42, 40, 32, start, start + sweep)}
          fill="none"
          stroke={`color-mix(in srgb, ${color} 12%, transparent)`}
          strokeWidth={7}
          strokeLinecap="round"
        />
        {band && (
          <path
            d={arc(42, 40, 32, angle(band.low / goal), angle(band.high / goal))}
            fill="none"
            stroke={`color-mix(in srgb, ${color} 32%, transparent)`}
            strokeWidth={7}
          />
        )}
        {ratio > 0 && (
          <path
            d={arc(42, 40, 32, start, Math.max(start + 1, angle(ratio)))}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeLinecap="round"
          />
        )}
        <text
          x="42"
          y="44"
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          style={{ fill: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}
        >
          {Math.round(value)}
        </text>
        <text
          x="42"
          y="56"
          textAnchor="middle"
          fontSize="8.5"
          style={{ fill: 'var(--neutral-85858b)' }}
        >
          / {goal ? Math.round(goal) : '—'} g
        </text>
      </svg>
      <span className={row ? 'grid min-w-0' : 'contents'}>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium ${row ? '' : '-mt-1'}`}
        >
          <span className="size-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        {perKg && <span className="text-[10px] text-[var(--neutral-85858b)]">{perKg}</span>}
      </span>
    </div>
  );
}

/**
 * Optional Today card: a segmented calorie dial in accent shades (one shade per meal) and three
 * macro dials with an on-target band. Hideable and movable from the Today layout editor.
 */
export function EnergyGauges({
  tot,
  profile,
  weight,
  day,
  entries,
  activities,
  weights,
  hasFood,
  onScore,
}: {
  tot: Totals & { dayScore?: unknown };
  profile: Goals & { weight?: number | null; goal?: string | null };
  weight?: number | null;
  day: string;
  entries: Record<string, unknown[]>;
  activities: Record<string, unknown[]>;
  weights: unknown[];
  hasFood: boolean;
  onScore?: () => void;
}) {
  const { t, locale } = useI18n();
  const { status, label, weightChange } = useDayEnergy({
    tot,
    profile,
    weight,
    day,
    entries,
    activities,
    weights,
    hasFood,
  });
  const goal = Number(profile.cal) || 0;
  if (!goal) return null;
  // The dial is built from the macros: each segment is colored by where its calories came from.
  const { segments, overKcal } = macroSegments(tot, goal, SEGMENTS);
  const left = Math.round(goal - tot.cal);
  const number = (value: number) => Math.round(value).toLocaleString(locale);
  const sweep = 260;
  const start = 140;
  const step = sweep / SEGMENTS;

  return (
    <section
      // daily-summary + balance class give the status tag the same colors as Daily energy.
      className={`card daily-summary balance-${status}`}
      aria-label={t('gauges.title')}
      // Same layered surface as the Daily energy card, so the two read as one family.
      style={{
        background:
          'radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--accent) 6%, var(--surface)) 0%, var(--surface) 55%)',
        border: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)',
        boxShadow:
          '0 1px 2px color-mix(in srgb, var(--foreground) 4%, transparent), 0 12px 32px color-mix(in srgb, var(--accent) 8%, transparent)',
      }}
    >
      <DayEnergyHeader tot={tot} onScore={onScore} label={label} />

      {/* Dial and the weight tile sit side by side as one centered group, so they never overlap. */}
      {/* The weight readout lives in the dial's open bottom, like a gauge's digital readout. */}
      {/* Test layout: macros stacked on the start side, the main dial on the end side. */}
      <div className="flex items-center justify-between gap-2">
        <div className="grid shrink-0 gap-1">
          {MACROS.map(({ key, label, color }) => {
            const value = tot[key] || 0;
            return (
              <MacroGauge
                key={key}
                row
                value={value}
                goal={Number(profile[key]) || 0}
                color={color}
                label={t(label)}
                perKg={weight ? `${(value / weight).toFixed(1)} ${t('common.grams')}/kg` : null}
              />
            );
          })}
        </div>
        <div className="relative min-w-0 max-w-[200px] flex-1">
          <svg
            // Scales down with the space left beside the macros (narrow phones), keeping its shape.
            width="100%"
            viewBox="0 0 200 176"
            className="block h-auto"
            role="img"
            aria-label={t('gauges.dialLabel', { eaten: number(tot.cal), goal: number(goal) })}
          >
            {/* Round caps overlap the neighbor a little, so the empty track is drawn first and the
              filled segments on top: the filled run then ends in a rounded tip, not a dent. */}
            {segments
              .map((macro, i) => ({ macro, i }))
              .sort((a, b) => Number(!!a.macro) - Number(!!b.macro))
              .map(({ macro, i }) => (
                <path
                  key={i}
                  d={arc(100, 96, 80, start + i * step + 1.4, start + (i + 1) * step - 1.4)}
                  fill="none"
                  strokeWidth={13}
                  strokeLinecap="round"
                  stroke={macro ? MACRO_COLOR[macro] : 'var(--accent-soft)'}
                />
              ))}
            <text
              x="100"
              y="90"
              textAnchor="middle"
              fontSize="38"
              fontWeight="780"
              letterSpacing="-1.5"
              style={{ fill: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}
            >
              {number(Math.abs(left))}
            </text>
            <text
              x="100"
              y="107"
              textAnchor="middle"
              fontSize="11"
              style={{ fill: 'var(--neutral-85858b)' }}
            >
              {left < 0 ? t('summary.kcalOverGoal') : t('summary.kcalRemaining')}
            </text>
            {/* Eaten vs goal as a small "fuel strip": the numbers on a soft capsule, and under them a
              mini bar split by macro calories, echoing the dial in miniature. */}
            <rect
              x="56"
              y="115"
              width="88"
              height="22"
              rx="11"
              style={{ fill: 'color-mix(in srgb, var(--foreground) 5%, transparent)' }}
            />
            <text
              x="100"
              y="129.5"
              textAnchor="middle"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              <tspan fontSize="12" fontWeight="700" style={{ fill: 'var(--foreground)' }}>
                {number(tot.cal)}
              </tspan>
              <tspan fontSize="10" style={{ fill: 'var(--neutral-85858b)' }}>
                {' '}
                / {number(goal)}
              </tspan>
            </text>
            {(() => {
              // Mini bar under the capsule: macro shares of the goal, same colors as the dial.
              const width = 72;
              const filled = segments.filter(Boolean).length / SEGMENTS;
              let x = 100 - width / 2;
              return (['p', 'c', 'f'] as const).map((macro) => {
                const share = segments.filter((m) => m === macro).length / SEGMENTS;
                const w = share * width;
                const rect = (
                  <rect
                    key={macro}
                    x={x}
                    y={141}
                    width={Math.max(0, w - (w > 2 ? 1 : 0))}
                    height={2.5}
                    rx={1.25}
                    style={{ fill: MACRO_COLOR[macro] }}
                  />
                );
                x += w;
                return filled > 0 ? rect : null;
              });
            })()}
            {overKcal > 0 && (
              <text
                x="150"
                y="129.5"
                fontSize="10"
                fontWeight="700"
                style={{ fill: 'var(--grade-d)', fontVariantNumeric: 'tabular-nums' }}
              >
                +{number(overKcal)}
              </text>
            )}
          </svg>
          {weightChange && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <WeightEstimate
                weightChange={weightChange}
                weight={weight}
                profile={profile}
                tot={tot}
                variant="notch"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
