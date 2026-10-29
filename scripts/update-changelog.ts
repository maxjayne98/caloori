import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const versionFile = 'packages/core/src/version.ts';
const changelogFile = 'CHANGELOG.md';

function git(...args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8' });
}

const history = git('log', '--reverse', '--format=%H%x1f%s%x1f%b%x1e')
  .split('\x1e')
  .map((record) => record.trim())
  .filter(Boolean)
  .map((record) => {
    const [hash, subject, ...body] = record.split('\x1f');
    return { hash, subject, body: body.join('\x1f').trim() };
  });

const versionCommits = new Set(
  git('log', '--reverse', '--format=%H', '--', versionFile).trim().split('\n'),
);
const grouped = new Map<string, typeof history>();
let currentVersion: string | undefined;

for (const commit of history) {
  if (versionCommits.has(commit.hash)) {
    const source = git('show', `${commit.hash}:${versionFile}`);
    const match = source.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (!match) {
      throw new Error(`Could not read APP_VERSION from ${commit.hash}:${versionFile}`);
    }
    currentVersion = match[1];
  }
  const version = currentVersion ?? 'Before version tracking';
  const commits = grouped.get(version) ?? [];
  commits.push(commit);
  grouped.set(version, commits);
}

const sections = [...grouped.entries()].reverse().map(([version, commits]) => {
  const entries = commits
    .reverse()
    .map(({ hash, subject, body }) => {
      const detail = body
        ? `\n${body
            .split('\n')
            .map((line) => `  ${line}`)
            .join('\n')}`
        : '';
      return `- \`${hash.slice(0, 7)}\` ${subject}${detail}`;
    })
    .join('\n');
  return `## ${version}\n\n${entries}`;
});

const changelog = `# Changelog\n\nGenerated from Git history by the post-commit hook. Entries are grouped by the app version recorded in each commit.\n\n${sections.join('\n\n')}\n`;
writeFileSync(changelogFile, changelog);
