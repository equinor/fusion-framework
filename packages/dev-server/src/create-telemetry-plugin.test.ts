import { createServer as createHttpServer, type Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServer, resolveConfig, type ViteDevServer } from 'vite';
import { ConsoleLogger } from '@equinor/fusion-log';
import { createTelemetryPlugin } from './create-telemetry-plugin.js';

const servers: Array<Server | ViteDevServer> = [];
const route = '/@fusion-telemetry/v1/logs';

/** Closes ephemeral servers so tests never leave listeners running. */
afterEach(async () => {
  // Release every listener even when an assertion fails.
  for (const server of servers.splice(0)) {
    // Vite and Node expose different server shutdown contracts.
    if ('middlewares' in server) {
      await server.close();
    } else {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      });
    }
  }
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

/**
 * Starts a minimal Vite server with only the telemetry route.
 * @param logger - Logger used to observe collector failures.
 * @returns The listening server's origin.
 */
async function startServer(logger: ConsoleLogger): Promise<string> {
  const server = await createServer({
    configFile: false,
    plugins: [createTelemetryPlugin(logger)],
    server: { host: '127.0.0.1', port: 0 },
    optimizeDeps: { noDiscovery: true },
  });
  servers.push(server);
  await server.listen();
  const address = server.httpServer?.address();
  // Ephemeral TCP addresses keep tests independent of occupied local ports.
  if (!address || typeof address === 'string') {
    throw new Error('Expected a listening TCP server');
  }
  return `http://127.0.0.1:${address.port}`;
}

/**
 * Starts a collector that records JSON request bodies.
 * @param status - Collector response status.
 * @param bodies - Collected payloads.
 * @param paths - Optional collection of requested signal paths.
 * @returns Collector logs endpoint.
 */
