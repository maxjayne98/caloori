'use client';
import type {
  Confidence,
  DayReason,
  FoodScore,
  Grade,
  PortionLevel,
  PortionScore,
  ScoreReason,
} from '@nourish/core';
import { cn } from '@nourish/ui';
import { useI18n } from '@/providers/i18n-provider';

const GRADE_COLOR: Record<Grade, string> = {
  A: 'var(--grade-a)',
  B: 'var(--grade-b)',
  C: 'var(--grade-c)',
  D: 'var(--grade-d)',
  E: 'var(--grade-e)',
};

/** Hover/long-press text: grade, why, and a note when values were estimated. */
function useExplain() {
  const { t } = useI18n();
  return (
    grade: Grade,
    reasons: readonly (ScoreReason | DayReason)[],
    confidence: Confidence,
    label = t('score.grade', { grade }),
  ) =>
    [
      label,
      ...reasons.map((reason) => t(`score.reason.${reason}` as never)),
      confidence !== 'high' ? t('score.estimated') : null,
    ]
      .filter(Boolean)
      .join(' · ');
}

/** Soft grade letter for meals and the day, with the 0–100 score beside it when given. */
export function GradeMark({
  grade,
  reasons,
  confidence,
  score,
  label,
}: {
  grade: Grade;
  reasons: readonly (ScoreReason | DayReason)[];
  confidence: Confidence;
  score?: number;
  /** Replaces the default "Score B" lead-in of the explanation. */
  label?: string;
}) {
  const explain = useExplain()(grade, reasons, confidence, label);
  const color = GRADE_COLOR[grade];
  return (
    <span
      role="img"
      aria-label={score === undefined ? explain : `${score} · ${explain}`}
      title={explain}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full text-[10px] font-bold leading-none tabular-nums',
        score !== undefined && 'py-px pe-px ps-1.5',
        confidence === 'low' && 'opacity-70',
      )}
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      {score}
      <span
        className="inline-grid size-4 place-items-center rounded-full"
        style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}
      >
        {grade}
      </span>
    </span>
  );
}

const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'E'];

/**
 * Mini Nutri-Score style scale for the food being added: five segments, its grade enlarged
 * and lettered. Inactive segments fade further when the grade rests on estimates.
 */
export function MiniGradeScale({
  grade,
  reasons,
  confidence,
}: {
  grade: Grade;
  reasons: readonly ScoreReason[];
  confidence: Confidence;
}) {
  const explain = useExplain()(grade, reasons, confidence);
  return (
    <span
      role="img"
      aria-label={explain}
      title={explain}
      className="inline-flex items-center gap-[2px]"
    >
      {GRADES.map((letter) =>
        letter === grade ? (
          <span
            key={letter}
            className={cn(
              'grid h-[18px] w-[13px] place-items-center rounded-[4px] text-[10px] font-bold leading-none text-white',
              confidence === 'low' && 'outline outline-1 outline-offset-1 outline-dashed',
            )}
            style={{ background: GRADE_COLOR[letter], outlineColor: GRADE_COLOR[letter] }}
          >
            {letter}
          </span>
        ) : (
          <span
            key={letter}
            className={cn(
              'h-3 w-[7px] rounded-[3px]',
              confidence === 'high' ? 'opacity-35' : 'opacity-20',
            )}
            style={{ background: GRADE_COLOR[letter] }}
          />
        ),
      )}
    </span>
  );
}

/** Tiny grade-colored dot shown beside a logged food's name. */
export function GradeDot({ score }: { score: FoodScore }) {
  const explain = useExplain()(score.grade, score.reasons, score.confidence);
  return (
    <span
      role="img"
      aria-label={explain}
      title={explain}
      className={cn(
        // Middle of the lowercase letters, with a small gap after the name.
        'ms-[6px] inline-block size-1.5 -translate-y-px rounded-full align-middle',
        score.confidence === 'low' && 'opacity-60',
      )}
      style={{ background: GRADE_COLOR[score.grade] }}
    />
  );
}

const LEVEL_COLOR: Record<PortionLevel, string> = {
  good: 'var(--grade-a)',
  hearty: 'var(--grade-c)',
  large: 'var(--grade-d)',
  tooMuch: 'var(--grade-e)',
};

/** How big this serving is against the day: level, plus the budget it uses most once it matters. */
export function PortionScoreLabel({ score }: { score: PortionScore }) {
  const { t } = useI18n();
  const color = LEVEL_COLOR[score.level];
  return (
    <p className="m-0 mt-1 flex items-center gap-1.5 text-xs" role="status">
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
        style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
      >
        <span className="size-1.5 rounded-full" style={{ background: color }} />
        {t(`portion.level.${score.level}` as never)}
      </span>
      {score.level !== 'good' && (
        <span className="text-[var(--neutral-898993)]">
          {t(`portion.driver.${score.driver}` as never, { percent: score.percent })}
        </span>
      )}
    </p>
  );
}
