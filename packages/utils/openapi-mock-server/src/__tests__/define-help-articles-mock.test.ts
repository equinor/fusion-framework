import { mkdtemp, mkdir, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createMockServer, type MockServerHandle } from '../index.js';
import { defineService } from '../discovery/define-service.js';
import { defineHelpArticlesMock } from '../presets/fusion/define-help-articles-mock.js';
import { readHelpArticles } from '../presets/fusion/read-help-articles.js';
import { readHelpFaqs } from '../presets/fusion/read-help-faqs.js';
import { searchHelpDocs } from '../presets/fusion/search-help-docs.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * Builds a help article markdown file with frontmatter.
 *
 * @param frontmatter - YAML frontmatter lines.
 * @param body - Markdown body.
 * @returns File content.
 */
const article = (frontmatter: string, body = '# Body\n'): string =>
  `---\n${frontmatter}\n---\n${body}`;

let docsDir: string;
let server: MockServerHandle | undefined;

beforeEach(async () => {
  docsDir = await mkdtemp(join(tmpdir(), 'help-articles-'));
});

afterEach(async () => {
  await server?.close();
  server = undefined;
  await rm(docsDir, { recursive: true, force: true });
});

/**
 * Starts a mock server serving help articles from {@link docsDir}.
 *
 * @returns The running server origin.
 */
async function startHelpServer(): Promise<string> {
  server = createMockServer().use([defineHelpArticlesMock({ dir: docsDir })]);
  const { url } = await server.start();
  return url;
}

describe('readHelpArticles', () => {
  it('reads article frontmatter and body, sorted by sortOrder then title', async () => {
    await writeFile(
      join(docsDir, 'b.md'),
      article(
        'slug: second\ntitle: Second\nsummary: Two\nsortOrder: 2\nappKey: my-app\nrelevantApps: [other-app]\ntags: [a, b]\ncategory: Guides',
        '\n# Second article\n',
      ),
    );
    await writeFile(join(docsDir, 'a.md'), article('slug: first\ntitle: First\nsortOrder: 1'));

    const articles = await readHelpArticles(docsDir);

    expect(articles.map((entry) => entry.slug)).toEqual(['first', 'second']);
    expect(articles[1]).toMatchObject({
      slug: 'second',
      title: 'Second',
      summary: 'Two',
      sortOrder: 2,
      appKey: 'my-app',
      linkedAppKeys: ['my-app', 'other-app'],
      tags: ['a', 'b'],
      category: 'Guides',
      content: '# Second article\n',
    });
    expect(articles[0]).toMatchObject({ summary: '', tags: [], linkedAppKeys: [] });
    expect(new Date(articles[0]?.lastModified ?? '').getTime()).not.toBeNaN();
  });

  it('prefers an articles subfolder, like the Fusion core apps docs layout', async () => {
    await mkdir(join(docsDir, 'articles'));
    await writeFile(join(docsDir, 'articles', 'nested.md'), article('slug: nested\ntitle: Nested'));
    await writeFile(join(docsDir, 'root.md'), article('slug: root\ntitle: Root'));

    const articles = await readHelpArticles(docsDir);

    expect(articles.map((entry) => entry.slug)).toEqual(['nested']);
  });

  it('ignores markdown that is not an article: a README, an FAQ, or a release note', async () => {
    await writeFile(join(docsDir, 'README.md'), '# Docs\n');
    await writeFile(join(docsDir, 'faq.md'), article('question: Why?\nlinkedArticle: x'));
    await writeFile(join(docsDir, 'notes.txt'), article('slug: txt\ntitle: Not markdown'));
    await writeFile(
      join(docsDir, 'release.md'),
      article('slug: rel-2026-03\ntitle: March update\npublishedDate: 2026-03-18T10:00:00Z'),
    );

    await expect(readHelpArticles(docsDir)).resolves.toEqual([]);
  });

  it('derives the same UUID for a slug on every read', async () => {
    await writeFile(join(docsDir, 'a.md'), article('slug: stable\ntitle: Stable'));

    const [first] = await readHelpArticles(docsDir);
    const [second] = await readHelpArticles(docsDir);

    expect(first?.id).toMatch(UUID_PATTERN);
    expect(second?.id).toBe(first?.id);
  });

  it('reports the file modification time as lastModified', async () => {
    const file = join(docsDir, 'dated.md');
    await writeFile(file, article('slug: dated\ntitle: Dated'));
    const modified = new Date('2026-01-02T03:04:05.000Z');
    await utimes(file, modified, modified);

    const [dated] = await readHelpArticles(docsDir);

    expect(dated?.lastModified).toBe('2026-01-02T03:04:05.000Z');
  });

  it('names the file when frontmatter is malformed', async () => {
    await writeFile(join(docsDir, 'broken.md'), article('slug: [unclosed'));

    await expect(readHelpArticles(docsDir)).rejects.toThrow(/broken\.md/);
  });

  it('rejects when the docs folder does not exist', async () => {
    await expect(readHelpArticles(join(docsDir, 'missing'))).rejects.toThrow();
  });
});

