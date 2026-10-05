import type { ReactElement } from 'react';

import { CircularProgress, Typography } from '@equinor/eds-core-react';
import { styled } from 'styled-components';

import { HelpMarkdown } from './HelpMarkdown';
import type { HelpArticleState } from './useHelpArticle';

const Styled = {
  Message: styled.section`
    padding: 1rem 0.5rem;
  `,
  Loading: styled.section`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 0.5rem;
  `,
  Article: styled.article`
    display: grid;
    gap: 0.5rem;
    align-content: start;
    padding: 0 0.5rem 1rem;
    line-height: 1.5;
    overflow-wrap: anywhere;

    /* Article markdown sits under the article title, so its headings must rank below it. */
    & [data-testid='help-article-content'] h1 {
      font-size: 1.5rem;
    }
    & [data-testid='help-article-content'] h2 {
      font-size: 1.25rem;
    }
    & [data-testid='help-article-content'] h3 {
      font-size: 1.1rem;
    }

    & table {
      border-collapse: collapse;
    }
    & th,
    & td {
      border: 1px solid #dcdcdc;
      padding: 0.25rem 0.5rem;
    }
    & pre {
      overflow: auto;
      padding: 0.5rem;
      background: #f7f7f7;
    }
  `,
};

/** Props for {@link HelpArticleView}. */
interface HelpArticleViewProps {
  /** Requested article slug or id, named in the not-found message. */
  readonly articleId: string;
  /** Lookup state from `useHelpArticle`. */
  readonly state: HelpArticleState;
}

/**
 * Renders one help article lookup in the dev portal help panel: loading, the article's title
 * and markdown content, or a not-found / help-unavailable / error message.
 *
 * Every state has a stable `data-testid` (`help-loading`, `help-article`, `help-article-title`,
 * `help-article-updated`, `help-article-content`, `help-not-found`, `help-unavailable`,
 * `help-error`) for Playwright.
 * Markdown renders through React elements with raw HTML disabled, so article content cannot
 * inject markup into the portal.
 *
 * @param props - {@link HelpArticleViewProps}
 * @returns The element for the current lookup state.
 *
 * @example
 * ```tsx
 * <HelpArticleView articleId="getting-started" state={useHelpArticle(request)} />
 * ```
 */
export const HelpArticleView = ({ articleId, state }: HelpArticleViewProps): ReactElement => {
  // Idle only lasts until the effect starts the fetch, so it shares the loading view.
  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <Styled.Loading data-testid="help-loading">
        <CircularProgress size={24} />
        <Typography>Loading help article…</Typography>
      </Styled.Loading>
    );
  }

  // A wrong or renamed slug is the main regression this panel exists to catch in tests.
  if (state.status === 'not-found') {
    return (
      <Styled.Message data-testid="help-not-found">
        <Typography variant="h5">Article not found</Typography>
        <Typography>
          No help article matches <code>{articleId}</code>. Check the slug passed to{' '}
          <code>openArticle()</code> and the article frontmatter in your help docs folder.
        </Typography>
      </Styled.Message>
    );
  }

  // Missing help docs need a setup hint, not a generic error.
  if (state.status === 'unavailable') {
    return (
      <Styled.Message data-testid="help-unavailable">
        <Typography variant="h5">Help is not available</Typography>
        <Typography>
          No <code>help</code> service is registered in service discovery. Run{' '}
          <code>ffc mock-server</code> with a help docs folder (see <code>--help-docs</code>) to
          serve local help articles.
        </Typography>
        <Typography variant="caption">{state.message}</Typography>
      </Styled.Message>
    );
  }

  // Remaining failures show the service's own message, e.g. the mock naming a malformed file.
  if (state.status === 'error') {
    return (
      <Styled.Message data-testid="help-error">
        <Typography variant="h5">Failed to load help article</Typography>
        <Typography variant="caption">{state.message}</Typography>
      </Styled.Message>
    );
  }

  const { article } = state;
  const lastUpdated = article.lastModified
    ? new Date(article.lastModified).toLocaleDateString()
    : undefined;
  return (
    <Styled.Article data-testid="help-article" data-article-slug={article.slug}>
      <Typography variant="h3" data-testid="help-article-title">
        {article.title}
      </Typography>
      {lastUpdated && (
        <Typography variant="caption" data-testid="help-article-updated">
          Last updated: {lastUpdated}
        </Typography>
      )}
      {article.summary && <Typography variant="ingress">{article.summary}</Typography>}
      <div data-testid="help-article-content">
        <HelpMarkdown>{article.content ?? ''}</HelpMarkdown>
      </div>
    </Styled.Article>
  );
};

export default HelpArticleView;
