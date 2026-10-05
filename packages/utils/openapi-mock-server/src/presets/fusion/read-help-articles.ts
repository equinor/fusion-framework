import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import { createHelpDocId } from './create-help-doc-id.js';
import { readMarkdownDocs } from './read-markdown-docs.js';
import { toStringList } from './to-string-list.js';

/**
 * One help article as served by the mock `help` service — the subset of the
 * Fusion Help API's `ApiArticle` that a local markdown file can provide.
 */
export interface HelpArticle {
  /** Deterministic UUID derived from {@link HelpArticle.slug}, stable across requests and restarts. */
  id: string;
  /** Article identifier used by `useHelpCenter().openArticle(slug)` and the help API routes. */
  slug: string;
  /** Article title from frontmatter. */
  title: string;
  /** Short article summary from frontmatter; empty when omitted. */
  summary: string;
  /** Ordering weight from frontmatter; `0` when omitted. */
  sortOrder: number;
  /** Owning application key from frontmatter, when set. */
  appKey?: string;
  /** Owning `appKey` plus any `relevantApps` / `relevantAppKeys` from frontmatter. */
  linkedAppKeys: string[];
  /** Tags from frontmatter. */
  tags: string[];
  /** Optional article category from frontmatter. */
  category?: string;
  /** Markdown body of the file, with the frontmatter block removed. */
  content: string;
  /** ISO timestamp of the file's last modification, standing in for the Help API's `lastModified`. */
  lastModified: string;
}

/**
 * Resolves the folder that holds article markdown files for a help docs folder.
 *
 * The Fusion core apps keep articles in `<docs>/<appKey>/articles`, next to `faqs/` and
 * `releasenotes/`, so an `articles` subfolder wins over the folder itself.
 *
 * @param dir - Help docs folder, or the articles folder itself.
 * @returns `<dir>/articles` when it exists, otherwise `dir`.
 */
async function resolveHelpArticlesDir(dir: string): Promise<string> {
  const articlesDir = join(dir, 'articles');
  const stats = await stat(articlesDir).catch(() => undefined);
  return stats?.isDirectory() ? articlesDir : dir;
}

/**
 * Reads every help article in a help docs folder, the same files `fhelp` syncs to production.
 *
 * Reads from disk on every call, so edits and new files show up without restarting. Scans
 * `*.md` files non-recursively (like `fhelp`), in `<dir>/articles` when that subfolder exists,
 * and ignores markdown without `slug` + `title` frontmatter (READMEs, FAQs) and release notes
 * (which have `publishedDate`). When
 * two files share a slug, the first in file-name order wins.
 *
 * @param dir - Help docs folder (e.g. `docs/my-app`) or its `articles` folder.
 * @returns Articles sorted by `sortOrder`, then title.
 * @throws {Error} When the folder cannot be read, or an article has malformed frontmatter.
 *
 * @example
 * ```typescript
 * const articles = await readHelpArticles('./docs');
 * console.log(articles.map((article) => article.slug));
 * ```
 */
export async function readHelpArticles(dir: string): Promise<HelpArticle[]> {
  const docs = await readMarkdownDocs(await resolveHelpArticlesDir(dir));

  const bySlug = new Map<string, HelpArticle>();
  // Keep the first file per slug so lookups stay deterministic when slugs collide.
  for (const { fields, body, lastModified } of docs) {
    const slug = typeof fields.slug === 'string' ? fields.slug.trim() : '';
    const title = typeof fields.title === 'string' ? fields.title.trim() : '';
    // Without both identity fields the panel could neither look up nor title the article.
    if (!slug || !title || bySlug.has(slug)) continue;
    // fhelp release notes also carry slug and title; their publishedDate tells them apart.
    if (fields.publishedDate !== undefined) continue;

    const appKey = typeof fields.appKey === 'string' && fields.appKey ? fields.appKey : undefined;
    const sortOrder = Number(fields.sortOrder);
    // The owning app and relevant apps are both linked; a Set drops an app listed twice.
    const linkedAppKeys = [
      ...new Set([
        ...(appKey ? [appKey] : []),
        ...toStringList(fields.relevantApps),
        ...toStringList(fields.relevantAppKeys),
      ]),
    ];

    bySlug.set(slug, {
      id: createHelpDocId('article', slug),
      slug,
      title,
      summary: typeof fields.summary === 'string' ? fields.summary : '',
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      appKey,
      linkedAppKeys,
      tags: toStringList(fields.tags),
      category:
        typeof fields.category === 'string' && fields.category ? fields.category : undefined,
      content: body,
      lastModified: lastModified.toISOString(),
    });
  }

  return [...bySlug.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
  );
}

export default readHelpArticles;
