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

  it('keeps the union message when no branch is more specific than the others', () => {
    // A number fails both string and boolean branches at the same path.
    const config = {
      ...validConfig,
      spa: {
        templateEnv: {
          msal: {
            clientId: 'client-id',
            tenantId: 'tenant-id',
            redirectUri: '/',
            requiresAuth: 'true',
            mock: 42,
          },
        },
      },
    } as unknown as DevServerOptions;

    expect(() => validateDevServerConfig(config)).toThrow(
      /spa\.templateEnv\.msal\.mock: MSAL mock setting must be a string or boolean\./,
    );
  });

  it('lists every accepted shape for templateEnv values that match neither branch', () => {
    const config = { ...validConfig, spa: { templateEnv: 42 } } as unknown as DevServerOptions;

    expect(() => validateDevServerConfig(config)).toThrow(
      /spa\.templateEnv: SPA templateEnv must be an object or a function\./,
    );
  });

  it('reports the route union message for routes without middleware or proxy', () => {
    // Both route branches fail equally deep, so neither handler should be singled out.
    const config = {
      ...validConfig,
      api: { ...validConfig.api, routes: [{ match: '/api' }] },
    } as unknown as DevServerOptions;

    expect(() => validateDevServerConfig(config)).toThrow(
      /api\.routes\.0: Route must be an object with match and either middleware or proxy\./,
    );
  });

  it('accepts custom template environment keys allowed by the generic options type', () => {
    // Custom keys become FUSION_SPA_* variables, so apps may extend any template object.
    const config = {
      ...validConfig,
      spa: {
        templateEnv: {
          featureFlag: 'on',
          msal: {
            clientId: 'client-id',
            tenantId: 'tenant-id',
            redirectUri: '/',
            requiresAuth: 'true',
            authority: 'https://login.example.com',
          },
        },
      },
    } as unknown as DevServerOptions;

    const templateEnv = validateDevServerConfig(config).spa?.templateEnv as Record<
      string,
      Record<string, unknown> | string
    >;
    expect(templateEnv.featureFlag).toBe('on');
    expect(templateEnv.msal).toMatchObject({ authority: 'https://login.example.com' });
  });

  it('rejects unknown api keys so typos are reported', () => {
    const config = {
      ...validConfig,
      api: { ...validConfig.api, serviceDiscoveryURL: '/typo' },
    } as unknown as DevServerOptions;

    expect(() => validateDevServerConfig(config)).toThrow(
      /api: Unrecognized key: "serviceDiscoveryURL"/,
    );
  });
});