describe('searchHelpDocs', () => {
  it('requires every term and ranks title matches above content matches', async () => {
    await writeFile(
      join(docsDir, 'a.md'),
      article('slug: body\ntitle: Other\nsortOrder: 1', 'Mentions roles here.\n'),
    );
    await writeFile(
      join(docsDir, 'b.md'),
      article('slug: titled\ntitle: Roles guide\nsortOrder: 2'),
    );
    await writeFile(join(docsDir, 'c.md'), article('slug: none\ntitle: Unrelated\nsortOrder: 3'));

    const hits = searchHelpDocs(await readHelpArticles(docsDir), [], 'ROLES');

    expect(hits.map((hit) => hit.slug)).toEqual(['titled', 'body']);
    expect(hits[0]).toMatchObject({ type: 'Article' });
    expect(searchHelpDocs(await readHelpArticles(docsDir), [], 'roles missing-term')).toEqual([]);
  });

  it('returns every article in sort order for an empty query', async () => {
    await writeFile(join(docsDir, 'a.md'), article('slug: a\ntitle: A\nsortOrder: 2'));
    await writeFile(join(docsDir, 'b.md'), article('slug: b\ntitle: B\nsortOrder: 1'));

    const hits = searchHelpDocs(await readHelpArticles(docsDir), [], '  ');

    expect(hits.map((hit) => hit.slug)).toEqual(['b', 'a']);
  });
});

describe('readHelpFaqs', () => {
  it('reads FAQ frontmatter and answer from a faqs subfolder, sorted by sortOrder', async () => {
    await mkdir(join(docsDir, 'faqs'));
    await writeFile(
      join(docsDir, 'faqs', 'b.md'),
      article(
        'slug: faq-access\nquestion: How do I get access?\nsortOrder: 2\nappKey: my-app\nlinkedArticle: get-access\nrelevantAppKeys: [other-app]\ntags: [access]',
        'Request the **role**.\n',
      ),
    );
    await writeFile(
      join(docsDir, 'faqs', 'a.md'),
      article('slug: faq-first\nquestion: First?\nsortOrder: 1'),
    );

    const faqs = await readHelpFaqs(docsDir);

    expect(faqs.map((faq) => faq.slug)).toEqual(['faq-first', 'faq-access']);
    expect(faqs[1]).toMatchObject({
      question: 'How do I get access?',
      answer: 'Request the **role**.\n',
      appKey: 'my-app',
      linkedAppKeys: ['my-app', 'other-app'],
      linkedArticleIdentifier: 'get-access',
      tags: ['access'],
    });
    expect(faqs[1]?.id).toMatch(UUID_PATTERN);
  });

  it('reads FAQs from a flat docs folder and skips articles there', async () => {
    await writeFile(join(docsDir, 'faq.md'), article('slug: faq\nquestion: Why?'));
    await writeFile(join(docsDir, 'article.md'), article('slug: article\ntitle: Article'));

    expect((await readHelpFaqs(docsDir)).map((faq) => faq.slug)).toEqual(['faq']);
    expect((await readHelpArticles(docsDir)).map((entry) => entry.slug)).toEqual(['article']);
  });

  it('gives an FAQ and an article with the same slug different ids', async () => {
    await writeFile(join(docsDir, 'faq.md'), article('slug: shared\nquestion: Why?'));
    await writeFile(join(docsDir, 'article.md'), article('slug: shared\ntitle: Article'));

    const [faq] = await readHelpFaqs(docsDir);
    const [entry] = await readHelpArticles(docsDir);

    expect(faq?.id).not.toBe(entry?.id);
  });
});

