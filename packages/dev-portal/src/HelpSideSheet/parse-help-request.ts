/**
 * A help request from an app, normalized from the `@Portal::FusionHelp::open` event detail.
 *
 * Only `article` requests carry data the dev portal can act on; every other page (`home`,
 * `faqs`, `search`, `governance`, `release-notes`) is kept by name for the "not supported" view.
 */
export type HelpRequest =
  | {
      /** Opens one help article. */
      readonly page: 'article';
      /** Article slug or id passed to `useHelpCenter().openArticle()`. */
      readonly articleId: string;
      readonly search?: undefined;
      readonly faqId?: undefined;
    }
  | {
      /** Any other help page, e.g. `home`, `search`, or a production-only page. */
      readonly page: string;
      readonly articleId?: undefined;
      /** Query passed to `useHelpCenter().openSearch()`, for the `search` page. */
      readonly search?: string;
      /** FAQ to expand on the `faqs` page, e.g. when opened from a search hit. */
      readonly faqId?: string;
    };

/**
 * Validates an `@Portal::FusionHelp::open` event detail, since it comes from app code at runtime.
 *
 * @param detail - Raw event detail.
 * @returns The normalized request, or `undefined` when the detail has no usable `page`.
 *
 * @example
 * ```typescript
 * parseHelpRequest({ page: 'article', articleId: 'getting-started' });
 * // { page: 'article', articleId: 'getting-started' }
 * ```
 */
export function parseHelpRequest(detail: unknown): HelpRequest | undefined {
  // Ignore malformed events instead of opening an empty help panel.
  if (detail === null || typeof detail !== 'object') return undefined;
  const { page, articleId, search } = detail as {
    page?: unknown;
    articleId?: unknown;
    search?: unknown;
  };
  // Without a page name there is nothing to show, not even the unsupported message.
  if (typeof page !== 'string' || !page) return undefined;
  // Only an article request with an identifier can be looked up; anything else is unsupported.
  if (page === 'article' && typeof articleId === 'string' && articleId.trim()) {
    return { page, articleId: articleId.trim() };
  }
  // openSearch(term) prefills the search page with the app's query.
  if (page === 'search') {
    return typeof search === 'string' && search.trim() ? { page, search: search.trim() } : { page };
  }
  return { page: page === 'article' ? 'article (missing article id)' : page };
}

export default parseHelpRequest;
