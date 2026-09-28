import { describe, expect, it } from 'vitest';

import type { ServiceMockDefinition } from '../discovery/discover-services.js';
import { resolveServiceDiscovery } from '../server/resolve-service-discovery.js';

const schema = {
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0.0' },
  paths: {},
};

/**
 * Creates the smallest complete definition needed to exercise discovery behavior.
 *
 * @param key - Service discovery key.
 * @param serviceDiscovery - Local discovery behavior under test.
 * @returns A complete mock service definition.
 */
function service(
  key: string,
  serviceDiscovery: ServiceMockDefinition['serviceDiscovery'],
): ServiceMockDefinition {
  return { key, serviceDiscovery, document: schema };
}

describe('resolveServiceDiscovery', () => {
  it('hides direct services and advertises merged, new, and replaced local definitions', () => {
    expect(
      resolveServiceDiscovery(
        [
          service('hidden', false),
          service('people', 'merge'),
          service('aurora-api', 'new'),
          service('local', 'replace'),
        ],
        '4010',
      ),
    ).toEqual([
      { key: 'people', uri: 'http://people.localhost:4010' },
      { key: 'aurora-api', uri: 'http://aurora-api.localhost:4010' },
      { key: 'local', uri: 'http://local.localhost:4010' },
    ]);
  });

  it('advertises configured OAuth scopes without adding them to anonymous services', () => {
    const authenticated = {
      ...service('rolesv2', 'merge'),
      scopes: ['rolesv2/.default'],
    };

    expect(resolveServiceDiscovery([authenticated, service('people', 'merge')], '4010')).toEqual([
      {
        key: 'rolesv2',
        uri: 'http://rolesv2.localhost:4010',
        scopes: ['rolesv2/.default'],
      },
      { key: 'people', uri: 'http://people.localhost:4010' },
    ]);
  });
});
