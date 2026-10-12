import type { ReactElement } from 'react';

import { Button, Icon, Typography } from '@equinor/eds-core-react';
import { first_page, last_page } from '@equinor/eds-icons';
import { styled } from 'styled-components';

import { HELP_PAGES, type HelpPageLink } from './help-pages.js';
import type { HelpRequest } from './parse-help-request.js';
import type { HelpArticlesState } from './useHelpArticles.js';

const Styled = {
  Nav: styled.nav`
    display: flex;
    flex-direction: column;
    min-height: 100%;
    border-right: 1px solid #dcdcdc;
  `,
  Toggle: styled.div`
    display: flex;
    justify-content: flex-end;
  `,
  List: styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
  `,
  Bottom: styled.ul`
    list-style: none;
    margin: auto 0 0;
    padding: 0;
    border-top: 1px solid #dcdcdc;
  `,
  Item: styled.button<{ $active?: boolean; $indent?: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    min-height: 42px;
    padding: 0 0.75rem 0 ${({ $indent }) => ($indent ? '0.75rem' : '0.5rem')};
    border: none;
    border-bottom: 1px solid #f0f0f0;
    background: ${({ $active }) => ($active ? '#007079' : 'transparent')};
    color: ${({ $active }) => ($active ? '#ffffff' : '#007079')};
    font: inherit;
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;

    &:hover {
      background: ${({ $active }) => ($active ? '#007079' : '#deedee')};
    }

    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
  Status: styled.li`
    padding: 0.5rem 0.75rem;
  `,
};

/** Props for {@link HelpNavigation}. */
interface HelpNavigationProps {
  /** The page currently shown, used to mark the active item. */
  readonly request: HelpRequest;
  /** Articles listed for the current app. */
  readonly articles: HelpArticlesState;
  /** Whether the sidebar is collapsed to its toggle button. */
  readonly collapsed: boolean;
  /** Collapses or expands the sidebar. */
  readonly onToggle: VoidFunction;
  /** Shows another help page in the panel. */
  readonly onNavigate: (request: HelpRequest) => void;
}

/**
 * Renders one production help page link; selecting it shows that page (Search and FAQs render
 * locally, the rest show "not supported").
 *
 * @param props.link - Page to link to.
 * @param props.active - Whether the page is currently shown.
 * @param props.onNavigate - Shows the page.
 * @returns A list item with the page button.
 */
const PageItem = ({
  link,
  active,
  onNavigate,
}: {
  readonly link: HelpPageLink;
  readonly active: boolean;
  readonly onNavigate: HelpNavigationProps['onNavigate'];
}): ReactElement => (
  <li>
    <Styled.Item
      type="button"
      $active={active}
      aria-current={active ? 'page' : undefined}
      data-testid={`help-nav-${link.page}`}
      onClick={() => onNavigate({ page: link.page })}
    >
      <Icon data={link.icon} size={18} />
      <span>{link.label}</span>
    </Styled.Item>
  </li>
);

/**
 * Resolves the article list section: loading, unavailable, empty, or one item per article.
 *
 * @param props - The list state, the active article, and navigation.
 * @returns List items for the articles section.
 */
const ArticleItems = ({
  articles,
  activeArticleId,
  onNavigate,
}: {
  readonly articles: HelpArticlesState;
  readonly activeArticleId: string | undefined;
  readonly onNavigate: HelpNavigationProps['onNavigate'];
}): ReactElement => {
  // The list is fetched per panel session, so idle only lasts until that fetch starts.
  if (articles.status === 'idle' || articles.status === 'loading') {
    return (
      <Styled.Status data-testid="help-nav-loading">
        <Typography variant="caption">Loading articles…</Typography>
      </Styled.Status>
    );
  }
  // Without a list the sidebar still works for production pages, so failures stay inline.
  if (articles.status !== 'loaded') {
    return (
      <Styled.Status data-testid="help-nav-error">
        <Typography variant="caption">Help articles are not available.</Typography>
      </Styled.Status>
    );
  }
  // An app with a help service but no articles yet should say so rather than look broken.
  if (articles.articles.length === 0) {
    return (
      <Styled.Status data-testid="help-nav-empty">
        <Typography variant="caption">No help articles for this app.</Typography>
      </Styled.Status>
    );
  }
  return (
    <>
      {/* One entry per article; the slug drives selection so links survive title edits. */}
      {articles.articles.map((article) => {
        const active = article.slug === activeArticleId || article.id === activeArticleId;
        return (
          <li key={article.slug}>
            <Styled.Item
              type="button"
              $indent
              $active={active}
              aria-current={active ? 'page' : undefined}
              title={article.title}
              data-testid="help-nav-article"
              data-help-article={article.slug}
              onClick={() => onNavigate({ page: 'article', articleId: article.slug })}
            >
              <span>{article.title}</span>
            </Styled.Item>
          </li>
        );
      })}
    </>
  );
};

/**
 * Sidebar of the dev portal help panel, shaped like the production Fusion Help sidebar: production
 * pages (Search, FAQs, Release Notes, …), the current app's articles, and pinned bottom pages.
 *
 * Built for browsing by people and synthetic agents alike: a labelled `nav` landmark, buttons with
 * `aria-current="page"` on the shown page, and stable test ids (`help-nav`, `help-nav-article`
 * with `data-help-article`, `help-nav-<page>`, `help-nav-toggle`).
 *
 * @param props - {@link HelpNavigationProps}
 * @returns The expanded sidebar, or only its expand button when collapsed.
 *
 * @example
 * ```tsx
 * <HelpNavigation request={request} articles={articles} collapsed={false} onToggle={toggle} onNavigate={navigate} />
 * ```
 */
export const HelpNavigation = ({
  request,
  articles,
  collapsed,
  onToggle,
  onNavigate,
}: HelpNavigationProps): ReactElement => {
  const toggleLabel = collapsed ? 'Expand help navigation' : 'Collapse help navigation';
  const activeArticleId = request.page === 'article' ? request.articleId : undefined;

  return (
    <Styled.Nav aria-label="Help navigation" data-testid="help-nav" data-collapsed={collapsed}>
      <Styled.Toggle>
        <Button
          variant="ghost_icon"
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          title={toggleLabel}
          data-testid="help-nav-toggle"
          onClick={onToggle}
        >
          <Icon data={collapsed ? last_page : first_page} />
        </Button>
      </Styled.Toggle>
      {!collapsed && (
        <>
          <Styled.List>
            {/* Production pages keep the sidebar shaped like Fusion Help. */}
            {HELP_PAGES.top.map((link) => (
              <PageItem
                key={link.page}
                link={link}
                active={request.page === link.page}
                onNavigate={onNavigate}
              />
            ))}
          </Styled.List>
          <Styled.List aria-label="Help articles" data-testid="help-nav-articles">
            <ArticleItems
              articles={articles}
              activeArticleId={activeArticleId}
              onNavigate={onNavigate}
            />
          </Styled.List>
          <Styled.Bottom>
            {/* Bottom pages are pinned below the articles, as in production. */}
            {HELP_PAGES.bottom.map((link) => (
              <PageItem
                key={link.page}
                link={link}
                active={request.page === link.page}
                onNavigate={onNavigate}
              />
            ))}
          </Styled.Bottom>
        </>
      )}
    </Styled.Nav>
  );
};

export default HelpNavigation;
