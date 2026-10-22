import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import type { ITelemetryProvider, TelemetryItem } from '@equinor/fusion-framework-module-telemetry';

import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { ApiProvider } from '../src/provider';
import { module as servicesModule } from '../src/module';

const sentinel = 'privacy-sentinel-c41d';

/** Telemetry double that keeps every record the provider would export. */
const createTelemetry = (): { telemetry: ITelemetryProvider; items: TelemetryItem[] } => {
  const items: TelemetryItem[] = [];
  // Only the members the provider uses are implemented by the double.
  const telemetry = {
    source: { source: 'framework', hostId: 'host-1' },
    track: (item: TelemetryItem) => items.push(item),
    trackEvent: (item: TelemetryItem) => items.push(item),
  } as unknown as ITelemetryProvider;
  return { telemetry, items };
};

// Domain clients only register a response validator during creation.
const httpClient = { responseHandler: { add: vi.fn() } } as unknown as IHttpClient;

describe('services operational telemetry', () => {
  it('records one client selection per creation and returns the client unchanged', async () => {
    const createClient = vi.fn(async () => httpClient);
    const provider = new ApiProvider({ createClient });
    const { telemetry, items } = createTelemetry();
    provider.connectTelemetry(telemetry);

    await expect(provider.createNotificationClient('json')).resolves.toBeDefined();

    expect(httpClient.responseHandler.add).toHaveBeenCalled();
    expect(createClient).toHaveBeenCalledWith('notification');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      name: 'fusion.services.create-client.duration',
      diagnostic: { module: 'services', operation: 'create-client', outcome: 'success' },
    });
  });

  it('rethrows the original selection failure with one sanitized exception', async () => {
    const original = new Error(`no client for ${sentinel}`);
    const provider = new ApiProvider<IHttpClient>({
      createClient: async () => {
        throw original;
      },
    });
    const { telemetry, items } = createTelemetry();
    provider.connectTelemetry(telemetry);

    await expect(provider.createPeopleClient()).rejects.toBe(original);

    // Record names alone prove the count and pairing contract.
    expect(items.map((item) => item.name)).toEqual([
      'fusion.services.create-client.duration',
      'fusion.services.create-client.failure',
    ]);
    expect(JSON.stringify(items)).not.toContain(sentinel);
  });

  it('records nothing without telemetry or after disposal', async () => {
    const provider = new ApiProvider({ createClient: async () => httpClient });
    await expect(provider.createNotificationClient('json')).resolves.toBeDefined();

    const { telemetry, items } = createTelemetry();
    provider.connectTelemetry(telemetry);
    provider.dispose();
    await provider.createNotificationClient('json');
    expect(items).toHaveLength(0);
  });

  it('stops reporting a pending client creation once the host disposes the module', async () => {
    const { telemetry, items } = createTelemetry();
    let resolve!: (client: IHttpClient) => void;
    // A host that registers services next to a stand-in telemetry module.
    const configurator = new ModulesConfigurator([
      servicesModule,
      { name: 'telemetry', initialize: () => telemetry },
    ]);
    configurator.configure({
      module: servicesModule,
      configure: (config) => {
        config.createClient = () => new Promise<IHttpClient>((r) => (resolve = r));
      },
    });
    const instance = await configurator.initialize();

    const pending = instance.services.createNotificationClient('json');
    await configurator.dispose(instance);
    resolve(httpClient);

    await expect(pending).resolves.toBeDefined();
    expect(items).toHaveLength(0);
  });
});
