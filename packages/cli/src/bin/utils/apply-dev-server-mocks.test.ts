import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';

import { describe, expect, it } from 'vitest';

import type { DevServerOptions, FusionService } from '@equinor/fusion-framework-dev-server';
import { applyDevServerMocks } from './apply-dev-server-mocks.js';

describe('applyDevServerMocks', () => {
  it('replaces real services by key and preserves configured API routes', () => {
    const existingRoute = { match: '/existing', middleware: (): void => undefined };
    const config: DevServerOptions = {
      api: {
        serviceDiscoveryUrl: 'https://discovery.example',
        routes: [existingRoute],
        processServices: (data) => ({ data }),
      },
    };
    const result = applyDevServerMocks(config, [
      {
        key: 'foo',
        name: 'Local foo',
        uri: 'http://foo.localhost:4010',
        serviceDiscovery: 'replace',
      },
    ]);

    const processed = result.api.processServices?.(
      [
        { key: 'foo', name: 'Real foo', uri: 'https://foo.example' },
        { key: 'bar', name: 'Real bar', uri: 'https://bar.example' },
      ],
      { route: '/@fusion-api', request: new IncomingMessage(new Socket()) },
    );

    expect(processed?.data as FusionService[]).toEqual([
      { key: 'bar', name: 'Real bar', uri: 'https://bar.example' },
      { key: 'foo', name: 'Local foo', uri: 'http://foo.localhost:4010' },
    ]);
    expect(result.api.routes).toEqual([existingRoute]);
  });

  it('rejects a new mock when upstream discovery already contains its key', () => {
    const config: DevServerOptions = {
      api: { serviceDiscoveryUrl: 'https://discovery.example' },
    };
    const result = applyDevServerMocks(config, [
      {
        key: 'foo',
        name: 'Local foo',
        uri: 'http://foo.localhost:4010',
        serviceDiscovery: 'new',
      },
    ]);

    expect(() =>
      result.api.processServices?.(
        [{ key: 'foo', name: 'Registered foo', uri: 'https://foo.example' }],
        { route: '/@fusion-api', request: new IncomingMessage(new Socket()) },
      ),
    ).toThrow(
      'Mock service "foo" is marked as new but already exists in upstream service discovery.',
    );
  });
});
