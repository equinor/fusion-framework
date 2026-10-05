import { page, userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HelpSideSheet } from './HelpSideSheet';

type Listener = (event: { detail: unknown }) => void;

interface Article {
  id: string;
  linkedAppKeys?: string[];
  slug: string;
  title: string;
  summary?: string;
  sortOrder?: number;
  content?: string;
  lastModified?: string;
}

const mocks = vi.hoisted(() => ({
  listeners: new Map<string, Set<(event: { detail: unknown }) => void>>(),
  createClient: vi.fn(),
  json: vi.fn(),
  currentApp: { appKey: 'my-app', manifest: { displayName: 'My App' } } as
    | { appKey: string; manifest?: { displayName?: string } }
    | undefined,
}));

vi.mock('@equinor/fusion-framework-react', () => {
  const framework = {
    modules: {
      event: {
        addEventListener: (type: string, handler: Listener) => {
          const handlers = mocks.listeners.get(type) ?? new Set<Listener>();
          handlers.add(handler);
          mocks.listeners.set(type, handlers);
          return () => handlers.delete(handler);
        },
      },
      serviceDiscovery: { createClient: mocks.createClient },
    },
  };
  return { useFramework: () => framework };
});

vi.mock('@equinor/fusion-framework-react/app', () => ({
  useCurrentApp: () => ({ currentApp: mocks.currentApp }),
}));

const ARTICLES: Article[] = [
  {
    id: '2',
    slug: 'manage',
    title: 'Manage demands',
    summary: 'Edit and track',
    sortOrder: 2,
    content: '## Manage\n\nEdit a demand.',
  },
  {
    id: '1',
    slug: 'getting-started',
    title: 'Getting started',
    summary: 'First steps',
    sortOrder: 1,
    content: '## Install\n\nRun **pnpm install**.',
    lastModified: '2026-01-02T03:04:05.000Z',
  },
  {
    id: '3',
    slug: 'other-app',
    title: 'Other app install',
    sortOrder: 3,
    content: 'Install the other app.',
    linkedAppKeys: ['other-app'],
  },
];

const FAQS = [
  {
    id: 'f2',
    slug: 'faq-edit',
    question: 'Can I edit a submitted demand?',
    answer: 'No, **withdraw** it first.',
    sortOrder: 2,
  },
  {
    id: 'f1',
    slug: 'faq-start',
    question: 'Where do I start?',
    answer: 'Read the getting started article.',
    sortOrder: 1,
    linkedArticleIdentifier: 'getting-started',
  },
];

/**
 * Dispatches a help event the way an app's `useHelpCenter()` reaches the portal.
 *
 * @param detail - Event detail.
 */
function openHelp(detail: unknown): void {
  // Deliver to every registered listener, as the framework event module does.
  for (const handler of mocks.listeners.get('@Portal::FusionHelp::open') ?? []) {
    handler({ detail });
  }
}

/**
 * Creates the error `HttpClient.json` throws for a non-OK response.
 *
 * @param status - HTTP status.
 * @returns An error carrying the response.
 */
const httpError = (status: number): Error =>
  Object.assign(new Error(`Request failed with ${status}`), { response: { status } });

/**
 * Answers help service paths from {@link ARTICLES}, like the local mock help service.
 *
 * @param path - Requested help service path.
 * @returns The list envelope or the matching article.
 */
