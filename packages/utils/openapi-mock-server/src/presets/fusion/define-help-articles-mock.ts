import { defineService } from '../../discovery/define-service.js';
import type { MockResponse } from '../../discovery/create-router.js';
import type { ServiceMockDefinition } from '../../discovery/discover-services.js';
import { readHelpArticles, type HelpArticle } from './read-help-articles.js';
import { readHelpFaqs, type HelpFaq } from './read-help-faqs.js';
import { searchHelpDocs } from './search-help-docs.js';

import schema from './help.openapi.json' with { type: 'json' };

/** Options for {@link defineHelpArticlesMock}. */
export interface DefineHelpArticlesMockOptions {
  /**
   * Help docs folder holding article and FAQ markdown files — either directly, or in `articles`
   * and `faqs` subfolders (e.g. `docs/my-app`, as in the Fusion core apps).
   */
  dir: string;
  /** Service-discovery key the articles are served under. Defaults to `help`. */
  key?: string;
}

/** A help document the routes can look up: an article or an FAQ. */
type HelpDoc = Pick<HelpArticle | HelpFaq, 'id' | 'slug' | 'linkedAppKeys'>;

/**
 * Finds a document by the identifier the help API accepts: its slug or its id.
 *
 * @template T - Document type.
 * @param docs - Documents read for this request.
 * @param identifier - Requested slug or id.
 * @returns The matching document, if any.
 */
function findDoc<T extends HelpDoc>(docs: readonly T[], identifier: string): T | undefined {
  const id = identifier.toLowerCase();
  // The Help API accepts either identifier, and generated UUIDs are lowercase.
  return docs.find((doc) => doc.slug === identifier || doc.id === id);
}

/**
 * Whether a document belongs to an app for the `/apps/{appKey}/...` routes.
 *
 * @param doc - Candidate document.
 * @param appKey - Requested app key.
 * @returns `true` when the document is linked to the app, or is not linked to any app at all.
 */
function isLinkedToApp(doc: HelpDoc, appKey: string): boolean {
  // A local docs folder usually belongs to one app, so unlinked documents are served for any app key.
  return doc.linkedAppKeys.length === 0 || doc.linkedAppKeys.includes(appKey);
}

/**
 * Sends the Fusion API error envelope the real Help service returns for an unknown document.
 *
 * @param res - Response to write.
 * @param kind - Document kind, named in the message.
 * @param identifier - Requested slug or id, named in the message.
 */
function sendNotFound(res: MockResponse, kind: 'article' | 'FAQ', identifier: string): void {
  res.statusCode = 404;
  res.json({
    error: { code: 'NotFound', message: `Help ${kind} "${identifier}" was not found.` },
  });
}

/**
 * Sends documents in the paged-collection envelope the real Help service uses for lists.
 *
 * @param res - Response to write.
 * @param docs - Documents to return.
 */
function sendCollection(res: MockResponse, docs: readonly unknown[]): void {
  res.json({ totalCount: docs.length, count: docs.length, value: docs });
}

/**
 * Reads the free-text `search` field from a Help API search request body.
 *
 * @param body - Parsed JSON request body.
 * @returns The query, or an empty string when absent.
 */
function readSearchQuery(body: unknown): string {
  // Bodies come from clients at runtime, so the shape is checked rather than assumed.
  if (body === null || typeof body !== 'object' || !('search' in body)) return '';
  return typeof body.search === 'string' ? body.search : '';
}

