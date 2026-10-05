import type { HelpArticle } from './read-help-articles.js';
import type { HelpFaq } from './read-help-faqs.js';

/**
 * One search hit, shaped like the Help API's `ApiSearchValueResponse` for an article or FAQ.
 * `type` uses the Help index's content types (`Article`, `FAQ`), so clients filtering with
 * `type eq 'Article'` (as the Fusion Help app does) behave the same against the mock.
 */
export type HelpDocSearchHit =
  | (HelpArticle & { type: 'Article'; '@search.score': number })
  | (HelpFaq & { type: 'FAQ'; '@search.score': number });

/** Searchable text of one document, by field, with the weight a match in that field adds. */
type WeightedFields = readonly (readonly [text: string, weight: number])[];

/**
 * Scores one document: the sum of field weights per query term, or `0` when any term is missing
 * from every field (all terms must match, like an all-terms search mode).
 *
 * @param fields - Lower-cased field texts with weights.
 * @param terms - Lower-cased query terms.
 * @returns Relevance score; `0` means no match.
 */
function scoreDocument(fields: WeightedFields, terms: readonly string[]): number {
  // An empty query matches everything equally, so sortOrder decides.
  if (terms.length === 0) return 1;
  let score = 0;
  // Each term must contribute, so one miss disqualifies the document.
  for (const term of terms) {
    // Sum the weights of every field containing the term, so multi-field matches rank higher.
    const termScore = fields.reduce(
      (sum, [text, weight]) => sum + (text.includes(term) ? weight : 0),
      0,
    );
    // Remaining terms cannot rescue a document missing this one.
    if (termScore === 0) return 0;
    score += termScore;
  }
  return score;
}

/**
 * Ranks help articles and FAQs against a free-text query — a small, deterministic stand-in for
 * the Help service's Azure AI Search index, good enough to find help content locally and in tests.
 *
 * Matching is case-insensitive and every whitespace-separated term must appear somewhere in the
 * document. Matches weigh title/question 5, tags 3, summary 2, content/answer 1. Hits are ordered by
 * score; equal scores keep articles before FAQs, each in `sortOrder`. An empty query matches all.
 *
 * @param articles - Articles to search, in `sortOrder` order.
 * @param faqs - FAQs to search, in `sortOrder` order.
 * @param query - Free-text query, as sent in the Help API `search` field.
 * @returns Matching documents with `type` (`Article` or `FAQ`) and `@search.score`, best first.
 *
 * @example
 * ```typescript
 * const hits = searchHelpDocs(await readHelpArticles(dir), await readHelpFaqs(dir), 'access');
 * ```
 */
export function searchHelpDocs(
  articles: readonly HelpArticle[],
  faqs: readonly HelpFaq[],
  query: string,
): HelpDocSearchHit[] {
  // Terms are matched independently so word order in the query does not matter.
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hits: HelpDocSearchHit[] = [];

  // Articles are scored first so they win ties against FAQs in the stable sort below.
  for (const article of articles) {
    const score = scoreDocument(
      [
        [article.title.toLowerCase(), 5],
        [article.tags.join(' ').toLowerCase(), 3],
        [article.summary.toLowerCase(), 2],
        [article.content.toLowerCase(), 1],
      ],
      terms,
    );
    // Non-matching articles are dropped rather than ranked last.
    if (score > 0) hits.push({ ...article, type: 'Article', '@search.score': score });
  }
  // FAQs are searched by question, tags, and answer, mirroring their indexed fields.
  for (const faq of faqs) {
    const score = scoreDocument(
      [
        [faq.question.toLowerCase(), 5],
        [faq.tags.join(' ').toLowerCase(), 3],
        [faq.answer.toLowerCase(), 1],
      ],
      terms,
    );
    // Non-matching FAQs are dropped rather than ranked last.
    if (score > 0) hits.push({ ...faq, type: 'FAQ', '@search.score': score });
  }

  // Stable sort keeps the insertion order (articles, then FAQs, by sortOrder) for equal scores.
  return hits.sort((a, b) => b['@search.score'] - a['@search.score']);
}

export default searchHelpDocs;
