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

  await app.getByRole('button', { name: 'Claim' }).click();
  await expect(app).toContainText('Reports / Reports.Export');
  await expect(app).toContainText('No claimable roles.');
  await expect(app.getByRole('button', { name: 'Claim' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Nikita Crist' }).click();
  await page.getByRole('button', { name: 'My Roles' }).click();
  await page.getByRole('progressbar', { name: 'Loading roles' }).waitFor({ state: 'hidden' });
  await page.getByRole('tab', { name: 'Claimable' }).click();
  await page.getByLabel('Deactivate Reports exporter').click();
  await page.getByRole('progressbar', { name: 'Loading roles' }).waitFor({ state: 'hidden' });
  await page.getByRole('tab', { name: 'Expired' }).click();
  await expect(page.getByLabel('Re-activate Reports exporter')).toBeVisible();
  await expect(app.getByRole('heading', { name: 'Fusion Roles V2' })).toBeVisible();
});
