'use client';
import type { Confidence, DayReason, Grade, ScoreReason, Suggestion } from '@nourish/core';
import { portionNumber } from '@nourish/core';
import { Button } from '@nourish/ui';
import { Plus, Sparkles } from 'lucide-react';
import { GradeMark } from '@/components/score-badge';
import { useI18n } from '@/providers/i18n-provider';

type Insight = {
  grade: Grade;
  score: number;
  reasons: readonly (ScoreReason | DayReason)[];
  confidence: Confidence;
};

/**
 * Minimal "how to improve" sheet: the score with its reasons in words, up to three foods that
 * raise today's score (logged with one tap), and a hand-off to the assistant.
 */
export function ScoreInsights({
  insight,
  suggestions,
  onLog,
  onAsk,
}: {
  insight: Insight;
  suggestions: readonly Suggestion<Suggestion['food'] & { serving?: string }>[];
  onLog: (suggestion: Suggestion) => void;
  onAsk: () => void;
}) {
  const { t } = useI18n();
  const reasons = insight.reasons.map((reason) => t(`score.reason.${reason}` as never));
  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3">
        <b className="text-4xl font-bold tabular-nums leading-none">{insight.score}</b>
        <GradeMark
          grade={insight.grade}
          reasons={insight.reasons}
          confidence={insight.confidence}
        />
      </div>
      {reasons.length > 0 && (
        <p className="m-0 -mt-3 text-sm text-[var(--neutral-85858b)]">{reasons.join(' · ')}</p>
      )}

      <div className="grid gap-1">
        <span className="text-xs font-semibold text-[var(--neutral-85858b)]">
          {t('insights.tryAdding')}
        </span>
        {suggestions.length ? (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.food.id}
              className="flex items-center gap-3 border-b border-[var(--neutral-f0f0f4)] py-2.5 last:border-b-0"
            >
              <span className="grid min-w-0 flex-1 gap-0.5">
                <b className="truncate text-sm font-semibold">{suggestion.food.name}</b>
                <small className="text-xs text-[var(--neutral-85858b)]">
                  {portionNumber(suggestion.qty)} × {suggestion.food.serving} ·{' '}
                  {Math.round(suggestion.food.cal * suggestion.qty)} {t('common.kcal')}
                </small>
              </span>
              <span className="text-sm font-semibold tabular-nums text-[var(--grade-a)]">
                +{suggestion.after - suggestion.before}
              </span>
              <Button
                variant="unstyled"
                className="grid size-8 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]"
                aria-label={t('insights.log', { name: suggestion.food.name })}
                onClick={() => onLog(suggestion)}
              >
                <Plus size={16} aria-hidden="true" />
              </Button>
            </div>
          ))
        ) : (
          <p className="m-0 py-2 text-sm text-[var(--neutral-85858b)]">{t('insights.noRoom')}</p>
        )}
      </div>

      <Button
        variant="unstyled"
        className="inline-flex items-center justify-center gap-1.5 justify-self-center text-sm font-semibold text-[var(--accent-text)]"
        onClick={onAsk}
      >
        <Sparkles size={15} aria-hidden="true" />
        {t('insights.askAssistant')}
      </Button>
    </div>
  );
}
