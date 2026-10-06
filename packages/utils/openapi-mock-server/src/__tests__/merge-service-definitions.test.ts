import type { IncomingMessage, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';

import { describe, expect, it } from 'vitest';

import { defineService } from '../discovery/define-service.js';
import type { ServiceMockDefinition } from '../discovery/discover-services.js';
import { mergeServiceDefinitions } from '../discovery/merge-service-definitions.js';

/**
 * Sends a GET request through a merged definition's router.
 *
 * @param definition - Merged service definition.
 * @param path - Service-relative path.
 * @returns The JSON body a matched route sent, or `undefined` when no route matched.
 */
async function route(
  definition: ServiceMockDefinition | undefined,
  path: string,
): Promise<unknown> {
  let body: string | undefined;
  const req = Readable.from([]) as unknown as IncomingMessage;
  Object.assign(req, { method: 'GET', url: path, headers: {} });
  const res = {
    statusCode: 200,
    writeHead: () => res,
    end: (chunk: string) => {
      body = chunk;
    },
  } as unknown as ServerResponse;
  const handled = await definition?.router?.handle(req, res);
  // An unmatched request writes nothing, which the caller asserts as undefined.
  return handled && body !== undefined ? JSON.parse(body) : undefined;
}

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
      mergeServiceDefinitions([service('people', 'replace')], [service('people', 'new')]),
    ).toThrow('marked as new but an earlier definition already exists');
  });

  it('preserves an inherited reset hook when a merge layer is stateless', () => {
    const reset = (): void => undefined;
    const existing = { ...service('people', 'replace'), reset };
    const statelessMerge = defineService({
      key: 'people',
      serviceDiscovery: 'merge',
    });

    expect(mergeServiceDefinitions([existing], [statelessMerge])[0]?.reset).toBe(reset);
  });

  it('runs both reset hooks, earliest first, when both layers keep state', () => {
    const calls: string[] = [];
    const existing = { ...service('people', 'replace'), reset: () => calls.push('existing') };
    const merge = defineService({
      key: 'people',
      serviceDiscovery: 'merge',
      reset: () => calls.push('merge'),
    });

    mergeServiceDefinitions([existing], [merge])[0]?.reset?.();

    expect(calls).toEqual(['existing', 'merge']);
  });

  it('preserves inherited discovery scopes when a merge layer does not replace them', () => {
    const existing = {
      ...service('people', 'replace'),
      scopes: ['people/.default'],
    };
    const merge = defineService({
      key: 'people',
      serviceDiscovery: 'merge',
    });

    expect(mergeServiceDefinitions([existing], [merge])[0]?.scopes).toEqual(['people/.default']);
  });

  it('keeps the earlier middleware routes when a merge layer adds its own', async () => {
    const existing = defineService({
      key: 'people',
      serviceDiscovery: 'replace',
      schema,
      middleware: (router) => {
        router.get('/base', (_req, res) => res.json({ from: 'base' }));
        router.get('/shared', (_req, res) => res.json({ from: 'base' }));
      },
    });
    const merge = defineService({
      key: 'people',
      serviceDiscovery: 'merge',
      middleware: (router) => {
        router.get('/added', (_req, res) => res.json({ from: 'merge' }));
        router.get('/shared', (_req, res) => res.json({ from: 'merge' }));
      },
    });
    const [merged] = mergeServiceDefinitions([existing], [merge]);

    expect(await route(merged, '/base')).toEqual({ from: 'base' });
    expect(await route(merged, '/added')).toEqual({ from: 'merge' });
    expect(await route(merged, '/shared')).toEqual({ from: 'merge' });
    expect(await route(merged, '/missing')).toBeUndefined();
  });

  it('keeps the earlier router when a merge layer has no middleware', () => {
    const existing = defineService({
      key: 'people',
      serviceDiscovery: 'replace',
      schema,
      middleware: (router) => router.get('/base', (_req, res) => res.json({})),
    });
    const merge = defineService({ key: 'people', serviceDiscovery: 'merge' });

    expect(mergeServiceDefinitions([existing], [merge])[0]?.router).toBe(existing.router);
  });

  it('merges control routes by name, so a merge layer keeps inherited ones', async () => {
    const existing = defineService({
      key: 'monitor',
      serviceDiscovery: 'replace',
      schema,
      control: {
        analytics: () => ({ status: 200, body: { from: 'existing' } }),
        shared: () => ({ status: 200, body: { from: 'existing' } }),
      },
    });
    const merge = defineService({
      key: 'monitor',
      serviceDiscovery: 'merge',
      control: {
        extra: () => ({ status: 200, body: { from: 'merge' } }),
        shared: () => ({ status: 200, body: { from: 'merge' } }),
      },
    });
    const request = { method: 'GET', query: new URLSearchParams() };

    const control = mergeServiceDefinitions([existing], [merge])[0]?.control ?? {};

    expect(Object.keys(control).sort()).toEqual(['analytics', 'extra', 'shared']);
    expect(await control.analytics?.(request)).toEqual({ status: 200, body: { from: 'existing' } });
    expect(await control.shared?.(request)).toEqual({ status: 200, body: { from: 'merge' } });
  });

  it('keeps inherited control routes when a merge layer adds none', () => {
    const existing = defineService({
      key: 'monitor',
      serviceDiscovery: 'replace',
      schema,
      control: { analytics: () => ({ status: 200 }) },
    });
    const merge = defineService({ key: 'monitor', serviceDiscovery: 'merge' });

    expect(mergeServiceDefinitions([existing], [merge])[0]?.control).toEqual(existing.control);
  });
});
