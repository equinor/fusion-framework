import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveHelpDocs } from '../resolve-help-docs.js';

/** Help article frontmatter the resolver counts as an article. */
const ARTICLE = '---\nslug: getting-started\ntitle: Getting started\n---\n# Hello\n';

let repoRoot: string;
let appRoot: string;

/**
 * Writes a file, creating parent folders first.
 *
 * @param path - File path.
 * @param content - File content.
 */
async function write(path: string, content: string): Promise<void> {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, content);
}

beforeEach(async () => {
  // Mirror the Fusion core apps layout: <repo>/apps/<app> with docs at <repo>/docs/<appKey>.
  repoRoot = await mkdtemp(join(tmpdir(), 'help-docs-repo-'));
  appRoot = join(repoRoot, 'apps', 'my-app');
  await mkdir(join(repoRoot, '.git'), { recursive: true });
  await write(join(appRoot, 'package.json'), JSON.stringify({ name: '@equinor/app-admin' }));
});

afterEach(async () => {
  await rm(repoRoot, { recursive: true, force: true });
});

describe('resolveHelpDocs', () => {
  it('returns undefined when nothing is configured or detected', async () => {
    await expect(resolveHelpDocs(appRoot)).resolves.toBeUndefined();
  });

  it('detects ./docs/articles in the project', async () => {
    await write(join(appRoot, 'docs', 'articles', 'start.md'), ARTICLE);

    await expect(resolveHelpDocs(appRoot)).resolves.toEqual({
      dir: join(appRoot, 'docs'),
      articleCount: 1,
      faqCount: 0,
      source: 'detected',
    });
  });

  it('detects docs/<appKey> in a parent folder, using the unscoped package name', async () => {
    await write(join(repoRoot, 'docs', 'app-admin', 'articles', 'start.md'), ARTICLE);

    await expect(resolveHelpDocs(appRoot)).resolves.toMatchObject({
      dir: join(repoRoot, 'docs', 'app-admin'),
      source: 'detected',
    });
  });

  it('skips a detected docs folder that holds no help articles', async () => {
    await write(join(appRoot, 'docs', 'README.md'), '# Project docs\n');
    await write(join(repoRoot, 'docs', 'app-admin', 'start.md'), ARTICLE);

    await expect(resolveHelpDocs(appRoot)).resolves.toMatchObject({
      dir: join(repoRoot, 'docs', 'app-admin'),
    });
  });

  it('does not search above the repository root', async () => {
    // A nearer repository marker makes <repoRoot>/docs fall outside the searched range.
    await mkdir(join(repoRoot, 'apps', '.git'), { recursive: true });
    await write(join(repoRoot, 'docs', 'app-admin', 'start.md'), ARTICLE);

    await expect(resolveHelpDocs(appRoot)).resolves.toBeUndefined();
  });

  it('detects a docs folder that only holds FAQs', async () => {
    await write(
      join(appRoot, 'docs', 'faqs', 'access.md'),
      '---\nslug: faq-access\nquestion: How do I get access?\n---\nAsk.\n',
    );

    await expect(resolveHelpDocs(appRoot)).resolves.toEqual({
      dir: join(appRoot, 'docs'),
      articleCount: 0,
      faqCount: 1,
      source: 'detected',
    });
  });

  it('skips an unreadable detected folder with a warning and keeps searching', async () => {
    await write(join(appRoot, 'docs', 'broken.md'), '---\nslug: [unclosed\n---\nBody\n');
    await write(join(repoRoot, 'docs', 'app-admin', 'articles', 'start.md'), ARTICLE);
    const warnings: string[] = [];

    await expect(
      resolveHelpDocs(appRoot, { warn: (message) => warnings.push(message) }),
    ).resolves.toMatchObject({ dir: join(repoRoot, 'docs', 'app-admin'), source: 'detected' });
    expect(warnings).toEqual([expect.stringContaining('broken.md')]);
  });

  it('still fails for a configured folder with malformed frontmatter', async () => {
    await write(join(appRoot, 'help', 'broken.md'), '---\nslug: [unclosed\n---\nBody\n');

    await expect(resolveHelpDocs(appRoot, { config: 'help' })).rejects.toThrow(/broken\.md/);
  });

  it('resolves a configured sibling folder relative to the project root', async () => {
    await write(join(repoRoot, 'docs', 'custom', 'start.md'), ARTICLE);

    await expect(resolveHelpDocs(appRoot, { config: '../../docs/custom' })).resolves.toEqual({
      dir: join(repoRoot, 'docs', 'custom'),
      articleCount: 1,
      faqCount: 0,
      source: 'config',
    });
  });

  it('serves a configured folder even before it has articles', async () => {
    await mkdir(join(appRoot, 'help'), { recursive: true });

    await expect(resolveHelpDocs(appRoot, { config: 'help' })).resolves.toMatchObject({
      articleCount: 0,
      faqCount: 0,
      source: 'config',
    });
  });

  it('prefers the command-line option over config and plugin defaults', async () => {
    await mkdir(join(appRoot, 'flag'), { recursive: true });

    await expect(
      resolveHelpDocs(appRoot, { option: 'flag', config: 'config', defaults: 'plugin' }),
    ).resolves.toMatchObject({ dir: join(appRoot, 'flag'), source: 'option' });
  });

  it('turns help docs off with false, even when articles exist', async () => {
    await write(join(appRoot, 'docs', 'start.md'), ARTICLE);

    await expect(resolveHelpDocs(appRoot, { config: false })).resolves.toBeUndefined();
    await expect(
      resolveHelpDocs(appRoot, { option: false, config: 'docs' }),
    ).resolves.toBeUndefined();
  });

  it('throws a message naming the setting when a configured folder is missing', async () => {
    await expect(resolveHelpDocs(appRoot, { option: 'missing' })).rejects.toThrow(/--help-docs/);
    await expect(resolveHelpDocs(appRoot, { config: 'missing' })).rejects.toThrow(
      /mockServer\.helpDocs/,
    );
  });
});
