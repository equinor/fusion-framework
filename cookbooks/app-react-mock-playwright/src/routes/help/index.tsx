import type { RouterHandle } from '@equinor/fusion-framework-react-router';
import { useHelpCenter } from '@equinor/fusion-framework-react-app/help-center';
import type { ReactElement } from 'react';
import { HelpInfoButton } from '../../components/HelpInfoButton';

export const handle = {
  route: {
    description: 'Demonstrates opening local help articles in the dev portal.',
  },
} as const satisfies RouterHandle;

/** Slug of `docs/articles/getting-started.md`, served by `ffc mock-server`. */
const ARTICLE_SLUG = 'getting-started';

/** A slug with no matching article, to demonstrate the dev portal's not-found state. */
const MISSING_ARTICLE_SLUG = 'renamed-or-deleted-article';

/**
 * Demonstrates help-button wiring that can be verified before release.
 *
 * `useHelpCenter()` dispatches `@Portal::FusionHelp::open`; the dev portal opens its help panel
 * and loads the article from the `help` service that `ffc mock-server` serves from `docs/`.
 * A wrong or renamed slug shows a not-found message, so Playwright catches it locally.
 *
 * The heading's {@link HelpInfoButton} shows the contextual-help pattern used on every page.
 *
 * `openHelp()` opens the dev portal's article index; its sidebar lets people and synthetic agents
 * browse every article without knowing a slug, and `openSearch(term)` searches the articles.
 *
 * @returns Buttons that open the help center, search, an article, a missing article, and the FAQs.
 *
 * @example
 * Navigate to `/help` while `ffc mock-server` and `ffc app dev --mock` run, then click a button.
 */
export default function HelpArticlesPage(): ReactElement {
  const helpCenter = useHelpCenter();

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <h2>Local help articles</h2>
        <HelpInfoButton articleSlug="getting-started" label="Getting started" />
      </div>
      <p>
        <code>ffc mock-server</code> auto-detects <code>docs/articles</code> and serves its markdown
        files as the <code>help</code> service, so these buttons open real content in the dev
        portal. Every scenario page also has an info icon next to its heading that opens the article
        explaining that page.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => helpCenter.openHelp()}>
          Open help center
        </button>
        <button type="button" onClick={() => helpCenter.openSearch('service discovery')}>
          Search help for service discovery
        </button>
        <button type="button" onClick={() => helpCenter.openArticle(ARTICLE_SLUG)}>
          Open help article
        </button>
        <button type="button" onClick={() => helpCenter.openArticle(MISSING_ARTICLE_SLUG)}>
          Open missing help article
        </button>
        <button type="button" onClick={() => helpCenter.openFaqs()}>
          Open help FAQs
        </button>
      </div>
    </section>
  );
}
