import { createAssistantHandler } from './handler.ts';
Deno.serve(createAssistantHandler((key) => Deno.env.get(key)));
