import { expect, test } from '@playwright/test';

const APP_PATH = '/apps/fusion-framework-cookbook-app-react-mock-playwright';

test('renders a greeting fetched from the mock server', async ({ page }) => {
  await page.goto(APP_PATH);

  await expect(page.getByTestId('greeting')).toHaveText(
    'Response: Hello from the mock server!',
  );
});
