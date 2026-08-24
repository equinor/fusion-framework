import type { ServiceOverrides } from '@equinor/fusion-openapi-mock-server/discovery';

/** Fixed value for `Greeting.message` in `./my-api.openapi.json`, so the Playwright test can assert on it. */
export default {
  components: {
    Greeting: {
      message: () => 'Hello from the mock server!',
    },
  },
} satisfies ServiceOverrides;
