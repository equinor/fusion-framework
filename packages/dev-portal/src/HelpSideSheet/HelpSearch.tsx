import { useState, type ReactElement } from 'react';

import { Search, Typography } from '@equinor/eds-core-react';
import { styled } from 'styled-components';

import type { HelpRequest } from './parse-help-request.js';
import { useHelpSearch, type HelpSearchHit } from './useHelpSearch.js';

const Styled = {
  Section: styled.section`
    display: grid;
    gap: 0.75rem;
    align-content: start;
    padding: 0 0.5rem 1rem;
  `,
  List: styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  `,
  Hit: styled.button`
    display: grid;
    gap: 0.25rem;
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dcdcdc;
    border-radius: 4px;
    background: #ffffff;
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:hover {
      background: #deedee;
    }
  `,
};

/** Characters of article text shown on each side of the first match. */
const SNIPPET_RADIUS = 60;

/** A search hit prepared for rendering, whatever its document type. */
interface HitView {
  readonly key: string;
  readonly kind: 'article' | 'faq';
  readonly title: string;
  readonly summary?: string;
  readonly snippet?: string;
  readonly target: HelpRequest;
}

/**
 * Builds a short plain-text excerpt around the first query term in a markdown body, so a hit
 * shows why it matched even when the title and summary do not mention the term.
 *
 * @param markdown - Article content or FAQ answer.
 * @param query - Query the hit matched.
 * @returns An excerpt, or `undefined` when the body does not contain a term.
 */
const getSnippet = (markdown: string | undefined, query: string): string | undefined => {
  // Markdown syntax is noise in a one-line excerpt.
  const text = (markdown ?? '').replace(/[#*_`>|[\]()]+/g, ' ').replace(/\s+/g, ' ');
  const lower = text.toLowerCase();
  // The first term that appears anchors the excerpt.
  const index = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => lower.indexOf(term))
    .find((position) => position >= 0);
  // Hits matched only on title, tags, or summary have no body excerpt to show.
  if (index === undefined) return undefined;
  const start = Math.max(0, index - SNIPPET_RADIUS);
  const end = Math.min(text.length, index + SNIPPET_RADIUS);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
};

/**
 * Prepares a hit for rendering: articles open as articles, FAQs open the FAQ page expanded.
 *
 * @param hit - Search hit.
 * @param query - Query the hit matched.
 * @returns The hit's display fields and navigation target.
 */
const toHitView = (hit: HelpSearchHit, query: string): HitView =>
  hit.type === 'FAQ'
    ? {
        key: `faq:${hit.slug}`,
        kind: 'faq',
        title: hit.question,
        snippet: getSnippet(hit.answer, query),
        target: { page: 'faqs', faqId: hit.slug },
      }
    : {
        key: `article:${hit.slug}`,
        kind: 'article',
        title: hit.title,
        summary: hit.summary,
        snippet: getSnippet(hit.content, query),
        target: { page: 'article', articleId: hit.slug },
      };

/** Props for {@link HelpSearch}. */
interface HelpSearchProps {
  /** Query to start with, e.g. from `useHelpCenter().openSearch(term)`. */
  readonly initialQuery?: string;
  /** Key of the current app, used to scope hits. */
  readonly appKey?: string;
  /** Opens the article or FAQ of a hit. */
  readonly onNavigate: (request: HelpRequest) => void;
}

/**
 * Help panel search page: a search box over the current app's help articles and FAQs, with ranked
 * hits that open the article, or the FAQ page with that question expanded. Backed by the `help`
 * service's `POST /search`, which the local mock answers with a simple term search over the help
 * docs.
 *
 * Test ids: `help-search`, `help-search-input`, `help-search-loading`, `help-search-result` (with
 * `data-help-type` and `data-help-article` or `data-help-faq`), `help-search-empty`,
 * `help-search-error`. The search box is a `searchbox` named "Search help" and the results list
 * is labelled "Search results", for accessibility-tree navigation.
 *
 * @param props - {@link HelpSearchProps}
 * @returns The search page.
 *
 * @example
 * ```tsx
 * <HelpSearch initialQuery="roles" appKey="my-app" onNavigate={navigate} />
 * ```
 */
export const HelpSearch = ({
  initialQuery = '',
  appKey,
  onNavigate,
}: HelpSearchProps): ReactElement => {
  const [query, setQuery] = useState(initialQuery);
  const state = useHelpSearch(query, appKey);
  // Hits are mapped to one view shape up front so the markup does not branch per document type.
  const hits =
    state.status === 'loaded' ? state.hits.map((hit) => toHitView(hit, state.query)) : [];

  // One card per hit, best match first, opening its article or FAQ.
  const hitItems = hits.map((hit) => (
    <li key={hit.key}>
      <Styled.Hit
        type="button"
        data-testid="help-search-result"
        data-help-type={hit.kind}
        data-help-article={hit.target.articleId}
        data-help-faq={hit.target.faqId}
        onClick={() => onNavigate(hit.target)}
      >
        {hit.kind === 'faq' && <Typography variant="overline">FAQ</Typography>}
        <Typography variant="h6">{hit.title}</Typography>
        {hit.summary && <Typography variant="body_short">{hit.summary}</Typography>}
        {hit.snippet && <Typography variant="caption">{hit.snippet}</Typography>}
      </Styled.Hit>
    </li>
  ));

  const status =
    state.status === 'idle' ? (
      <Typography>Search the help articles and FAQs for this app.</Typography>
    ) : state.status === 'loading' ? (
      <Typography data-testid="help-search-loading">Searching…</Typography>
    ) : state.status !== 'loaded' ? (
      <Typography data-testid="help-search-error">
        Search is not available.{' '}
        {state.status === 'error' || state.status === 'unavailable' ? state.message : ''}
      </Typography>
    ) : state.hits.length === 0 ? (
      <Typography data-testid="help-search-empty">
        No articles or FAQs match <strong>{state.query}</strong>.
      </Typography>
    ) : undefined;

  return (
    <Styled.Section data-testid="help-search">
      <Typography variant="h3">Search</Typography>
      <Search
        // EDS renders a text input; `search` exposes a searchbox role to people and agents.
        type="search"
        aria-label="Search help"
        placeholder="Search articles and FAQs"
        data-testid="help-search-input"
        value={query}
        autoFocus
        onChange={(event) => setQuery(event.target.value)}
      />
      {status ?? <Styled.List aria-label="Search results">{hitItems}</Styled.List>}
    </Styled.Section>
  );
};

export default HelpSearch;