/**
 * Defines a mock Fusion Help service that serves help articles and FAQs from local markdown
 * files — the same frontmatter files `fhelp` syncs to the production Help service — so the dev
 * portal and Playwright tests can open an app's help without a live Help service.
 *
 * Files are re-read on every request, so editing or adding a document shows up the next time
 * help is opened, without restarting the mock server. Articles always include `content` and FAQs
 * always include `answer`.
 *
 * Routes (mirroring the Help API's read operations):
 * - `GET /articles` and `GET /apps/{appKey}/articles` — paged collection of articles.
 * - `GET /articles/{articleIdentifier}` and `GET /apps/{appKey}/articles/{articleIdentifier}` —
 *   one article by slug or id, or `404` with `{ error: { code: 'NotFound', message } }`.
 * - `GET /faqs` and `GET /apps/{appKey}/faqs` — paged collection of FAQs.
 * - `GET /faqs/{faqIdentifier}` and `GET /apps/{appKey}/faqs/{faqIdentifier}` — one FAQ by slug
 *   or id, or `404`.
 * - `POST /search` with `{ search }` — articles (`type: 'Article'`) and FAQs (`type: 'FAQ'`)
 *   matching every query term, ranked by where the terms match, as `{ '@odata.count', value }`
 *   like the Help API's search response. Other Azure AI Search options (`filter`, `facets`, …)
 *   are accepted and ignored.
 *
 * @param options - Docs folder and optional service key.
 * @returns A service definition to pass to `MockServerHandle.use([...])`.
 *
 * @example
 * ```typescript
 * import { createMockServer } from '@equinor/fusion-openapi-mock-server';
 * import { defineHelpArticlesMock } from '@equinor/fusion-openapi-mock-server/presets/fusion';
 *
 * const server = createMockServer();
 * server.use('fusion');
 * server.use([defineHelpArticlesMock({ dir: './docs' })]);
 * await server.start({ port: 4010 });
 * ```
 */
export function defineHelpArticlesMock(
  options: DefineHelpArticlesMockOptions,
): ServiceMockDefinition {
  const { dir, key = 'help' } = options;

  return defineService({
    key,
    serviceDiscovery: 'replace',
    schema,
    middleware: (router) => {
      router.get('/articles', async (_req, res) => {
        sendCollection(res, await readHelpArticles(dir));
      });

      router.get('/articles/:articleIdentifier', async (_req, res, { params }) => {
        const identifier = String(params.articleIdentifier);
        const article = findDoc(await readHelpArticles(dir), identifier);
        // Unknown identifiers must surface as a not-found state, not a generated fake article.
        if (!article) return sendNotFound(res, 'article', identifier);
        res.json(article);
      });

      router.get('/apps/:appKey/articles', async (_req, res, { params }) => {
        const appKey = String(params.appKey);
        const articles = await readHelpArticles(dir);
        // App-scoped lists mirror the Help API by excluding articles linked to other apps.
        sendCollection(
          res,
          articles.filter((article) => isLinkedToApp(article, appKey)),
        );
      });

      router.get('/apps/:appKey/articles/:articleIdentifier', async (_req, res, { params }) => {
        const appKey = String(params.appKey);
        const identifier = String(params.articleIdentifier);
        const article = findDoc(await readHelpArticles(dir), identifier);
        // The app-scoped route only serves articles linked to (or not restricted from) that app.
        if (!article || !isLinkedToApp(article, appKey)) {
          return sendNotFound(res, 'article', identifier);
        }
        res.json(article);
      });

      router.get('/faqs', async (_req, res) => {
        sendCollection(res, await readHelpFaqs(dir));
      });

      router.get('/faqs/:faqIdentifier', async (_req, res, { params }) => {
        const identifier = String(params.faqIdentifier);
        const faq = findDoc(await readHelpFaqs(dir), identifier);
        // Unknown identifiers must surface as a not-found state, not a generated fake FAQ.
        if (!faq) return sendNotFound(res, 'FAQ', identifier);
        res.json(faq);
      });

      router.get('/apps/:appKey/faqs', async (_req, res, { params }) => {
        const appKey = String(params.appKey);
        const faqs = await readHelpFaqs(dir);
        // App-scoped lists mirror the Help API by excluding FAQs linked to other apps.
        sendCollection(
          res,
          faqs.filter((faq) => isLinkedToApp(faq, appKey)),
        );
      });

      router.get('/apps/:appKey/faqs/:faqIdentifier', async (_req, res, { params }) => {
        const appKey = String(params.appKey);
        const identifier = String(params.faqIdentifier);
        const faq = findDoc(await readHelpFaqs(dir), identifier);
        // The app-scoped route only serves FAQs linked to (or not restricted from) that app.
        if (!faq || !isLinkedToApp(faq, appKey)) return sendNotFound(res, 'FAQ', identifier);
        res.json(faq);
      });

      router.post('/search', async (_req, res, { body }) => {
        const [articles, faqs] = await Promise.all([readHelpArticles(dir), readHelpFaqs(dir)]);
        const hits = searchHelpDocs(articles, faqs, readSearchQuery(body));
        res.json({ '@odata.count': hits.length, value: hits });
      });
    },
  });
}

export default defineHelpArticlesMock;
