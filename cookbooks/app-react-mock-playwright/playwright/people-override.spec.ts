import { expect, test } from '@playwright/test';

const APP_PATH = '/apps/fusion-framework-cookbook-app-react-mock-playwright';

test('renders a person name overridden by a mocks/people.overrides.ts sidecar', async ({
  page,
}) => {
  await page.goto(APP_PATH);

  await expect(page.getByTestId('person-name')).toHaveText('Turanga Leela');
});
