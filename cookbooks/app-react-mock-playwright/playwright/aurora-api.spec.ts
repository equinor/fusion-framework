import { expect, test } from '@playwright/test';

const AURORA_PATH = '/apps/fusion-framework-cookbook-app-react-mock-playwright/aurora';

test('renders data from a new pre-production discovery service', async ({ page }) => {
  await page.goto(AURORA_PATH);

  await expect(page.getByTestId('aurora-forecast')).toHaveText(
    'Response: Aurora activity over North Sea: High',
  );
});
