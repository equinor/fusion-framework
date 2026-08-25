import { describe, expect, it } from 'vitest';

import type { ServiceMockDefinition } from '../discovery/discover-services.js';
import { mergeServiceDefinitions } from '../discovery/merge-service-definitions.js';

const schema = {
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0.0' },
  paths: {},
};

/** Creates a complete definition for testing discovery-layer ownership. */
function service(
  key: string,
  serviceDiscovery: ServiceMockDefinition['serviceDiscovery'],
): ServiceMockDefinition {
  return { key, serviceDiscovery, document: schema };
}

describe('mergeServiceDefinitions', () => {
  it('adds a new service when no earlier definition owns its key', () => {
    const definition = service('aurora-api', 'new');

    expect(mergeServiceDefinitions([definition])).toEqual([definition]);
  });

  it('rejects a new service when an earlier definition already owns its key', () => {
    expect(() =>
      mergeServiceDefinitions(
        [service('people', 'replace')],
        [service('people', 'new')],
      ),
    ).toThrow('marked as new but an earlier definition already exists');
  });
});