async function startCollector(status: number, bodies: string[], paths?: string[]): Promise<string> {
  const server = createHttpServer(async (request, response) => {
    const chunks: Buffer[] = [];
    // Preserve the full body regardless of network chunk boundaries.
    for await (const chunk of request) {
      chunks.push(Buffer.from(chunk));
    }
    bodies.push(Buffer.concat(chunks).toString('utf8'));
    paths?.push(request.url ?? '');
    response.writeHead(status, { 'content-type': 'application/json' });
    response.end('{}');
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  // The test needs a TCP endpoint, not a Unix socket.
  if (!address || typeof address === 'string') {
    throw new Error('Expected a listening TCP collector');
  }
  return `http://127.0.0.1:${address.port}/v1/logs`;
}

describe('dev-server OTLP environment', () => {
  it('leaves browser telemetry disabled when the environment variable is unset', async () => {
    vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', '');
    const config = await resolveConfig(
      { configFile: false, plugins: [createTelemetryPlugin(new ConsoleLogger('test'))] },
      'serve',
    );
    expect(config.define?.['import.meta.env.FUSION_SPA_TELEMETRY_OTLP_ENDPOINT']).toBe('""');
    const origin = await startServer(new ConsoleLogger('test'));
    expect((await fetch(`${origin}${route}`, { method: 'POST', body: '{}' })).status).toBe(404);
  });

  it('enables the same-origin route and forwards OTLP JSON to the exact endpoint', async () => {
    const bodies: string[] = [];
    vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', await startCollector(200, bodies));
    const config = await resolveConfig(
      { configFile: false, plugins: [createTelemetryPlugin(new ConsoleLogger('test'))] },
      'serve',
    );
    expect(config.define?.['import.meta.env.FUSION_SPA_TELEMETRY_OTLP_ENDPOINT']).toBe(
      JSON.stringify(route),
    );
    const origin = await startServer(new ConsoleLogger('test'));
    const response = await fetch(`${origin}${route}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"resourceLogs":[]}',
    });
    expect(response.status).toBe(200);
    expect(bodies).toEqual(['{"resourceLogs":[]}']);
    const bootstrap = await fetch(`${origin}/@vite/client`);
    expect(bootstrap.ok).toBe(true);
  });

  it('does not read or inject the endpoint during production builds', async () => {
    vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', 'not even a valid URL');
    const config = await resolveConfig(
      { configFile: false, plugins: [createTelemetryPlugin(new ConsoleLogger('test'))] },
      'build',
    );
    expect(config.define?.['import.meta.env.FUSION_SPA_TELEMETRY_OTLP_ENDPOINT']).toBeUndefined();
    // Serve-only hooks must not survive production plugin resolution.
    const hasTelemetryPlugin = config.plugins.some(
      (plugin) => plugin.name === 'fusion-dev-server-telemetry',
    );
    expect(hasTelemetryPlugin).toBe(false);
  });

  it('rejects invalid collector protocols and embedded credentials', async () => {
    // Transport and credential rejection both enforce the endpoint contract.
    for (const endpoint of ['file:///tmp/logs', 'http://user:password@localhost/v1/logs']) {
      vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', endpoint);
      await expect(
        resolveConfig(
          { configFile: false, plugins: [createTelemetryPlugin(new ConsoleLogger('test'))] },
          'serve',
        ),
      ).rejects.toThrow('must be an HTTP(S) URL without credentials');
    }
  });

  it('reports an unreachable collector once and leaves the dev server responsive', async () => {
    const collector = await startCollector(200, []);
    const closedServer = servers.pop();
    // Remove the collector from cleanup before explicitly closing its endpoint.
    if (!closedServer || 'middlewares' in closedServer) {
      throw new Error('Expected a collector');
    }
    await new Promise<void>((resolve) => closedServer.close(() => resolve()));
    vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', collector);
    const logger = new ConsoleLogger('test');
    const error = vi.spyOn(logger, 'error').mockImplementation(() => {});
    const origin = await startServer(logger);
    // Repeated failures must not generate repeated terminal errors.
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch(`${origin}${route}`, { method: 'POST', body: '{}' });
      expect(response.status).toBe(502);
    }
    expect(error).toHaveBeenCalledTimes(1);
    expect((await fetch(`${origin}/@vite/client`)).ok).toBe(true);
  });

  it('reports collector HTTP errors once and rejects unsupported methods', async () => {
    vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', await startCollector(503, []));
    const logger = new ConsoleLogger('test');
    const error = vi.spyOn(logger, 'error').mockImplementation(() => {});
    const origin = await startServer(logger);
    expect((await fetch(`${origin}${route}`)).status).toBe(405);
    // HTTP errors share the same once-only reporting behavior as connection errors.
    for (let attempt = 0; attempt < 2; attempt++) {
      expect((await fetch(`${origin}${route}`, { method: 'POST', body: '{}' })).status).toBe(502);
    }
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('accepts at most one MiB without forwarding oversized payloads', async () => {
    const bodies: string[] = [];
    vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', await startCollector(200, bodies));
    const origin = await startServer(new ConsoleLogger('test'));
    expect(
      (await fetch(`${origin}${route}`, { method: 'POST', body: 'x'.repeat(1_048_576) })).status,
    ).toBe(200);
    expect(
      (await fetch(`${origin}${route}`, { method: 'POST', body: 'x'.repeat(1_048_577) })).status,
    ).toBe(413);
    expect(bodies).toHaveLength(1);
  });

  it('routes logs and traces to the bare collector origin without a doubled slash', async () => {
    const paths: string[] = [];
    const collector = await startCollector(200, [], paths);
    vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', collector.replace('/v1/logs', ''));
    const origin = await startServer(new ConsoleLogger('test'));
    expect((await fetch(`${origin}${route}`, { method: 'POST', body: '{}' })).status).toBe(200);
    expect(
      (await fetch(`${origin}/@fusion-telemetry/v1/traces`, { method: 'POST', body: '{}' })).status,
    ).toBe(200);
    expect(paths).toEqual(['/v1/logs', '/v1/traces']);
  });

  it('routes logs and traces from one collector base URL', async () => {
    const paths: string[] = [];
    const collector = await startCollector(200, [], paths);
    vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', collector.replace('/v1/logs', '/tenant/'));
    const origin = await startServer(new ConsoleLogger('test'));
    expect((await fetch(`${origin}${route}`, { method: 'POST', body: '{}' })).status).toBe(200);
    expect(
      (await fetch(`${origin}/@fusion-telemetry/v1/traces`, { method: 'POST', body: '{}' })).status,
    ).toBe(200);
    expect(paths).toEqual(['/tenant/v1/logs', '/tenant/v1/traces']);
    expect(
      (await fetch(`${origin}/@fusion-telemetry/not-a-signal`, { method: 'POST', body: '{}' }))
        .status,
    ).toBe(404);
  });
});
