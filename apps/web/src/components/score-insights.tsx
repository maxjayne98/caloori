'use client';
import type {
  Confidence,
  DayReason,
  ExtraNutrientKey,
  ExtraNutrientTotal,
  Grade,
  ScoreReason,
  Suggestion,
} from '@nourish/core';
import { portionNumber } from '@nourish/core';
import { Button } from '@nourish/ui';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { GradeMark } from '@/components/score-badge';
import { ExtraNutrientTotals } from '@/components/extra-nutrients';
import { useI18n } from '@/providers/i18n-provider';

type Insight = {
  grade: Grade;
  score: number;
  reasons: readonly (ScoreReason | DayReason)[];
  confidence: Confidence;
};

/** Day score, nutrient references, food suggestions and an assistant hand-off. */
export function ScoreInsights({
  insight,
  suggestions,
  extras,
  dailyCalories,
  onLog,
  onAsk,
}: {
  insight: Insight;
  suggestions: readonly Suggestion<Suggestion['food'] & { serving?: string }>[];
  extras?: Record<ExtraNutrientKey, ExtraNutrientTotal>;
  dailyCalories?: number;
  onLog: (suggestion: Suggestion) => void;
  onAsk: () => void;
}) {
  const { t } = useI18n();
  const reasons = insight.reasons.map((reason) => t(`score.reason.${reason}` as never));
  const calories = dailyCalories && dailyCalories > 0 ? dailyCalories : 2000;
  return (
    <div className="score-insights">
      <section className="score-insights-hero">
        <GradeMark {...insight} size="2xl" />
        <strong className="score-insights-hero-title">{t('insights.scoreHeading')}</strong>
        {reasons.length > 0 && (
          <ul className="score-insights-reasons" aria-label={t('insights.scoreHighlights')}>
            {reasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        )}
      </section>
      {extras && (
        <ExtraNutrientTotals
          totals={extras}
          dailyCalories={calories}
          referenceNote={t('nutrients.referenceNote')}
        />
      )}

      <section className="score-insights-suggestions">
        <div className="score-insights-section-heading">
          <div>
            <strong>{t('insights.tryAdding')}</strong>
          </div>
          {suggestions.length > 0 && (
            <span className="score-insights-count">{suggestions.length}</span>
          )}
        </div>
        {suggestions.length ? (
          <div className="score-insights-suggestion-list">
            {suggestions.map((suggestion) => (
              <div key={suggestion.food.id} className="score-insights-suggestion">
                <span className="score-insights-suggestion-copy">
                  <b>{suggestion.food.name}</b>
                  <small>
                    {portionNumber(suggestion.qty)} × {suggestion.food.serving} ·{' '}
                    {Math.round(suggestion.food.cal * suggestion.qty)} {t('common.kcal')}
                  </small>
                </span>
                <span className="score-insights-score-gain">
                  +{suggestion.after - suggestion.before}
                </span>
                <Button
                  variant="unstyled"
                  className="plus score-insights-add"
                  aria-label={t('insights.log', { name: suggestion.food.name })}
                  onClick={() => onLog(suggestion)}
                >
                  +
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="score-insights-empty">{t('insights.noRoom')}</p>
        )}
      </section>

      <Button variant="unstyled" className="link score-insights-assistant" onClick={onAsk}>
        <Sparkles size={16} aria-hidden="true" />
        {t('insights.askAssistant')}
        <ArrowUpRight size={15} aria-hidden="true" />
      </Button>
    </div>
  );
}
