import { createMockAuth } from '@equinor/fusion-openapi-mock-server';
import { expect, test } from '@playwright/test';

const APP_PATH = '/apps/fusion-framework-cookbook-app-react-mock-playwright';
const mockAuth = createMockAuth('http://localhost:4010');

test('isolates authorization personas between browser contexts', async ({ browser }) => {
  const normalContext = await browser.newContext();
  const administratorContext = await browser.newContext();
  const normalPage = await normalContext.newPage();
  const administratorPage = await administratorContext.newPage();

  await Promise.all([
    mockAuth.setUser(normalContext.request, { userId: 'normal-user' }),
    mockAuth.setUser(administratorContext.request, {
      userId: 'administrator',
      claims: { roles: ['Demand.Admin'] },
    }),
  ]);

  await Promise.all([normalPage.goto(APP_PATH), administratorPage.goto(APP_PATH)]);

  await expect(normalPage.getByTestId('identity')).toHaveText('Authenticated as: normal-user');
  await expect(administratorPage.getByTestId('identity')).toHaveText(
    'Authenticated as: administrator',
  );

  await Promise.all([normalContext.close(), administratorContext.close()]);
});

test('switches and resets the active browser persona', async ({ context, page }) => {
  await mockAuth.setUser(context.request, { userId: 'normal-user' });
  await page.goto(APP_PATH);
  await expect(page.getByTestId('identity')).toHaveText('Authenticated as: normal-user');

  await mockAuth.setUser(context.request, { userId: 'administrator' });
  await page.reload();
  await expect(page.getByTestId('identity')).toHaveText('Authenticated as: administrator');

  await mockAuth.reset(context.request);
  await page.reload();
  await expect(page.getByTestId('identity')).toHaveText('Authenticated as: fusion-mock-user');
});
