import { useCallback, useState, type ReactElement } from 'react';

import { Typography } from '@equinor/eds-core-react';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { styled } from 'styled-components';

import { HELP_PAGES } from './help-pages';
import { HelpArticleView } from './HelpArticleView';
import { HelpFaqs } from './HelpFaqs';
import { HelpHome } from './HelpHome';
import { HelpSearch } from './HelpSearch';
import { HelpNavigation } from './HelpNavigation';
import type { HelpRequest } from './parse-help-request';
import { useHelpArticle } from './useHelpArticle';
import { useHelpArticles } from './useHelpArticles';
import { useHelpRequest } from './useHelpRequest';

/** Initial panel width; wide enough for the sidebar next to readable article text. */
const PANEL_WIDTH = 820;

/** Below this viewport width the sidebar starts collapsed so the article stays readable. */
const SIDEBAR_COLLAPSE_BELOW = 720;

const Styled = {
  Layout: styled.div<{ $collapsed: boolean }>`
    display: grid;
    grid-template-columns: ${({ $collapsed }) => ($collapsed ? '48px' : '240px')} minmax(0, 1fr);
    gap: 1rem;
    min-height: 100%;
  `,
  Main: styled.section`
    min-width: 0;
  `,
  Unsupported: styled.section`
    padding: 0 0.5rem 1rem;
  `,
};

/**
 * Resolves a readable name for a help page id, for the "not supported" message.
 *
 * @param page - Help page id from a request or the sidebar.
 * @returns The sidebar label, or the id itself for pages the sidebar does not list.
 */
const getHelpPageLabel = (page: string): string => {
  // Top and bottom pages share one lookup, since a request can name either.
  const links = [...HELP_PAGES.top, ...HELP_PAGES.bottom];
  // Requests from apps use page ids; the sidebar label is what people see in production.
  return links.find((link) => link.page === page)?.label ?? page;
};

/** Props for {@link HelpContent}. */
interface HelpContentProps {
  /** The page to show. */
  readonly request: HelpRequest;
  /** Display name of the current app, if any. */
  readonly appName?: string;
  /** Key of the current app, used to scope search. */
  readonly appKey?: string;
  /** Sidebar article list, reused by the home page. */
  readonly articles: ReturnType<typeof useHelpArticles>;
  /** Shows another help page. */
  readonly onNavigate: (request: HelpRequest) => void;
}

/**
 * Picks the content view for the shown help page: an article, the home index, or "not supported".
 *
 * @param props - {@link HelpContentProps}
 * @returns The content for the page.
 */
const HelpContent = ({
  request,
  appName,
  appKey,
  articles,
  onNavigate,
}: HelpContentProps): ReactElement => {
  const articleState = useHelpArticle(request);

  // Article requests carry the slug to look up; every other page is selected by name below.
  if (request.page === 'article' && request.articleId !== undefined) {
    return <HelpArticleView articleId={request.articleId} state={articleState} />;
  }
  // Search starts from the app's openSearch(term); a new help event remounts it via the session key.
  if (request.page === 'search') {
    return <HelpSearch initialQuery={request.search} appKey={appKey} onNavigate={onNavigate} />;
  }
  // FAQs come from the help docs' faqs folder; a search hit's faqId starts that FAQ expanded.
  if (request.page === 'faqs') {
    return (
      <HelpFaqs
        key={request.faqId ?? ''}
        request={request}
        appKey={appKey}
        onNavigate={onNavigate}
      />
    );
  }
  // `openHelp()` lands on an index so the whole help content can be browsed without a slug.
  if (request.page === 'home') {
    return <HelpHome appName={appName} articles={articles} onNavigate={onNavigate} />;
  }
  return (
    <Styled.Unsupported data-testid="help-unsupported">
      <Typography variant="h5">Not supported in the dev portal</Typography>
      <Typography>
        <strong>{getHelpPageLabel(request.page)}</strong> is available in the Fusion portal. The dev
        portal shows articles, FAQs, and search from your local help docs.
      </Typography>
    </Styled.Unsupported>
  );
};

/**
 * Dev portal help panel: opens when an app calls `useHelpCenter()` from
 * `@equinor/fusion-framework-react-app/help-center`, mirroring the production Fusion Help side
 * sheet closely enough to verify help wiring and content locally, in Playwright, and with
 * synthetic agents that browse the help content.
 *
 * Layout: a collapsible sidebar ({@link HelpNavigation}) with production pages and the current
 * app's articles, next to the shown page. Articles come from the `help` service (local docs
 * served by `ffc mock-server`); `openHelp()` shows an index of all articles; other production
 * pages (Release Notes, App Governance, …) show "not supported" (`data-testid="help-unsupported"`).
 * Search (and `openSearch(term)`) searches articles and FAQs, and Frequently Asked Questions (and
 * `openFaqs()`) lists the app's FAQs.
 * The content root is `data-testid="help-sidesheet"` with `data-help-page`. Closing the panel
 * leaves the app untouched.
 *
 * @returns The help side sheet, closed until an app requests help.
 *
 * @example
 * ```tsx
 * // Mounted once in the portal shell, next to the other side sheets.
 * <HelpSideSheet />
 * ```
 */
export const HelpSideSheet = (): ReactElement => {
  const { request, session, navigate, close } = useHelpRequest();
  const { currentApp } = useCurrentApp();
  const articles = useHelpArticles(currentApp?.appKey, session);
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < SIDEBAR_COLLAPSE_BELOW);
  const toggle = useCallback(() => setCollapsed((value) => !value), []);

  const subTitle =
    request?.page === 'article' && request.articleId
      ? `Article: ${request.articleId}`
      : 'Fusion Help (dev portal)';

  return (
    <SideSheet
      isOpen={!!request}
      onClose={close}
      isDismissable={true}
      enableFullscreen={true}
      // The sheet is right-anchored, so a width beyond the viewport would push the sidebar off-screen.
      minWidth={Math.min(PANEL_WIDTH, window.innerWidth)}
    >
      <SideSheet.Indicator color={'#007079'} />
      <SideSheet.Title title="Help" />
      <SideSheet.SubTitle subTitle={subTitle} />
      <SideSheet.Actions />
      <SideSheet.Content>
        {request && (
          <Styled.Layout
            $collapsed={collapsed}
            data-testid="help-sidesheet"
            data-help-page={request.page}
          >
            <HelpNavigation
              request={request}
              articles={articles}
              collapsed={collapsed}
              onToggle={toggle}
              onNavigate={navigate}
            />
            <Styled.Main aria-label="Help content">
              {/* Each app help event is a new session: reset and refetch the page, even for an
                  identical request. Sidebar navigation keeps the session, so it keeps page state. */}
              <HelpContent
                key={session}
                request={request}
                appName={currentApp?.manifest?.displayName}
                appKey={currentApp?.appKey}
                articles={articles}
                onNavigate={navigate}
              />
            </Styled.Main>
          </Styled.Layout>
        )}
      </SideSheet.Content>
    </SideSheet>
  );
};

export default HelpSideSheet;
