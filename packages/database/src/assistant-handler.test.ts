import test from 'node:test';
import assert from 'node:assert/strict';
import { assistantContext, emptyState } from '@nourish/core';
import { createAssistantHandler } from '../supabase/functions/nourish-assistant/handler';
const env: Record<string, string> = {
  SUPABASE_URL: 'https://db.example',
  SUPABASE_ANON_KEY: 'public',
  GEMINI_API_KEY: 'server-only-secret',
};
function req(
  body: unknown = assistantContext(
    emptyState(),
    [{ role: 'user', text: 'Add cooked beans' }],
    '2026-10-27',
  ),
  auth = true,
  origin = 'http://localhost:5174',
) {
  return new Request('https://db.example/functions/v1/nourish-assistant', {
    method: 'POST',
    headers: {
      origin,
      ...(auth ? { authorization: 'Bearer user-token' } : {}),
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
function setup(
  options: {
    key?: boolean;
    authenticated?: boolean;
    quota?: boolean;
    output?: string;
    status?: number;
  } = {},
) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fake = (async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    if (String(url).endsWith('/auth/v1/user'))
      return Response.json({ id: 'a' }, { status: options.authenticated === false ? 401 : 200 });
    if (String(url).includes('/rpc/')) return Response.json(options.quota !== false);
    return Response.json(
      {
        candidates: [
          {
            content: {
              parts: [
                {
                  text:
                    options.output ??
                    JSON.stringify({ reply: 'What serving would you like?', actions: [] }),
                },
              ],
            },
          },
        ],
      },
      { status: options.status ?? 200 },
    );
  }) as typeof fetch;
  return {
    calls,
    handler: createAssistantHandler(
      (k) => (options.key === false && k === 'GEMINI_API_KEY' ? undefined : env[k]),
      fake,
    ),
  };
}
test('unauthenticated and disallowed origins never reach Gemini', async () => {
  const x = setup();
  assert.equal((await x.handler(req(undefined, false))).status, 401);
  assert.equal(x.calls.length, 0);
  assert.equal((await x.handler(req(undefined, true, 'https://evil.example'))).status, 403);
  assert.equal(x.calls.length, 0);
  const y = setup({ authenticated: false });
  assert.equal((await y.handler(req())).status, 401);
  assert.equal(y.calls.length, 1);
});
test('missing key has a helpful setup response and sends no prompt to Google', async () => {
  const x = setup({ key: false });
  const r = await x.handler(req());
  assert.equal(r.status, 503);
  assert.match((await r.json()).message, /API key/);
  assert.equal(x.calls.length, 1);
});
test('validation and persisted quota prevent model requests', async () => {
  const x = setup();
  assert.equal((await x.handler(req({ messages: [] }))).status, 400);
  assert.equal(x.calls.length, 1);
  const y = setup({ quota: false });
  assert.equal((await y.handler(req())).status, 429);
  assert.equal(y.calls.length, 2);
});
test('authenticated requests use structured output and keep the key out of browser responses', async () => {
  const x = setup();
  const r = await x.handler(req());
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('cache-control'), 'no-store');
  const text = await r.text();
  assert.ok(!text.includes(env.GEMINI_API_KEY));
  assert.equal(JSON.parse(text).actions.length, 0);
  assert.ok(x.calls[2].url.includes('gemini-3.5-flash-lite:generateContent'));
  assert.equal(
    (x.calls[2].init!.headers as Record<string, string>)['x-goog-api-key'],
    env.GEMINI_API_KEY,
  );
  const body = JSON.parse(String(x.calls[2].init!.body));
  assert.ok(body.generationConfig.responseFormat.text.schema);
  assert.equal(body.tools, undefined);
});
test('malformed model output and provider quota errors do not return actions', async () => {
  const x = setup({ output: 'not json' });
  assert.equal((await x.handler(req())).status, 502);
  const y = setup({ status: 429 });
  assert.equal((await y.handler(req())).status, 429);
});
test('CORS preflight is limited to configured app origins', async () => {
  const x = setup();
  const r = await x.handler(
    new Request('https://db.example', {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:5174' },
    }),
  );
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('access-control-allow-origin'), 'http://localhost:5174');
  assert.equal(x.calls.length, 0);
});

test('malformed messages and oversized bodies fail before model use', async () => {
  const x = setup();
  const body = assistantContext(emptyState(), [{ role: 'user', text: 'Hello' }], '2026-10-27');
  assert.equal((await x.handler(req({ ...body, messages: [null] }))).status, 400);
  assert.equal(
    (await x.handler(req({ ...body, messages: [{ role: 'user', text: 'x'.repeat(6001) }] })))
      .status,
    400,
  );
  assert.equal((await x.handler(req({ ...body, extra: 'x'.repeat(260000) }))).status, 413);
  assert.ok(x.calls.every((c) => c.url.endsWith('/auth/v1/user')));
});
