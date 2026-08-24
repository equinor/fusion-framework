import { expect, test } from '@playwright/test';

const MOCK_SERVER_URL = 'http://localhost:4010';
const APP_PATH = '/apps/fusion-framework-cookbook-app-react-mock-playwright';

test('overrides mocked responses directly from Playwright, then resets them', async ({
  page,
  request,
}) => {
  // Two independent overrides, on two different services — not just the one endpoint.
  await request.post(`${MOCK_SERVER_URL}/@fusion-mock/my-api/getGreeting`, {
    data: { mock: { message: 'Overridden from a Playwright test!' } },
  });
  await request.post(`${MOCK_SERVER_URL}/@fusion-mock/people/getPerson`, {
    data: { mock: { name: 'Overridden Person' } },
  });

  try {
    await page.goto(APP_PATH);
    await expect(page.getByTestId('greeting')).toHaveText('Overridden from a Playwright test!');
    await expect(page.getByTestId('person-name')).toHaveText('Overridden Person');
  } finally {
    await request.post(`${MOCK_SERVER_URL}/@fusion-mock/reset`);
  }
});
