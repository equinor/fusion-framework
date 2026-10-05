import { createMockAnalytics, createMockAuth } from '@equinor/fusion-openapi-mock-server';
import type { AnalyticsEventRow } from '@equinor/fusion-openapi-mock-server/presets/fusion';
import { expect, test } from '@playwright/test';

const MOCK_SERVER = 'http://localhost:4010';
const APP_ORIGIN = 'http://localhost:3000';
const APP_PATH = '/apps/fusion-framework-cookbook-app-react-mock-playwright';
const ANALYTICS_PATH = `${APP_PATH}/analytics`;

const mockAuth = createMockAuth(MOCK_SERVER);
const analytics = createMockAnalytics(MOCK_SERVER);

/** Reads the data an app tracked with `trackFeature`; only `app-feature` events carry it. */
const trackedData = (event: AnalyticsEventRow): unknown =>
  'data_body_data' in event ? JSON.parse(event.data_body_data ?? 'null') : undefined;

// A mock-auth user per test gives each browser context its own analytics session, so tests can
// run in parallel and only see the events they caused. Resetting keeps a reused user clean.
test.beforeEach(async ({ context }, testInfo) => {
  await mockAuth.setUser(context.request, { userId: `analytics-${testInfo.testId}` });
  await analytics.reset(context.request);
});

test('tracks a page view with its route', async ({ context, page }) => {
  await page.goto(`${APP_PATH}/people`);

  // The dev portal sends analytics in batches, so wait instead of reading once.
  const event = await analytics.waitFor(context.request, {
    feature: 'page-viewed',
    match: (candidate) => (trackedData(candidate) as { route?: string })?.route === '/people',
  });

  expect(event).toMatchObject({
    event_name: 'app-feature',
    data_appkey: 'fusion-framework-cookbook-app-react-mock-playwright',
    portal_id: 'dev-portal',
  });
});

test('tracks a feature with the data the app sent', async ({ context, page }) => {
  await page.goto(ANALYTICS_PATH);

  await page.getByRole('button', { name: 'Track demo feature' }).click();
  await page.getByRole('button', { name: 'Track demo feature' }).click();

  const event = await analytics.waitFor(context.request, {
    feature: 'demo-feature-tracked',
    match: (candidate) => (trackedData(candidate) as { clicks?: number })?.clicks === 2,
  });
  expect(trackedData(event)).toEqual({ clicks: 2 });
  expect(await analytics.list(context.request, { feature: 'demo-feature-tracked' })).toHaveLength(
    2,
  );
});

test('shows tracked and seeded events through the app-feature events query', async ({
  context,
  page,
}, testInfo) => {
  await page.goto(ANALYTICS_PATH);
  await page.getByRole('button', { name: 'Track demo feature' }).click();
  await analytics.waitFor(context.request, { feature: 'demo-feature-tracked' });

  await page.getByRole('button', { name: 'Refresh usage data' }).click();

  const rows = page.getByTestId('analytics-event');
  // This session's own event, read back through the same query the app would use in production.
  await expect(
    rows.filter({ hasText: `demo-feature-tracked {"clicks":1} — analytics-${testInfo.testId}` }),
  ).toHaveCount(1);
  // History loaded from mocks/analytics.seed.jsonl is visible to every session.
  await expect(rows.filter({ hasText: 'seeded-planner' })).toHaveCount(3);
  // The second seeded session is listed too.
  await expect(rows.filter({ hasText: 'seeded-reviewer' })).toHaveCount(2);
});

test('keeps the analytics of parallel browser contexts apart', async ({ browser }) => {
  const [first, second] = await Promise.all([
    browser.newContext({ baseURL: APP_ORIGIN }),
    browser.newContext({ baseURL: APP_ORIGIN }),
  ]);
  await Promise.all([
    mockAuth.setUser(first.request, { userId: 'analytics-first' }),
    mockAuth.setUser(second.request, { userId: 'analytics-second' }),
  ]);
  await Promise.all([analytics.reset(first.request), analytics.reset(second.request)]);

  const [firstPage, secondPage] = await Promise.all([first.newPage(), second.newPage()]);
  await Promise.all([firstPage.goto(`${APP_PATH}/people`), secondPage.goto(`${APP_PATH}/aurora`)]);

  const [firstView, secondView] = await Promise.all([
    analytics.waitFor(first.request, { feature: 'page-viewed' }),
    analytics.waitFor(second.request, { feature: 'page-viewed' }),
  ]);
  expect(firstView).toMatchObject({
    user_id: 'analytics-first',
    data_body_data: '{"route":"/people"}',
  });
  expect(secondView).toMatchObject({
    user_id: 'analytics-second',
    data_body_data: '{"route":"/aurora"}',
  });
  // No event of the second context leaks into the first context's session.
  expect(
    (await analytics.list(first.request)).every((event) => event.user_id === 'analytics-first'),
  ).toBe(true);

  await Promise.all([first.close(), second.close()]);
});
