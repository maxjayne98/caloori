import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

// Next's static bootstrap needs inline scripts. Authorize exact build hashes, not arbitrary inline JS.
async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? htmlFiles(join(directory, entry.name))
    : entry.name.endsWith('.html') ? [join(directory, entry.name)] : []));
  return nested.flat();
}
const hashes = new Set();
for (const file of await htmlFiles('out')) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(match[1]) || !match[2].trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`);
  }
}
if (!hashes.size) throw new Error('No Next bootstrap hashes found; inspect export before publishing.');
const base = await readFile('public/_headers', 'utf8');
const headers = base.replace("script-src 'self';", `script-src 'self' ${[...hashes].join(' ')};`);
if (headers.split('\n').some((line) => line.length > 2000)) throw new Error('Cloudflare header exceeds 2000 characters.');
await writeFile('out/_headers', headers);
console.log(`Static export secured with ${hashes.size} inline script hashes.`);
