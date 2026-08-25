import { expect, test } from '@playwright/test';

const MOCK_SERVER_URL = 'http://localhost:4010';

test('supports merged, added, and direct-only mock services', async ({ request }) => {
  const discoveryResponse = await request.get(`${MOCK_SERVER_URL}/@fusion-mock/discovery`);
  const services = (await discoveryResponse.json()) as Array<{ key: string }>;
  // Compare stable service identities without coupling the scenario to generated local URIs.
  const keys = services.map((service) => service.key);

  // `people` overrides the preset, the pre-production service is added, and `my-api` stays direct-only.
  expect(keys).toContain('people');
  expect(keys).toContain('aurora-api');
  expect(keys).not.toContain('my-api');

  const addedServiceResponse = await request.get(`${MOCK_SERVER_URL}/aurora-api/forecast`);
  await expect(addedServiceResponse.json()).resolves.toEqual({
    location: 'North Sea',
    activity: 'High',
  });
});
