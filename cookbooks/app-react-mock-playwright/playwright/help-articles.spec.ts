import { expect, test } from '@playwright/test';

const APP_PATH = '/apps/fusion-framework-cookbook-app-react-mock-playwright';
const HELP_PATH = `${APP_PATH}/help`;

/** Each page's info icon must open the article that explains that page. */
const PAGE_HELP = [
  { path: '', button: 'Help: Direct-only app service', title: 'Direct-only app service' },
  {
    path: '/people',
    button: 'Help: Existing service override',
    title: 'Existing service override',
  },
  { path: '/aurora', button: 'Help: Pre-production service', title: 'Pre-production service' },
  { path: '/help', button: 'Help: Getting started', title: 'Getting started with mocked services' },
];

// `ffc mock-server` auto-detects `docs/articles` and serves it as the `help` service; the dev
// portal opens its help panel when the app calls `useHelpCenter()`.
test('opens the matching help article from local docs', async ({ page }) => {
  await page.goto(HELP_PATH);

  await page.getByRole('button', { name: 'Open help article', exact: true }).click();

  await expect(page.getByTestId('help-article-title')).toHaveText(
    'Getting started with mocked services',
  );
  await expect(page.getByTestId('help-article-content')).toContainText(
    'This article is served by ffc mock-server',
  );
});

test('shows not found when the app links to a missing article', async ({ page }) => {
  await page.goto(HELP_PATH);

  await page.getByRole('button', { name: 'Open missing help article' }).click();

  await expect(page.getByTestId('help-not-found')).toContainText('renamed-or-deleted-article');
});

test('lists FAQs, expands an answer, and opens its linked article', async ({ page }) => {
  await page.goto(HELP_PATH);

  await page.getByRole('button', { name: 'Open help FAQs' }).click();

  const faqs = page.getByRole('list', { name: 'Frequently asked questions' });
  await expect(faqs.getByTestId('help-faq-question')).toHaveText([
    'Why does the app talk to a mock server?',
    'Which serviceDiscovery mode should my mock use?',
    'How do I update a help article or FAQ?',
  ]);

  await faqs
    .getByRole('button', { name: 'Which serviceDiscovery mode should my mock use?' })
    .click();
  const answer = page.getByRole('region', {
    name: 'Which serviceDiscovery mode should my mock use?',
  });
  await expect(answer).toContainText('The service is not registered yet');

  await answer.getByRole('button', { name: 'Read the article' }).click();
  await expect(page.getByTestId('help-article-title')).toHaveText('Existing service override');
});

test('finds an FAQ through search', async ({ page }) => {
  await page.goto(HELP_PATH);
  await page.getByRole('button', { name: 'Open help center' }).click();
  await page
    .getByRole('navigation', { name: 'Help navigation' })
    .getByRole('button', { name: 'Search' })
    .click();

  await page.getByRole('searchbox', { name: 'Search help' }).fill('restart');
  await page
    .getByTestId('help-search-result')
    .and(page.locator('[data-help-type="faq"]'))
    .first()
    .click();

  await expect(
    page.getByRole('region', { name: 'How do I update a help article or FAQ?' }),
  ).toBeVisible();
});

// One test per page, so a failure names the page whose help wiring broke.
for (const { path, button, title } of PAGE_HELP) {
  test(`info icon on "${path || '/'}" opens its help article`, async ({ page }) => {
    await page.goto(`${APP_PATH}${path}`);

    await page.getByRole('button', { name: button }).click();

    await expect(page.getByTestId('help-article-title')).toHaveText(title);
  });
}

test('switches article when another info icon is clicked', async ({ page }) => {
  await page.goto(`${APP_PATH}/people`);
  await page.getByRole('button', { name: 'Help: Existing service override' }).click();
  await expect(page.getByTestId('help-article-title')).toHaveText('Existing service override');

  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Pre-production service' }).click();
  await page.getByRole('button', { name: 'Help: Pre-production service' }).click();

  await expect(page.getByTestId('help-article-title')).toHaveText('Pre-production service');
});

test('browses every help article from the help center sidebar', async ({ page }) => {
  await page.goto(HELP_PATH);
  await page.getByRole('button', { name: 'Open help center' }).click();

  const sidebar = page.getByRole('navigation', { name: 'Help navigation' });
  const articles = sidebar.getByTestId('help-nav-article');
  await expect(articles).toHaveText([
    'Getting started with mocked services',
    'Direct-only app service',
    'Existing service override',
    'Pre-production service',
  ]);

  // Visit each sidebar entry the way a person or synthetic agent would browse help.
  for (const title of await articles.allTextContents()) {
    await sidebar.getByRole('button', { name: title }).click();
    await expect(page.getByTestId('help-article-title')).toHaveText(title);
    await expect(sidebar.getByRole('button', { name: title })).toHaveAttribute(
      'aria-current',
      'page',
    );
  }
});

test('shows production-only help pages from the sidebar as not supported', async ({ page }) => {
  await page.goto(HELP_PATH);
  await page.getByRole('button', { name: 'Open help center' }).click();

  await page.getByTestId('help-nav-release-notes').click();

  await expect(page.getByTestId('help-unsupported')).toContainText('Release Notes');
});

test('searches help articles and opens a hit', async ({ page }) => {
  await page.goto(HELP_PATH);
  await page.getByRole('button', { name: 'Open help center' }).click();

  await page
    .getByRole('navigation', { name: 'Help navigation' })
    .getByRole('button', { name: 'Search' })
    .click();
  await page.getByRole('searchbox', { name: 'Search help' }).fill('merge');

  const results = page
    .getByRole('list', { name: 'Search results' })
    .getByTestId('help-search-result');
  // `merge` appears in one article and one FAQ; both are search hits.
  await expect(results).toHaveCount(2);
  await results.and(page.locator('[data-help-type="article"]')).click();

  await expect(page.getByTestId('help-article-title')).toHaveText('Existing service override');
});

test('opens search prefilled from openSearch(term)', async ({ page }) => {
  await page.goto(HELP_PATH);

  await page.getByRole('button', { name: 'Search help for service discovery' }).click();

  await expect(page.getByRole('searchbox', { name: 'Search help' })).toHaveValue(
    'service discovery',
  );
  await expect(page.getByTestId('help-search-result').first()).toBeVisible();
});