async function serveHelp(path: string, init?: { body?: { search?: string } }): Promise<unknown> {
  // Search returns every article and FAQ containing the query, like the mock's term search.
  if (path === '/search') {
    const term = init?.body?.search?.toLowerCase() ?? '';
    // A plain substring match is enough to exercise the panel's search wiring.
    const articles = ARTICLES.filter((entry) =>
      `${entry.title} ${entry.content}`.toLowerCase().includes(term),
    ).map((entry) => ({ ...entry, type: 'Article' }));
    // FAQs are matched on question and answer, as the help index does.
    const faqs = FAQS.filter((entry) =>
      `${entry.question} ${entry.answer}`.toLowerCase().includes(term),
    ).map((entry) => ({ ...entry, type: 'FAQ' }));
    // Articles first, then FAQs, matching the mock's tie-break order.
    const value = [...articles, ...faqs];
    return { '@odata.count': value.length, value };
  }
  // FAQ lists return the paged-collection envelope.
  if (path.split('?')[0]?.endsWith('/faqs')) return { totalCount: FAQS.length, value: FAQS };
  // List routes return the paged-collection envelope; app lists skip other apps' articles.
  if (path.endsWith('/articles')) {
    // App lists exclude articles linked only to other apps, like the help service.
    const value = ARTICLES.filter((entry) => !entry.linkedAppKeys?.includes('other-app'));
    return { totalCount: value.length, value };
  }
  const slug = decodeURIComponent(path.replace(/^\/articles\//, '').split('?')[0] ?? '');
  // Article routes resolve by slug, like the mock help service.
  const article = ARTICLES.find((entry) => entry.slug === slug);
  // Unknown slugs behave like the help service's 404.
  if (!article) throw httpError(404);
  return article;
}

describe('HelpSideSheet', () => {
  beforeEach(async () => {
    // A desktop-sized viewport keeps the sidebar expanded, as in a normal dev portal session.
    await page.viewport(1280, 900);
    mocks.currentApp = { appKey: 'my-app', manifest: { displayName: 'My App' } };
    mocks.createClient.mockResolvedValue({ json: mocks.json });
    mocks.json.mockImplementation(serveHelp);
  });

  afterEach(() => {
    cleanup();
    mocks.listeners.clear();
    vi.clearAllMocks();
  });

  it('shows the requested article title, last updated date, and markdown content', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'article', articleId: 'getting-started' });

    await expect
      .element(screen.getByTestId('help-article-title'))
      .toHaveTextContent('Getting started');
    await expect
      .element(screen.getByTestId('help-article-updated'))
      .toHaveTextContent('Last updated');
    await expect
      .element(screen.getByTestId('help-article-content').getByRole('heading', { name: 'Install' }))
      .toBeVisible();
    expect(mocks.createClient).toHaveBeenCalledWith('help');
    expect(mocks.json).toHaveBeenCalledWith(
      '/articles/getting-started?$expand=content',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('lists the current app articles in the sidebar, sorted, with the open one marked current', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'article', articleId: 'manage' });

    const items = screen.getByTestId('help-nav-article');
    await expect.element(items.first()).toHaveTextContent('Getting started');
    await expect.element(items.nth(1)).toHaveTextContent('Manage demands');
    await expect.element(items.nth(1)).toHaveAttribute('aria-current', 'page');
    expect(mocks.json).toHaveBeenCalledWith('/apps/my-app/articles', expect.anything());
  });

  it('browses to another article from the sidebar without refetching the list', async () => {
    const screen = await render(<HelpSideSheet />);
    openHelp({ page: 'article', articleId: 'getting-started' });
    await expect
      .element(screen.getByTestId('help-article-title'))
      .toHaveTextContent('Getting started');

    await screen
      .getByRole('navigation', { name: 'Help navigation' })
      .getByRole('button', { name: 'Manage demands' })
      .click();

    await expect
      .element(screen.getByTestId('help-article-title'))
      .toHaveTextContent('Manage demands');
    // Only list requests matter: browsing must reuse the sidebar list fetched on open.
    const listCalls = mocks.json.mock.calls.filter(([path]) => path === '/apps/my-app/articles');
    expect(listCalls).toHaveLength(1);
  });

  it('lists every article on the home page for openHelp()', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'home' });

    await expect.element(screen.getByTestId('help-home')).toHaveTextContent('Help for My App');
    await screen
      .getByTestId('help-home')
      .getByRole('button', { name: /Manage demands/ })
      .click();
    await expect
      .element(screen.getByTestId('help-article-title'))
      .toHaveTextContent('Manage demands');
  });

  it('lists all articles when no app is loaded', async () => {
    mocks.currentApp = undefined;
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'home' });

    await expect.element(screen.getByTestId('help-home-article').first()).toBeVisible();
    expect(mocks.json).toHaveBeenCalledWith('/articles', expect.anything());
  });

  it('shows production-only sidebar pages as not supported', async () => {
    const screen = await render(<HelpSideSheet />);
    openHelp({ page: 'article', articleId: 'getting-started' });

    await screen.getByTestId('help-nav-release-notes').click();

    await expect.element(screen.getByTestId('help-unsupported')).toHaveTextContent('Release Notes');
    await expect
      .element(screen.getByTestId('help-nav-release-notes'))
      .toHaveAttribute('aria-current', 'page');
  });

  it('collapses and expands the sidebar', async () => {
    const screen = await render(<HelpSideSheet />);
    openHelp({ page: 'home' });
    await expect.element(screen.getByTestId('help-nav-article').first()).toBeVisible();

    await screen.getByRole('button', { name: 'Collapse help navigation' }).click();
    await expect.element(screen.getByTestId('help-nav-article').first()).not.toBeInTheDocument();

    await screen.getByRole('button', { name: 'Expand help navigation' }).click();
    await expect.element(screen.getByTestId('help-nav-article').first()).toBeVisible();
  });

  it('starts with the sidebar collapsed on a narrow viewport', async () => {
    await page.viewport(480, 900);
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'home' });

    await expect
      .element(screen.getByRole('button', { name: 'Expand help navigation' }))
      .toBeVisible();
  });

  it('searches articles from the sidebar and opens a hit', async () => {
    const screen = await render(<HelpSideSheet />);
    openHelp({ page: 'home' });

    await screen.getByTestId('help-nav-search').click();
    await screen.getByRole('searchbox', { name: 'Search help' }).fill('install');

    const results = screen.getByTestId('help-search-result');
    await expect.element(results.first()).toHaveTextContent('Getting started');
    // Other apps' articles are dropped so search matches what the sidebar lists.
    await expect.element(screen.getByText('Other app install')).not.toBeInTheDocument();
    expect(mocks.json).toHaveBeenCalledWith(
      '/search',
      expect.objectContaining({ method: 'POST', body: { search: 'install', count: true } }),
    );

    await results.first().click();
    await expect
      .element(screen.getByTestId('help-article-title'))
      .toHaveTextContent('Getting started');
  });

  it('prefills the search from openSearch(term)', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'search', search: 'edit' });

    await expect
      .element(screen.getByRole('searchbox', { name: 'Search help' }))
      .toHaveValue('edit');
    await expect
      .element(screen.getByTestId('help-search-result').first())
      .toHaveTextContent('Manage demands');
  });

  it('keeps real Help index hits owned by the app and drops release notes and other apps', async () => {
    mocks.json.mockImplementation(async (path: string) => {
      // Real hits name the owner in appKey and may link other apps only.
      if (path === '/search') {
        return {
          value: [
            {
              type: 'Article',
              slug: 'own',
              title: 'Own article',
              appKey: 'my-app',
              linkedAppKeys: ['x'],
            },
            {
              type: 'Article',
              slug: 'linked',
              title: 'Linked article',
              appKey: 'x',
              linkedAppKeys: ['my-app'],
            },
            { type: 'Article', slug: 'foreign', title: 'Foreign article', appKey: 'x' },
            { type: 'ReleaseNote', slug: 'rel', title: 'Release', appKey: 'my-app' },
          ],
        };
      }
      return serveHelp(path);
    });
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'search', search: 'article' });

    const results = screen.getByTestId('help-search-result');
    await expect.element(results.first()).toHaveTextContent('Own article');
    await expect.element(results.nth(1)).toHaveTextContent('Linked article');
    expect(results.all()).toHaveLength(2);
  });

  it('says when nothing matches the search', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'search', search: 'zebra' });

    await expect.element(screen.getByTestId('help-search-empty')).toHaveTextContent('zebra');
  });

  it('shows a not-found message naming the article for a 404', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'article', articleId: 'missing-article' });

    await expect.element(screen.getByTestId('help-not-found')).toHaveTextContent('missing-article');
  });

  it('explains that help is unavailable when no help service is discovered', async () => {
    mocks.createClient.mockRejectedValue(
      new Error('Could not load configuration of service [help]'),
    );
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'article', articleId: 'getting-started' });

    await expect.element(screen.getByTestId('help-unavailable')).toBeVisible();
    await expect.element(screen.getByTestId('help-nav-error')).toBeVisible();
  });

  it('shows the service error message from the response body', async () => {
    mocks.json.mockImplementation(async (path: string) => {
      // The mock server reports malformed frontmatter as `{ error: string }` with a 500.
      if (path.endsWith('/articles')) return { value: [] };
      const error = httpError(500);
      // HttpJsonResponseError exposes the parsed response body as `data`.
      Object.assign(error, {
        data: { error: 'Invalid help document frontmatter in "broken.md"' },
      });
      throw error;
    });
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'article', articleId: 'getting-started' });

    await expect.element(screen.getByTestId('help-error')).toHaveTextContent('broken.md');
  });

  it('shows other failures as an error', async () => {
    mocks.json.mockImplementation(async (path: string) => {
      // Keep the list working so only the article request fails.
      if (path.endsWith('/articles')) return { value: [] };
      throw httpError(500);
    });
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'article', articleId: 'getting-started' });

    await expect.element(screen.getByTestId('help-error')).toHaveTextContent('500');
    await expect.element(screen.getByTestId('help-nav-empty')).toBeVisible();
  });

  it('shows a not-supported message for production-only pages requested by the app', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'governance' });

    await expect
      .element(screen.getByTestId('help-unsupported'))
      .toHaveTextContent('App Governance');
  });

  it('lists the app FAQs in sortOrder and expands an answer', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'faqs' });

    const questions = screen.getByTestId('help-faq-question');
    await expect.element(questions.first()).toHaveTextContent('Where do I start?');
    await expect.element(questions.nth(1)).toHaveAttribute('aria-expanded', 'false');
    expect(mocks.json).toHaveBeenCalledWith('/apps/my-app/faqs?$expand=answer', expect.anything());

    await questions.nth(1).click();

    await expect
      .element(screen.getByRole('region', { name: 'Can I edit a submitted demand?' }))
      .toHaveTextContent('No, withdraw it first.');
    await expect.element(questions.nth(1)).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the linked article from an FAQ answer', async () => {
    const screen = await render(<HelpSideSheet />);
    openHelp({ page: 'faqs' });

    await screen.getByRole('button', { name: 'Where do I start?' }).click();
    await screen.getByTestId('help-faq-article-link').click();

    await expect
      .element(screen.getByTestId('help-article-title'))
      .toHaveTextContent('Getting started');
  });

  it('opens an FAQ search hit on the FAQ page with that answer expanded', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'search', search: 'withdraw' });

    const hit = screen.getByTestId('help-search-result').first();
    await expect.element(hit).toHaveAttribute('data-help-type', 'faq');
    await hit.click();

    await expect
      .element(screen.getByRole('region', { name: 'Can I edit a submitted demand?' }))
      .toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'Where do I start?' }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('says when the app has no FAQs', async () => {
    mocks.json.mockImplementation(async (path: string) =>
      path.includes('/faqs') ? { value: [] } : serveHelp(path),
    );
    const screen = await render(<HelpSideSheet />);

    openHelp({ page: 'faqs' });

    await expect.element(screen.getByTestId('help-faqs-empty')).toBeVisible();
  });

  it('refetches the article each time help is reopened', async () => {
    const screen = await render(<HelpSideSheet />);
    openHelp({ page: 'article', articleId: 'getting-started' });
    await expect
      .element(screen.getByTestId('help-article-title'))
      .toHaveTextContent('Getting started');

    mocks.json.mockImplementation(async (path: string) =>
      path.endsWith('/articles')
        ? { value: [] }
        : { id: '1', slug: 'getting-started', title: 'Edited' },
    );
    openHelp({ page: 'article', articleId: 'getting-started' });

    await expect.element(screen.getByTestId('help-article-title')).toHaveTextContent('Edited');
  });

  it('closes the panel on Escape', async () => {
    const screen = await render(<HelpSideSheet />);
    openHelp({ page: 'release-notes' });
    await expect.element(screen.getByTestId('help-unsupported')).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await expect.element(screen.getByTestId('help-sidesheet')).not.toBeInTheDocument();
  });

  it('ignores malformed help events', async () => {
    const screen = await render(<HelpSideSheet />);

    openHelp('article');

    expect(screen.container.querySelector('[data-testid="help-sidesheet"]')).toBeNull();
  });
});
