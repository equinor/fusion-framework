import { expect, test } from '@playwright/test';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';
const APP_PATH = `/apps/fusion-framework-cookbook-app-react-context/${PROJECT_ID}`;
const CONTEXT_SERVICE_URL = 'http://localhost:4011/context';

test('generates stable context entities from their requested UUID', async ({ request }) => {
  const firstResponse = await request.get(`${CONTEXT_SERVICE_URL}/contexts/${PROJECT_ID}`);
  const secondResponse = await request.get(`${CONTEXT_SERVICE_URL}/contexts/${PROJECT_ID}`);
  const missingResponse = await request.get(`${CONTEXT_SERVICE_URL}/contexts/missing`);

  const firstContext = await firstResponse.json();
  await expect(secondResponse.json()).resolves.toEqual(firstContext);
  expect(firstContext).toMatchObject({
    id: PROJECT_ID,
    type: { id: 'ProjectMaster' },
  });
  expect(missingResponse.status()).toBe(404);
});

test('generates stable related contexts from the source UUID', async ({ request }) => {
  const relationsUrl = `${CONTEXT_SERVICE_URL}/contexts/${PROJECT_ID}/relations`;
  const firstResponse = await request.get(relationsUrl);
  const secondResponse = await request.get(relationsUrl);

  const firstRelations = await firstResponse.json();
  await expect(secondResponse.json()).resolves.toEqual(firstRelations);
  expect(firstRelations).toMatchObject([
    { type: { id: 'Facility' } },
    { type: { id: 'Discipline' } },
  ]);
});

test('renders the context inspection sections', async ({ page }) => {
  await page.goto(APP_PATH);

  await expect(page.getByRole('heading', { name: 'Current Context:' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Related Context:' })).toBeVisible();
});

test('resolves current and related contexts from the mocked context service', async ({ page }) => {
  await page.goto(APP_PATH);

  const currentContext = page
    .getByRole('heading', { name: 'Current Context:' })
    .locator('..')
    .locator('pre');
  const relatedContext = page
    .getByRole('heading', { name: 'Related Context:' })
    .locator('..')
    .locator('pre');

  await expect(currentContext).toContainText(PROJECT_ID);
  await expect(currentContext).toContainText('ProjectMaster');
  await expect(relatedContext).toContainText('Facility');
  await expect(relatedContext).toContainText('Discipline');
});

test('matches the context inspection visual baseline', async ({ page }) => {
  await page.goto(APP_PATH);

  const contextInspection = page.getByTestId('context-inspection');
  await expect(contextInspection).toContainText(PROJECT_ID);
  await expect(contextInspection).toContainText('Discipline');

  await page.addStyleTag({
    content: '[data-testid="context-inspection"] { min-height: 900px; }',
  });
  await expect(contextInspection).toHaveScreenshot('context-inspection.png');
});
