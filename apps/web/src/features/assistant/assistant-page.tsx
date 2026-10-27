'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check } from 'lucide-react';
import { Button } from '@nourish/ui';
import {
  foods,
  AppStateSchema,
  assistantContext,
  parseAssistantProposal,
  applyAssistantProposal,
  type AssistantProposal,
  type AssistantMessage,
} from '@nourish/core';
import { useNourishData } from '@/providers/data-provider';
import { HeartLoader } from '@/components/heart-loader';
import { NourishCompanion } from '@/components/nourish-companion';
export function AssistantPage({ day }: { day: string }) {
  const data = useNourishData();
  const [messages, setMessages] = useState<AssistantMessage[]>([]),
    [input, setInput] = useState(''),
    [busy, setBusy] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(''),
    [pending, setPending] = useState<{ proposal: AssistantProposal; baseline: string } | null>(
      null,
    ),
    [saved, setSaved] = useState('');
  const bottom = useRef<HTMLDivElement>(null),
    alive = useRef(true),
    latest = useRef(data);
  latest.current = data;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [messages, busy, pending]);
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (busy || saving || !input.trim()) return;
    if (!data.askAssistant) {
      setError('Connect your cloud account to use the assistant.');
      return;
    }
    const outgoing: AssistantMessage[] = [...messages, { role: 'user', text: input.trim() }];
    setMessages(outgoing);
    setInput('');
    setBusy(true);
    setError('');
    setSaved('');
    setPending(null);
    const state = AppStateSchema.parse(data),
      baseline = JSON.stringify(state);
    try {
      const proposal = parseAssistantProposal(
        await data.askAssistant(assistantContext(state, outgoing, day)),
      );
      // Resolve every proposed action against the current library before offering a confirmation.
      applyAssistantProposal(state, proposal);
      if (!alive.current) return;
      setMessages([...outgoing, { role: 'assistant', text: proposal.reply }]);
      if (proposal.actions.length) setPending({ proposal, baseline });
    } catch (e) {
      if (alive.current) setError(e instanceof Error ? e.message : 'Could not send your message.');
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  async function confirm() {
    if (!pending || saving) return;
    setSaving(true);
    setError('');
    try {
      await latest.current.applyAssistant(pending.proposal, pending.baseline);
      if (alive.current) {
        setPending(null);
        setSaved(
          data.repositoryKind === 'supabase' ? 'Saved to your account.' : 'Saved on this device.',
        );
      }
    } catch (e) {
      if (alive.current)
        setError(e instanceof Error ? e.message : 'Could not save. Nothing was changed.');
    } finally {
      if (alive.current) setSaving(false);
    }
  }
  return (
    <section className="assistant-page" aria-labelledby="assistant-title">
      <div className="intro">
        <h1 id="assistant-title">A little help.</h1>
        <p>Good food. Goals that feel like you.</p>
      </div>
      <div className="assistant-thread" aria-label="Conversation" aria-busy={busy}>
        {!messages.length && (
          <div className="assistant-welcome">
            <NourishCompanion />
            <div className="assistant-prompts">
              {[
                'Add cooked red kidney beans to my food library',
                'Log 2 eggs for breakfast',
                'Help me review my daily goals',
              ].map((x) => (
                <Button variant="unstyled" key={x} onClick={() => setInput(x)}>
                  {x}
                  <ArrowUp size={14} />
                </Button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={'chat-message ' + m.role}>
            <small>{m.role === 'user' ? 'You' : 'Nourish'}</small>
            <p>{m.text}</p>
          </div>
        ))}
        {busy && <HeartLoader inline label="Thinking it through…" />}
        {pending && (
          <section className="assistant-review" aria-label="Review changes">
            <h2>Ready when you are</h2>
            <p>Review before saving. Nothing has changed yet.</p>
            {pending.proposal.actions.map((a, i) => (
              <div className="assistant-action" key={i}>
                {a.type === 'create_food' ? (
                  <>
                    <b>Add {a.food.name}</b>
                    <span>
                      {a.food.serving} · {a.food.cal} kcal
                    </span>
                    <span>
                      Protein {a.food.p} g · Carbs {a.food.c} g · Fat {a.food.f} g
                    </span>
                    <small>
                      {a.food.estimated
                        ? 'Estimated nutrition · check against the label'
                        : 'Based on the details you provided'}
                    </small>
                  </>
                ) : a.type === 'log_food' ? (
                  <>
                    <b>
                      Log{' '}
                      {[...data.custom, ...foods].find((f) => f.id === a.foodId)?.name || 'food'}
                    </b>
                    <span>
                      {a.quantity} × serving · {a.meal} · {a.date}
                    </span>
                  </>
                ) : (
                  <>
                    <b>Update your goals</b>
                    <span>{a.goals.goal || 'No weight goal set'}</span>
                    <span>
                      {a.goals.cal ?? '—'} kcal/day · Protein {a.goals.p ?? '—'} g
                    </span>
                    <span>
                      Carbs {a.goals.c ?? '—'} g · Fat {a.goals.f ?? '—'} g
                    </span>
                  </>
                )}
              </div>
            ))}
            <Button variant="unstyled" className="primary" disabled={saving} onClick={confirm}>
              {saving ? <HeartLoader inline label="Saving changes…" /> : 'Confirm & save'}
            </Button>
            <Button
              variant="unstyled"
              className="secondary"
              disabled={saving}
              onClick={() => setPending(null)}
            >
              Dismiss
            </Button>
          </section>
        )}
        {saved && (
          <p className="assistant-saved" role="status">
            <Check size={16} />
            {saved}
          </p>
        )}
        {error && (
          <p className="assistant-error" role="alert">
            {error}
          </p>
        )}
        <div ref={bottom} />
      </div>
      <form className="assistant-composer" onSubmit={send}>
        <label className="sr-only" htmlFor="assistant-message">
          Message Nourish
        </label>
        <textarea
          id="assistant-message"
          placeholder="Ask Nourish…"
          rows={2}
          maxLength={2000}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={saving}
        />
        <Button
          variant="unstyled"
          aria-label="Send message"
          disabled={busy || saving || !input.trim()}
        >
          <ArrowUp size={20} />
        </Button>
      </form>
      <p className="assistant-privacy">
        Messages, current goals and a food-library excerpt are sent to Gemini when you send. AI
        nutrition may be approximate. Conversations stay in this session.
      </p>
    </section>
  );
}
