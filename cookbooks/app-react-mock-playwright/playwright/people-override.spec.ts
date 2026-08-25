import { expect, test } from '@playwright/test';

const PEOPLE_PATH = '/apps/fusion-framework-cookbook-app-react-mock-playwright/people';

test('renders a person name merged by mocks/people.mock.ts', async ({
  page,
}) => {
  await page.goto(PEOPLE_PATH);

  await expect(page.getByTestId('person-name')).toHaveText('Response: Jane Doe');
});
