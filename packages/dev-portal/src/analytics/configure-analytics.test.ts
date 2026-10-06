import type { FrameworkConfigurator } from '@equinor/fusion-framework';
import type { IAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics';
import {
  ConsoleAnalyticsAdapter,
  FusionAnalyticsAdapter,
} from '@equinor/fusion-framework-module-analytics/adapters';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ enableAnalytics: vi.fn() }));

vi.mock('@equinor/fusion-framework-module-analytics', () => ({
  enableAnalytics: mocks.enableAnalytics,
}));

import { configureAnalytics } from './configure-analytics';

type Factory = (args: unknown) => Promise<unknown>;

/** Runs `configureAnalytics` against a recording builder and returns the registered factories. */
function configure(mockServerUrl?: string) {
  const adapters = new Map<string, Factory>();
  const collectors = new Map<string, Factory>();
  const builder = {
    setAdapter: (key: string, factory: Factory) => adapters.set(key, factory),
    setCollector: (key: string, factory: Factory) => collectors.set(key, factory),
  };
  configureAnalytics({} as FrameworkConfigurator, { mockServerUrl });
  const [[, callback]] = mocks.enableAnalytics.mock.calls as [[unknown, (b: unknown) => void]];
  callback(builder);
  return { adapters, collectors };
}

/** Builder args whose service discovery hands out the given `monitor` client. */
const argsWithMonitor = (createClient: (key: string) => Promise<unknown>) => ({
  hasModule: () => false,
  requireInstance: async (name: string) => {
    expect(name).toBe('serviceDiscovery');
    return { createClient };
  },
});

describe('configureAnalytics', () => {
  let created: IAnalyticsAdapter[] = [];

  beforeEach(() => {
    mocks.enableAnalytics.mockClear();
  });

  afterEach(() => {
    // Adapters own a batch timer and exporter, so each test releases the ones it created.
    for (const adapter of created) adapter[Symbol.dispose]?.();
    created = [];
    vi.restoreAllMocks();
  });

  it('registers the Fusion portal collectors and the console adapter in every mode', () => {
    // The same registrations are expected with and without a mock server.
    for (const mode of [undefined, 'http://localhost:4010']) {
      mocks.enableAnalytics.mockClear();
      const { adapters, collectors } = configure(mode);

      expect([...collectors.keys()]).toEqual(['context-selected', 'app-selected', 'app-loaded']);
      expect(adapters.has('console')).toBe(true);
    }
  });

  it('sends no analytics anywhere outside mock mode', () => {
    const { adapters } = configure(undefined);

    expect([...adapters.keys()]).toEqual(['console']);
  });

  it('sends analytics to the monitor service in mock mode', async () => {
    const posts: { path: string; body: unknown }[] = [];
    const posted = new Promise<void>((resolve) => {
      const client = {
        fetch: async (path: string, init: { body: Blob }) => {
          posts.push({ path, body: JSON.parse(await init.body.text()) });
          resolve();
          return new Response(null, { status: 202 });
        },
      };
      const { adapters } = configure('http://localhost:4010');
      void adapters
        .get('fusion')?.(
          argsWithMonitor(async (key) => {
            expect(key).toBe('monitor');
            return client;
          }),
        )
        .then((adapter) => {
          expect(adapter).toBeInstanceOf(FusionAnalyticsAdapter);
          created.push(adapter as IAnalyticsAdapter);
          (adapter as IAnalyticsAdapter).registerAnalytic({
            name: 'app-feature',
            value: { feature: 'page-viewed' },
            attributes: { appKey: 'my-app' },
          });
        });
    });

    await posted;

    expect(posts).toHaveLength(1);
    expect(posts[0].path).toBe('/v1/logs');
    expect(JSON.stringify(posts[0].body)).toContain('"stringValue":"dev-portal"');
    expect(JSON.stringify(posts[0].body)).toContain('"stringValue":"page-viewed"');
  });

  it('starts without the adapter when the mock server serves no monitor service', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { adapters } = configure('http://localhost:4010');

    const adapter = await adapters.get('fusion')?.(
      argsWithMonitor(() => Promise.reject(new Error('Service "monitor" not found'))),
    );

    expect(adapter).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'the mock server at http://localhost:4010 serves no "monitor" service',
      ),
      expect.any(Error),
    );
  });

  it('logs to the console only when the fusionLogAnalytics flag is on', async () => {
    const { adapters } = configure(undefined);
    const argsWithFlag = (enabled: boolean) => ({
      hasModule: (name: string) => name === 'featureFlag',
      requireInstance: async () => ({ getFeature: () => ({ enabled }) }),
    });

    expect(await adapters.get('console')?.(argsWithFlag(true))).toBeInstanceOf(
      ConsoleAnalyticsAdapter,
    );
    expect(await adapters.get('console')?.(argsWithFlag(false))).toBeUndefined();
  });
});
