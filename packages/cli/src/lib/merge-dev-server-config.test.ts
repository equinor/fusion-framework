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
    expect(templateEnv.serviceWorker?.resources.map(({ url }) => url)).toEqual([
      '/default-resource',
      '/custom-resource',
    ]);
    expect(templateEnv.serviceDiscovery?.scopes).toEqual(['existing-scope', 'custom-scope']);
    expect(result.api.routes?.map(({ match }) => match)).toEqual([
      '/default-route',
      '/custom-route',
    ]);
    expect(result.api.routes?.[0]?.middleware).toBe(replacementMiddleware);
  });

  it('keeps base values for undefined overrides', () => {
    const result = mergeDevServerConfig(base, {
      api: { serviceDiscoveryUrl: undefined },
    });

    expect(result.api.serviceDiscoveryUrl).toBe('/default-discovery');
  });

  it('preserves explicit null overrides', () => {
    const overrides = {
      api: { serviceDiscoveryUrl: null },
    } as unknown as RecursivePartial<DevServerOptions>;

    const result = mergeDevServerConfig(base, overrides);

    expect(result.api.serviceDiscoveryUrl).toBeNull();
  });
});
