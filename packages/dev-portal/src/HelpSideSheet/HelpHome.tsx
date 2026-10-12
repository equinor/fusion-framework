import type { ReactElement } from 'react';

import { Typography } from '@equinor/eds-core-react';
import { styled } from 'styled-components';

import type { HelpRequest } from './parse-help-request.js';
import type { HelpArticlesState } from './useHelpArticles.js';

const Styled = {
  Section: styled.section`
    padding: 0 0.5rem 1rem;
  `,
  List: styled.ul`
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  `,
  Card: styled.button`
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

/** Props for {@link HelpHome}. */
interface HelpHomeProps {
  /** Display name of the current app, if any. */
  readonly appName?: string;
  /** Articles listed for the current app. */
  readonly articles: HelpArticlesState;
  /** Opens an article. */
  readonly onNavigate: (request: HelpRequest) => void;
}

/**
 * Help panel landing page for `useHelpCenter().openHelp()`: every article for the current app with
 * its summary, so people and synthetic agents can browse help without knowing a slug.
 *
 * Test ids: `help-home`, and `help-home-article` with `data-help-article` per article.
 *
 * @param props - {@link HelpHomeProps}
 * @returns The article index, or a short status while the list is unavailable.
 *
 * @example
 * ```tsx
 * <HelpHome appName="My App" articles={articles} onNavigate={navigate} />
 * ```
 */
export const HelpHome = ({ appName, articles, onNavigate }: HelpHomeProps): ReactElement => {
  const heading = appName ? `Help for ${appName}` : 'Help';
  const status =
    articles.status === 'idle' || articles.status === 'loading'
      ? 'Loading articles…'
      : articles.status !== 'loaded'
        ? 'Help articles are not available. Serve help docs with ffc mock-server (see --help-docs).'
        : articles.articles.length === 0
          ? 'No help articles for this app yet.'
          : undefined;

  return (
    <Styled.Section data-testid="help-home">
      <Typography variant="h3">{heading}</Typography>
      {status ? (
        <Typography>{status}</Typography>
      ) : (
        <Styled.List aria-label="Help articles">
          {/* Every article gets a card so the whole help content is reachable from one page. */}
          {articles.status === 'loaded' &&
            articles.articles.map((article) => (
              <li key={article.slug}>
                <Styled.Card
                  type="button"
                  data-testid="help-home-article"
                  data-help-article={article.slug}
                  onClick={() => onNavigate({ page: 'article', articleId: article.slug })}
                >
                  <Typography variant="h6">{article.title}</Typography>
                  {article.summary && (
                    <Typography variant="body_short">{article.summary}</Typography>
                  )}
                </Styled.Card>
              </li>
            ))}
        </Styled.List>
      )}
    </Styled.Section>
  );
};

export default HelpHome;
