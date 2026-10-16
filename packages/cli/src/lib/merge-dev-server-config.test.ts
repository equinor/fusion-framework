import { describe, expect, it } from 'vitest';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import type { RecursivePartial } from './utils/types.js';
import { mergeDevServerConfig } from './merge-dev-server-config.js';

const base: DevServerOptions = {
  spa: {
    templateEnv: {
      title: 'Default title',
      serviceDiscovery: { url: '/default-discovery', scopes: ['existing-scope'] },
      serviceWorker: {
        resources: [{ url: '/default-resource' }],
      },
    },
  },
  api: {
    serviceDiscoveryUrl: '/default-discovery',
    routes: [{ match: '/default-route', middleware: () => undefined }],
  },
};

describe('mergeDevServerConfig', () => {
  it('appends non-route arrays and merges routes by match', () => {
    /** Replaces the handler for a duplicate route key. */
    const replacementMiddleware = () => undefined;
    const result = mergeDevServerConfig(base, {
      spa: {
        templateEnv: {
          serviceDiscovery: { scopes: ['existing-scope', 'custom-scope'] },
          serviceWorker: {
            resources: [{ url: '/custom-resource' }],
          },
        },
      },
      api: {
        routes: [
          { match: '/default-route', middleware: replacementMiddleware },
          { match: '/custom-route', middleware: () => undefined },
        ],
      },
    });

    const templateEnv = result.spa?.templateEnv;
    // Config fixtures intentionally use object-valued template environments.
    if (!templateEnv || typeof templateEnv === 'function') {
      throw new Error('Expected the merged template environment to be an object');
    }
    expect(
      templateEnv.serviceWorker?.resources
        // Compare resource paths without including scope values in this assertion.
        .map(({ url }) => url),
    ).toEqual(['/default-resource', '/custom-resource']);
    expect(templateEnv.serviceDiscovery?.scopes).toEqual(['existing-scope', 'custom-scope']);
    expect(
      result.api.routes
        // Compare route keys to verify matching overrides keep their original order.
        ?.map(({ match }) => match),
    ).toEqual(['/default-route', '/custom-route']);
    expect(result.api.routes?.[0]?.middleware).toBe(replacementMiddleware);
  });

  it('keeps base values for undefined overrides', () => {
    const result = mergeDevServerConfig(base, {
      api: { serviceDiscoveryUrl: undefined },
    });

    expect(result.api.serviceDiscoveryUrl).toBe('/default-discovery');
  });

  it('preserves explicit null overrides', () => {
    // Inject null to exercise runtime validation for values excluded by the TypeScript contract.
    const overrides = {
      api: { serviceDiscoveryUrl: null },
    } as unknown as RecursivePartial<DevServerOptions>;

    const result = mergeDevServerConfig(base, overrides);

    expect(result.api.serviceDiscoveryUrl).toBeNull();
  });

  it('preserves shared resource references for Set-based deduplication', () => {
    const resource = { url: '/shared-resource' };
    const config: DevServerOptions = {
      api: { serviceDiscoveryUrl: '/default-discovery' },
      spa: { templateEnv: { serviceWorker: { resources: [resource] } } },
    };

    const result = mergeDevServerConfig(config, {
      spa: { templateEnv: { serviceWorker: { resources: [resource] } } },
    });
    const templateEnv = result.spa?.templateEnv;

    // Object-valued template configuration keeps its shared resource identity.
    if (!templateEnv || typeof templateEnv === 'function') {
      throw new Error('Expected the merged template environment to be an object');
    }
    expect(templateEnv.serviceWorker?.resources).toHaveLength(1);
    expect(templateEnv.serviceWorker?.resources[0]).toBe(resource);
  });

  it('keeps malformed route entries for schema validation', () => {
    // Inject null so merging can be checked before runtime schema validation.
    const overrides = {
      api: { routes: [null] },
    } as unknown as RecursivePartial<DevServerOptions>;

    const result = mergeDevServerConfig(base, overrides);

    expect(result.api.routes).toEqual([...(base.api.routes ?? []), null]);
  });
});
