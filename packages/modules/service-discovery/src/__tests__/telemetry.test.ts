import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { from, switchMap, type Observable } from 'rxjs';
import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import {
  TelemetryLevel,
  type ITelemetryProvider,
  type TelemetryItem,
} from '@equinor/fusion-framework-module-telemetry';

import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import httpModule from '@equinor/fusion-framework-module-http';
import { ServiceDiscoveryClient } from '../client';
import type { ServiceDiscoveryDiagnostic } from '../ServiceDiscoveryDiagnostic';
import { ServiceDiscoveryProvider } from '../provider';
import { module } from '../module';
import type { Service } from '../types';

const sentinel = 'privacy-sentinel-71ab';

const services: Service[] = [
  {
    key: `people-${sentinel}`,
    uri: `https://${sentinel}.test`,
    scopes: [`${sentinel}/.default`],
    defaultScopes: [`${sentinel}/.default`],
  },
];

const ok = (): Response =>
  new Response(JSON.stringify(services), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const unauthorized = (): Response =>
  new Response(JSON.stringify({ error: sentinel }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });

/** Fake HTTP client replaying queued responses through the production selector. */
const createHttp = (...responses: Array<() => Response>): IHttpClient => {
  const queue = [...responses];
  const fetch$ = (_path: string, init: { selector: (res: Response) => Observable<unknown> }) =>
    from(Promise.resolve()).pipe(
      switchMap(() => {
        const next = queue.length > 1 ? queue.shift() : queue[0];
        if (!next) throw new Error('no response queued');
        return from(init.selector(next()));
      }),
    );
  return { fetch$ } as unknown as IHttpClient;
};

/** Telemetry double that keeps every record the provider would export. */
const createTelemetry = (): { telemetry: ITelemetryProvider; items: TelemetryItem[] } => {
  const items: TelemetryItem[] = [];
  const telemetry = {
    source: { source: 'framework', hostId: 'host-1' },
    track: (item: TelemetryItem) => items.push(item),
    trackEvent: (item: Omit<TelemetryItem, 'type'>) => items.push(item as TelemetryItem),
  } as unknown as ITelemetryProvider;
  return { telemetry, items };
};

describe('service discovery operational telemetry', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    vi.spyOn(Math, 'random').mockReturnValue(1);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('classifies network, cache, fallback, cooldown and unknown-key outcomes', async () => {
    const client = new ServiceDiscoveryClient({
      http: createHttp(ok, unauthorized),
      endpoint: '/services',
    });
    const diagnostics: ServiceDiscoveryDiagnostic[] = [];
    client.diagnostic$.subscribe((diagnostic) => diagnostics.push(diagnostic));

    await client.resolveServices();
    await client.resolveServices(true);
    // Expire the cache so the next refresh fails and serves the last known good list.
    vi.setSystemTime(Date.now() + 5 * 60 * 1_000 + 1);
    await expect(client.resolveServices()).resolves.toEqual(services);
    await expect(client.resolveServices()).resolves.toEqual(services);
    await expect(client.resolveService('missing')).rejects.toThrow();

    expect(
      diagnostics.map((d) => (d.type === 'resolve' ? `${d.origin}:${d.outcome}` : d.type)),
    ).toEqual([
      'network:success',
      'cache:success',
      'fallback:success',
      'fallback:success',
      'fallback:success',
      'unknown-service',
    ]);
    expect(diagnostics.every((d) => d.type !== 'resolve' || d.duration >= 0)).toBe(true);
  });

  it('reports a failed first resolution and a cooldown rejection without a network attempt', async () => {
    const client = new ServiceDiscoveryClient({ http: createHttp(unauthorized) });
    const diagnostics: ServiceDiscoveryDiagnostic[] = [];
    client.diagnostic$.subscribe((diagnostic) => diagnostics.push(diagnostic));

    await expect(client.resolveServices()).rejects.toBeDefined();
    await expect(client.resolveServices()).rejects.toBeDefined();

    expect(diagnostics).toMatchObject([
      { type: 'resolve', origin: 'network', outcome: 'failure' },
      { type: 'resolve', origin: 'cooldown', outcome: 'failure' },
    ]);
  });

  it('maps outcomes to safe records with exact counts and stops on dispose', async () => {
    const client = new ServiceDiscoveryClient({ http: createHttp(ok, unauthorized) });
    const provider = new ServiceDiscoveryProvider(
      { discoveryClient: client },
      {} as ConstructorParameters<typeof ServiceDiscoveryProvider>[1],
    );
    const { telemetry, items } = createTelemetry();
    provider.connectTelemetry(telemetry);

    await provider.resolveServices();
    await client.resolveServices(true);
    vi.setSystemTime(Date.now() + 5 * 60 * 1_000 + 1);
    await provider.resolveServices();

    expect(items.map((item) => `${item.name}:${item.diagnostic?.outcome}`)).toEqual([
      'fusion.service-discovery.resolve.duration:success',
      'fusion.service-discovery.cache-hit:success',
      'fusion.service-discovery.resolve.duration:success',
      'fusion.service-discovery.fallback:success',
    ]);
    // Cached lookups stay below the Information level hosts typically export.
    expect(items[1]?.level).toBe(TelemetryLevel.Debug);
    expect(
      items.filter(
        (item) => (item.level ?? TelemetryLevel.Information) >= TelemetryLevel.Information,
      ),
    ).toHaveLength(3);
    expect(JSON.stringify(items)).not.toContain(sentinel);

    provider.dispose();
    await provider.resolveServices();
    expect(items).toHaveLength(4);
  });

  it('pairs a failed resolution with one sanitized exception and a cooldown notification', async () => {
    const client = new ServiceDiscoveryClient({ http: createHttp(unauthorized) });
    const provider = new ServiceDiscoveryProvider(
      { discoveryClient: client },
      {} as ConstructorParameters<typeof ServiceDiscoveryProvider>[1],
    );
    const { telemetry, items } = createTelemetry();
    provider.connectTelemetry(telemetry);

    await expect(provider.resolveServices()).rejects.toMatchObject({ response: { status: 401 } });
    await expect(provider.resolveServices()).rejects.toBeDefined();

    expect(items.map((item) => item.name)).toEqual([
      'fusion.service-discovery.resolve.duration',
      'fusion.service-discovery.resolve.failure',
      'fusion.service-discovery.resolve.duration',
      'fusion.service-discovery.resolve.failure',
      'fusion.service-discovery.cooldown',
    ]);
    expect(JSON.stringify(items)).not.toContain(sentinel);
    provider.dispose();
  });

  it('leaves reporting of an inherited client to the parent host', async () => {
    const client = new ServiceDiscoveryClient({ http: createHttp(ok) });
    const instance = new ServiceDiscoveryProvider(
      { discoveryClient: client },
      {} as ConstructorParameters<typeof ServiceDiscoveryProvider>[1],
    );
    const connect = vi.spyOn(instance, 'connectTelemetry');
    const { telemetry } = createTelemetry();
    const postInitialize = module.postInitialize as NonNullable<typeof module.postInitialize>;
    const modules = { telemetry } as unknown as Parameters<typeof postInitialize>[0]['modules'];

    await postInitialize({ instance, modules, ref: { serviceDiscovery: instance } });
    expect(connect).not.toHaveBeenCalled();

    await postInitialize({ instance, modules, ref: undefined });
    expect(connect).toHaveBeenCalledWith(telemetry);
    instance.dispose();
  });

  it('stops reporting resolutions once the host disposes the module', async () => {
    const { telemetry, items } = createTelemetry();
    const client = new ServiceDiscoveryClient({ http: createHttp(ok) });
    // A host that registers discovery, its HTTP dependency and a stand-in telemetry module.
    const configurator = new ModulesConfigurator([
      httpModule,
      module,
      { name: 'telemetry', initialize: () => telemetry },
    ]);
    configurator.configure({
      module,
      configure: (config) => config.setServiceDiscoveryClient(client),
    });
    const instance = await configurator.initialize();
    await instance.serviceDiscovery.resolveServices();
    expect(items).toHaveLength(1);

    await configurator.dispose(instance);
    // The shared client keeps working; only this host's diagnostics are detached.
    await expect(client.resolveServices(true)).resolves.toEqual(services);
    expect(items).toHaveLength(1);
  });
});
