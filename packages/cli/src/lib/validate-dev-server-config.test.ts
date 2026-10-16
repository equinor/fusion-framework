import { describe, expect, it } from 'vitest';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import { validateDevServerConfig } from './validate-dev-server-config.js';

const validConfig: DevServerOptions = {
  api: { serviceDiscoveryUrl: '/services' },
  spa: {
    templateEnv: {
      msal: {
        clientId: 'client-id',
        tenantId: 'tenant-id',
        redirectUri: '/',
        requiresAuth: 'true',
      },
    },
  },
};

describe('validateDevServerConfig', () => {
  it('reports nested proxy target errors from the matching route branch', () => {
    // Inject a numeric target to exercise validation beyond the declared option type.
    const config = {
      ...validConfig,
      api: {
        ...validConfig.api,
        routes: [{ match: '/api', proxy: { target: 42 } }],
      },
    } as unknown as DevServerOptions;

    expect(() => validateDevServerConfig(config)).toThrow(
      /api\.routes\.0\.proxy\.target: Proxy target must be a non-empty URL\./,
    );
  });

  it('reports nested MSAL errors from the object template branch', () => {
    // Inject a numeric client ID to exercise the nested runtime validation diagnostic.
    const config = {
      ...validConfig,
      spa: {
        templateEnv: {
          msal: {
            clientId: 42,
            tenantId: 'tenant-id',
            redirectUri: '/',
            requiresAuth: 'true',
          },
        },
      },
    } as unknown as DevServerOptions;

    expect(() => validateDevServerConfig(config)).toThrow(
      /spa\.templateEnv\.msal\.clientId: MSAL client ID must be a string\./,
    );
  });
});
