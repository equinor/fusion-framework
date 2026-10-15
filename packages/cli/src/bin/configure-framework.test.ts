import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';

import { configureFramework } from './configure-framework.js';
import { defaultHeaders } from './utils/default-headers.js';

describe('configureFramework request identification', () => {
  let server: Server | undefined;

  afterEach(async () => {
    await new Promise((resolve) => (server ? server.close(resolve) : resolve(undefined)));
  });

  /** Starts a local service discovery stand-in that records the headers of the last request. */
  const startDiscovery = async (): Promise<{ url: string; received: IncomingHttpHeaders[] }> => {
    const received: IncomingHttpHeaders[] = [];
    server = createServer((req, res) => {
      received.push(req.headers);
      res.setHeader('content-type', 'application/json');
      res.end('[]');
    });
    await new Promise<void>((resolve) => server?.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    return { url: `http://127.0.0.1:${port}`, received };
  };

  it('sends the CLI identification headers on service discovery requests', async () => {
    const discovery = await startDiscovery();
    const framework = await configureFramework({
      auth: { token: 'static-test-token' },
      serviceDiscovery: { url: discovery.url },
    }).initialize();

    await framework.http.createClient('service_discovery').fetch('/');

    expect(discovery.received).toHaveLength(1);
    expect(discovery.received[0]['x-fusion-cli-name']).toBe(defaultHeaders['X-Fusion-CLI-Name']);
    expect(discovery.received[0]['x-fusion-cli-version']).toBe(
      defaultHeaders['X-Fusion-CLI-Version'],
    );
    expect(discovery.received[0]['user-agent']).toBe(defaultHeaders['User-Agent']);
    // Identification must not displace the authentication added by the same pipeline
    expect(discovery.received[0].authorization).toBe('Bearer static-test-token');
  });

  it('identifies requests from any other client created by the framework', async () => {
    const discovery = await startDiscovery();
    const configurator = configureFramework({
      auth: { token: 'static-test-token' },
      serviceDiscovery: { url: discovery.url },
    });
    const framework = await configurator.initialize();

    await framework.http.createClient({ baseUri: discovery.url }).fetch('/');

    expect(discovery.received[0]['x-fusion-cli-name']).toBe(defaultHeaders['X-Fusion-CLI-Name']);
  });
});
