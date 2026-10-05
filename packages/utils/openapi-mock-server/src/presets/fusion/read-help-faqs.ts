import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import { createHelpDocId } from './create-help-doc-id.js';
import { readMarkdownDocs } from './read-markdown-docs.js';
import { toStringList } from './to-string-list.js';

/**
 * One FAQ as served by the mock `help` service — the subset of the Fusion Help API's `ApiFaq`
 * that a local markdown file can provide.
 */
export interface HelpFaq {
  /** Deterministic UUID derived from {@link HelpFaq.slug}, stable across requests and restarts. */
  id: string;
  /** FAQ identifier used by the help API routes. */
  slug: string;
  /** The question, from frontmatter. */
  question: string;
  /** Markdown answer: the body of the file. */
  answer: string;
  /** Ordering weight from frontmatter; `0` when omitted. */
  sortOrder: number;
  /** Owning application key from frontmatter, when set. */
  appKey?: string;
  /** Owning `appKey` plus any `relevantAppKeys` / `relevantApps` from frontmatter. */
  linkedAppKeys: string[];
  /** Tags from frontmatter. */
  tags: string[];
  /** Slug of the article that explains the answer in depth (`linkedArticle` frontmatter). */
  linkedArticleIdentifier?: string;
  /** ISO timestamp of the file's last modification, standing in for the Help API's `lastModified`. */
  lastModified: string;
}

/**
 * Resolves the folder that holds FAQ markdown files for a help docs folder: `<dir>/faqs` (the
 * Fusion core apps layout, next to `articles/`), otherwise the folder itself.
 *
 * @param dir - Help docs folder, or the FAQs folder itself.
 * @returns `<dir>/faqs` when it exists, otherwise `dir`.
 */
async function resolveHelpFaqsDir(dir: string): Promise<string> {
  const faqsDir = join(dir, 'faqs');
  const stats = await stat(faqsDir).catch(() => undefined);
  return stats?.isDirectory() ? faqsDir : dir;
}

/**
 * Reads every FAQ in a help docs folder, the same files `fhelp` syncs to production.
 *
 * Reads from disk on every call, so edits show up without restarting. Scans `*.md` files
 * non-recursively in `<dir>/faqs` when that subfolder exists, otherwise in `dir`, and keeps files
 * with `slug` + `question` frontmatter; the file body is the answer. When two files share a slug,
 * the first in file-name order wins.
 *
 * @param dir - Help docs folder (e.g. `docs/my-app`) or its `faqs` folder.
 * @returns FAQs sorted by `sortOrder`, then question.
 * @throws {Error} When the folder cannot be read, or an FAQ has malformed frontmatter.
 *
 * @example
 * ```typescript
 * const faqs = await readHelpFaqs('./docs');
 * console.log(faqs.map((faq) => faq.question));
 * ```
 */
export async function readHelpFaqs(dir: string): Promise<HelpFaq[]> {
  const docs = await readMarkdownDocs(await resolveHelpFaqsDir(dir));

  const bySlug = new Map<string, HelpFaq>();
  // Keep the first file per slug so lookups stay deterministic when slugs collide.
  for (const { fields, body, lastModified } of docs) {
    const slug = typeof fields.slug === 'string' ? fields.slug.trim() : '';
    const question = typeof fields.question === 'string' ? fields.question.trim() : '';
    // Articles and release notes have no question, so they are skipped here.
    if (!slug || !question || bySlug.has(slug)) continue;

    const appKey = typeof fields.appKey === 'string' && fields.appKey ? fields.appKey : undefined;
    const sortOrder = Number(fields.sortOrder);
    const linkedArticle =
      typeof fields.linkedArticle === 'string' && fields.linkedArticle.trim()
        ? fields.linkedArticle.trim()
        : undefined;
    // fhelp FAQs use relevantAppKeys; relevantApps is accepted too for parity with articles.
    const linkedAppKeys = [
      ...new Set([
        ...(appKey ? [appKey] : []),
        ...toStringList(fields.relevantAppKeys),
        ...toStringList(fields.relevantApps),
      ]),
    ];

    bySlug.set(slug, {
      id: createHelpDocId('faq', slug),
      slug,
      question,
      answer: body,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      appKey,
      linkedAppKeys,
      tags: toStringList(fields.tags),
      linkedArticleIdentifier: linkedArticle,
      lastModified: lastModified.toISOString(),
    });
  }

  return [...bySlug.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.question.localeCompare(b.question),
  );
}

export default readHelpFaqs;
