import { expect, test } from '@playwright/test';

const APP_PATH = '/apps/fusion-framework-cookbook-app-react-roles';

test('recovers the application after claiming its required role', async ({ page }) => {
  await page.goto(APP_PATH);

  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Fusion developer team member');
  await page.getByRole('button', { name: 'Claim' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Claim' }).click();

  const app = page.getByRole('main');
  await expect(app.getByRole('heading', { name: 'Fusion Roles V2' })).toBeVisible();
  await expect(app).toContainText('Fusion Apps / Fusion.Apps.FullControl');
  await expect(app).toContainText('ProView / ProView.Admin.DevOps');
  await expect(app).toContainText('Reports exporter');

  await expect(app).toHaveScreenshot('roles-app.png');

  const reportExporter = app.getByRole('listitem').filter({ hasText: 'Reports exporter' });
  await reportExporter.getByRole('button', { name: 'Claim' }).click();
  await expect(app).toContainText('Reports / Reports.Export');
  await expect(reportExporter).toHaveCount(0);

  await page.getByRole('button', { name: 'Nikita Crist' }).click();
  await page.getByRole('button', { name: 'My Roles' }).click();
  await page
    .getByRole('progressbar', { name: 'Loading role assignments' })
    .waitFor({ state: 'hidden' });
  await page.getByRole('tab', { name: 'Claimable' }).click();
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/deactivate') &&
        response.ok(),
    ),
    page.getByLabel('Deactivate Reports exporter').click(),
  ]);
  await page.getByRole('tab', { name: 'Expired' }).click();
  await expect(page.getByLabel('Re-activate Reports exporter')).toBeVisible();
  await expect(app.getByRole('heading', { name: 'Fusion Roles V2' })).toBeVisible();
});

test('renders scoped and duplicate active assignments after refresh', async ({ page }) => {
  const role = { systemName: 'Reports', accessRoleName: 'Reports.Read' };
  const first = { ...role, scope: { type: 'project', isGlobal: false, values: ['A'] } };
  const second = { ...role, scope: { type: 'project', isGlobal: false, values: ['B'] } };
  let assignments = [first, second, first];
  // Isolate this reconciliation scenario from server mutation state and satisfy the app gate.
  await page.route('**/active-access-role-assignments*', (route) =>
    route.fulfill({
      json: [{ systemName: 'ProView', accessRoleName: 'ProView.Admin.DevOps' }, ...assignments],
    }),
  );
  await page.goto(APP_PATH);
  // Inspect only the scoped assignments, not the access role used to satisfy the app gate.
  const rows = page.getByRole('main').getByRole('listitem').filter({ hasText: 'Reports.Read' });
  await expect(rows).toHaveCount(3);

  assignments = [second];
  // The cookbook intentionally replaces its lists with loading UI during collection refresh.
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(rows).toHaveCount(1);
});