describe('defineHelpArticlesMock', () => {
  it('advertises the help service in service discovery', async () => {
    const url = await startHelpServer();

    const discovery = (await (await fetch(`${url}/@fusion-mock/discovery`)).json()) as {
      key: string;
    }[];

    expect(discovery.map((entry) => entry.key)).toContain('help');
  });

  it('returns an article by slug or id, with its content', async () => {
    await writeFile(
      join(docsDir, 'start.md'),
      article('slug: getting-started\ntitle: Getting started\nsummary: Intro', 'Hello **docs**\n'),
    );
    const url = await startHelpServer();

    const response = await fetch(`${url}/help/articles/getting-started`);
    const body = (await response.json()) as { id: string; title: string; content: string };

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ title: 'Getting started', content: 'Hello **docs**\n' });

    const byId = await fetch(`${url}/help/articles/${body.id}`);
    expect(((await byId.json()) as { slug: string }).slug).toBe('getting-started');
  });

  it('returns a not-found error for an unknown slug', async () => {
    const url = await startHelpServer();

    const response = await fetch(`${url}/help/articles/missing-article`);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: { code: 'NotFound', message: 'Help article "missing-article" was not found.' },
    });
  });

  it('serves edits and new files without a restart', async () => {
    const file = join(docsDir, 'live.md');
    await writeFile(file, article('slug: live\ntitle: Before'));
    const url = await startHelpServer();
    await fetch(`${url}/help/articles/live`);

    await writeFile(file, article('slug: live\ntitle: After'));
    await writeFile(join(docsDir, 'added.md'), article('slug: added\ntitle: Added'));

    const edited = (await (await fetch(`${url}/help/articles/live`)).json()) as { title: string };
    const added = await fetch(`${url}/help/articles/added`);
    expect(edited.title).toBe('After');
    expect(added.status).toBe(200);
  });

  it('lists articles in a paged collection, filtered by app for app routes', async () => {
    await writeFile(join(docsDir, 'mine.md'), article('slug: mine\ntitle: Mine\nappKey: my-app'));
    await writeFile(
      join(docsDir, 'theirs.md'),
      article('slug: theirs\ntitle: Theirs\nappKey: other'),
    );
    await writeFile(join(docsDir, 'shared.md'), article('slug: shared\ntitle: Shared'));
    const url = await startHelpServer();

    const all = (await (await fetch(`${url}/help/articles`)).json()) as {
      totalCount: number;
      value: { slug: string }[];
    };
    const app = (await (await fetch(`${url}/help/apps/my-app/articles`)).json()) as {
      value: { slug: string }[];
    };
    const otherAppArticle = await fetch(`${url}/help/apps/my-app/articles/theirs`);

    expect(all.totalCount).toBe(3);
    expect(app.value.map((entry) => entry.slug).sort()).toEqual(['mine', 'shared']);
    expect(otherAppArticle.status).toBe(404);
  });

  it('searches articles with POST /search like the Help API', async () => {
    await writeFile(
      join(docsDir, 'a.md'),
      article('slug: access\ntitle: Get access\ntags: [roles]'),
    );
    await writeFile(join(docsDir, 'b.md'), article('slug: other\ntitle: Other'));
    const url = await startHelpServer();

    const response = await fetch(`${url}/help/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ search: 'roles', count: true, filter: "type eq 'article'" }),
    });
    const body = (await response.json()) as { '@odata.count': number; value: { slug: string }[] };

    expect(response.status).toBe(200);
    expect(body['@odata.count']).toBe(1);
    expect(body.value.map((hit) => hit.slug)).toEqual(['access']);
  });

  it('serves FAQs by slug, app, and in lists', async () => {
    await mkdir(join(docsDir, 'faqs'));
    await writeFile(
      join(docsDir, 'faqs', 'mine.md'),
      article('slug: mine\nquestion: Mine?\nappKey: my-app', 'Yes.\n'),
    );
    await writeFile(
      join(docsDir, 'faqs', 'theirs.md'),
      article('slug: theirs\nquestion: Theirs?\nappKey: other'),
    );
    const url = await startHelpServer();

    const faq = (await (await fetch(`${url}/help/faqs/mine`)).json()) as { answer: string };
    const all = (await (await fetch(`${url}/help/faqs`)).json()) as { totalCount: number };
    const app = (await (await fetch(`${url}/help/apps/my-app/faqs`)).json()) as {
      value: { slug: string }[];
    };
    const missing = await fetch(`${url}/help/faqs/nope`);
    const otherApp = await fetch(`${url}/help/apps/my-app/faqs/theirs`);

    expect(faq.answer).toBe('Yes.\n');
    expect(all.totalCount).toBe(2);
    expect(app.value.map((entry) => entry.slug)).toEqual(['mine']);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({
      error: { code: 'NotFound', message: 'Help FAQ "nope" was not found.' },
    });
    expect(otherApp.status).toBe(404);
  });

  it('includes FAQs in search results with type faq', async () => {
    await mkdir(join(docsDir, 'faqs'));
    await writeFile(
      join(docsDir, 'faqs', 'roles.md'),
      article('slug: faq-roles\nquestion: Which roles exist?'),
    );
    await writeFile(
      join(docsDir, 'guide.md'),
      article('slug: guide\ntitle: Guide', 'Mentions roles.\n'),
    );
    const url = await startHelpServer();

    const response = await fetch(`${url}/help/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ search: 'roles' }),
    });
    const body = (await response.json()) as { value: { slug: string; type: string }[] };

    expect(body.value.map((hit) => [hit.type, hit.slug])).toEqual([
      ['FAQ', 'faq-roles'],
      ['Article', 'guide'],
    ]);
  });

  it('keeps serving local docs under a merge layer that adds middleware', async () => {
    await writeFile(join(docsDir, 'a.md'), article('slug: guide\ntitle: Guide'));
    server = createMockServer()
      .use([defineHelpArticlesMock({ dir: docsDir })])
      .use([
        defineService({
          key: 'help',
          serviceDiscovery: 'merge',
          middleware: (router) => {
            router.get('/custom', (_req, res) => res.json({ custom: true }));
            router.get('/articles/pinned', (_req, res) => res.json({ slug: 'pinned' }));
          },
        }),
      ]);
    const { url } = await server.start();

    const guide = (await (await fetch(`${url}/help/articles/guide`)).json()) as { title: string };
    const missing = await fetch(`${url}/help/articles/nope`);
    const custom = await (await fetch(`${url}/help/custom`)).json();
    const pinned = await (await fetch(`${url}/help/articles/pinned`)).json();

    expect(guide.title).toBe('Guide');
    expect(missing.status).toBe(404);
    expect(custom).toEqual({ custom: true });
    expect(pinned).toEqual({ slug: 'pinned' });
  });

  it('serves under a custom service key', async () => {
    await writeFile(join(docsDir, 'a.md'), article('slug: a\ntitle: A'));
    server = createMockServer().use([defineHelpArticlesMock({ dir: docsDir, key: 'help-docs' })]);
    const { url } = await server.start();

    const response = await fetch(`${url}/help-docs/articles/a`);

    expect(response.status).toBe(200);
  });

  it('surfaces malformed frontmatter as a server error naming the file', async () => {
    await writeFile(join(docsDir, 'broken.md'), article('slug: [unclosed'));
    const url = await startHelpServer();

    const response = await fetch(`${url}/help/articles/anything`);

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).toContain('broken.md');
  });
});
