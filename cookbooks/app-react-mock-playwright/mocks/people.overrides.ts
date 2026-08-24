import type { ServiceOverrides } from '@equinor/fusion-openapi-mock-server/discovery';

/**
 * Pins `getPerson`'s response, so the Playwright test has a fixed name to assert on. A `paths`
 * override registers through the same mechanism as `MockServerHandle.override()` — a `/@fusion-mock/...`
 * call still takes precedence over this baseline, unlike a `middleware` route (which always wins).
 */
export default {
  paths: {
    '/persons/{azureId}': {
      get: {
        mock: {
          name: 'Turanga Leela',
          mail: 'turanga.leela@planetexpress.com',
          upn: 'turanga.leela@planetexpress.com',
          accountType: 'Employee',
        },
      },
    },
  },
} satisfies ServiceOverrides;
