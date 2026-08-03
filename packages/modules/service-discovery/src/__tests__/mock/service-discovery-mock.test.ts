import { describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import httpModule from '@equinor/fusion-framework-module-http';
import { module as serviceDiscoveryModule } from '../../module';
import {
  createMockService,
  defaultServiceDiscoveryMockServices,
  enableServiceDiscoveryMock,
  mockServiceDiscovery,
  ServiceDiscoveryMockClient,
  ServiceDiscoveryMockConfigurator,
  serviceDiscoveryMockModule,
} from '../../mock';
import type { Service } from '../../types';

/** Resolves a service through a fully initialized module instance. */
const resolveThroughModule = async (
  // biome-ignore lint/suspicious/noExplicitAny: mirrors the enabler signature, which accepts any configurator scope
  configurator: ModulesConfigurator<any, any>,
  key: string,
): Promise<Service> => {
  const instances = (await configurator.initialize()) as unknown as {
    serviceDiscovery: { resolveService: (key: string) => Promise<Service> };
  };
  return instances.serviceDiscovery.resolveService(key);
};

describe('createMockService', () => {
  it('derives uri, name and scopes from the key alone', () => {
    expect(createMockService({ key: 'apps' })).toEqual({
      key: 'apps',
      uri: 'https://apps.fusion.test',
      name: 'apps',
      scopes: ['apps/.default'],
      defaultScopes: ['apps/.default'],
    });
  });

  it('resolves against a local server when a base uri is supplied', () => {
    expect(createMockService({ key: 'apps' }, 'http://localhost:3000/')).toEqual(
      expect.objectContaining({ uri: 'http://localhost:3000/apps' }),
    );
  });

  it('lets an explicit uri win over the base uri', () => {
    expect(
      createMockService({ key: 'apps', uri: 'https://apps.test' }, 'http://localhost:3000'),
    ).toEqual(expect.objectContaining({ uri: 'https://apps.test' }));
  });
});

describe('defaultServiceDiscoveryMockServices', () => {
  it('covers the services a Fusion application resolves at start-up', () => {
    expect(defaultServiceDiscoveryMockServices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'apps' }),
        expect.objectContaining({ key: 'people' }),
        expect.objectContaining({ key: 'context' }),
      ]),
    );
  });
});

describe('ServiceDiscoveryMockClient', () => {
  it('serves the baseline services when none are supplied', async () => {
    const client = new ServiceDiscoveryMockClient();

    expect((await client.resolveServices()).map((service) => service.key)).toEqual(
      defaultServiceDiscoveryMockServices.map((service) => service.key),
    );
  });

  it('replaces the baseline with the supplied services', async () => {
    const client = new ServiceDiscoveryMockClient({ services: [{ key: 'only-this' }] });

    expect((await client.resolveServices()).map((service) => service.key)).toEqual(['only-this']);
  });

  it('resolves unknown keys by default', async () => {
    const client = new ServiceDiscoveryMockClient();

    expect(await client.resolveService('unknown')).toEqual(
      expect.objectContaining({ key: 'unknown', uri: 'https://unknown.fusion.test' }),
    );
  });

  it('throws for unknown keys when unknown services are disallowed', async () => {
    const client = new ServiceDiscoveryMockClient({ resolveUnknownServices: false });

    await expect(client.resolveService('unknown')).rejects.toThrow(/not registered/);
  });

  it('points every service at a local mock server when given a base uri', async () => {
    const client = new ServiceDiscoveryMockClient({ baseUri: 'http://localhost:4000' });

    expect(await client.resolveService('apps')).toEqual(
      expect.objectContaining({ uri: 'http://localhost:4000/apps' }),
    );
    expect(await client.resolveService('unknown')).toEqual(
      expect.objectContaining({ uri: 'http://localhost:4000/unknown' }),
    );
  });

  it('lets a test runner spy on a single method', async () => {
    const client = new ServiceDiscoveryMockClient();
    const spy = vi
      .spyOn(client, 'resolveService')
      .mockImplementation(async (key) => createMockService({ key: `${key}-stubbed` }));

    expect((await client.resolveService('apps')).key).toBe('apps-stubbed');
    // Untouched methods keep their real behaviour
    expect(await client.resolveServices()).not.toHaveLength(0);

    spy.mockRestore();

    expect((await client.resolveService('apps')).key).toBe('apps');
  });
});

describe('ServiceDiscoveryMockConfigurator', () => {
  it('starts from the baseline registry', () => {
    const configurator = new ServiceDiscoveryMockConfigurator();

    expect(configurator.getServices().map((service) => service.key)).toEqual(
      defaultServiceDiscoveryMockServices.map((service) => service.key),
    );
  });

  it('composes the registry without constructing a client', () => {
    const configurator = new ServiceDiscoveryMockConfigurator();

    configurator
      .setBaseUri('http://localhost:6669')
      .addService({ key: 'my-api' })
      .removeService('bookmarks');

    expect(configurator.getBaseUri()).toBe('http://localhost:6669');
    expect(configurator.getServices().map((service) => service.key)).toContain('my-api');
    expect(configurator.getServices().map((service) => service.key)).not.toContain('bookmarks');
  });

  it('replaces the baseline when services are set outright', () => {
    const configurator = new ServiceDiscoveryMockConfigurator({ services: [{ key: 'only-this' }] });

    expect(configurator.getServices().map((service) => service.key)).toEqual(['only-this']);
  });
});

describe('serviceDiscoveryMockModule', () => {
  it('matches the real module name and initialize path', () => {
    expect(serviceDiscoveryMockModule.name).toBe(serviceDiscoveryModule.name);
    expect(serviceDiscoveryMockModule.initialize).toBe(serviceDiscoveryModule.initialize);
  });

  it('builds a real ServiceDiscoveryConfigurator with a mock registry preconfigured', async () => {
    const configurator =
      (await serviceDiscoveryMockModule.configure?.()) as ServiceDiscoveryMockConfigurator;

    expect(configurator).toBeInstanceOf(ServiceDiscoveryMockConfigurator);
    expect(configurator.getServices()).not.toHaveLength(0);
  });
});

describe('enableServiceDiscoveryMock', () => {
  it('exposes the client on the provider so a runner can spy on it', async () => {
    const configurator = new ModulesConfigurator([httpModule, serviceDiscoveryModule]);
    enableServiceDiscoveryMock(configurator);

    const instances = (await configurator.initialize()) as unknown as {
      serviceDiscovery: {
        client: ServiceDiscoveryMockClient;
        resolveService: (key: string) => Promise<Service>;
      };
    };
    const spy = vi
      .spyOn(instances.serviceDiscovery.client, 'resolveService')
      .mockResolvedValue(createMockService({ key: 'apps', uri: 'http://spied' }));

    expect((await instances.serviceDiscovery.resolveService('apps')).uri).toBe('http://spied');
    expect(spy).toHaveBeenCalledWith('apps');

    spy.mockRestore();

    expect((await instances.serviceDiscovery.resolveService('apps')).uri).toBe(
      'https://apps.fusion.test',
    );
  });

  it('replaces an already registered service discovery module', async () => {
    const configurator = new ModulesConfigurator([httpModule, serviceDiscoveryModule]);
    enableServiceDiscoveryMock(configurator);

    expect((await resolveThroughModule(configurator, 'apps')).uri).toBe('https://apps.fusion.test');
  });

  it('lets the callback configure the registry through the builder', async () => {
    const configurator = new ModulesConfigurator([httpModule, serviceDiscoveryModule]);
    enableServiceDiscoveryMock(configurator, (builder) => {
      builder.setBaseUri('http://localhost:6669');
      builder.addService({ key: 'my-api' });
    });

    expect((await resolveThroughModule(configurator, 'my-api')).uri).toBe(
      'http://localhost:6669/my-api',
    );
  });

  it('lets the callback take over resolution with its own client', async () => {
    const configurator = new ModulesConfigurator([httpModule, serviceDiscoveryModule]);
    enableServiceDiscoveryMock(configurator, (builder) => {
      builder.setServiceDiscoveryClient({
        resolveServices: async () => [],
        resolveService: async (key) =>
          createMockService({ key, uri: 'http://localhost:5000/from-callback' }),
      });
    });

    expect((await resolveThroughModule(configurator, 'apps')).uri).toBe(
      'http://localhost:5000/from-callback',
    );
  });
});

describe('mockServiceDiscovery', () => {
  it('applies options to the registry', async () => {
    const configurator = new ModulesConfigurator([httpModule]);
    mockServiceDiscovery(configurator, { baseUri: 'http://localhost:4000' });

    expect((await resolveThroughModule(configurator, 'apps')).uri).toBe(
      'http://localhost:4000/apps',
    );
  });

  it('supports a callback-only form', async () => {
    const configurator = new ModulesConfigurator([httpModule]);
    mockServiceDiscovery(configurator, (builder) => {
      builder.setBaseUri('http://localhost:4000');
    });

    expect((await resolveThroughModule(configurator, 'apps')).uri).toBe(
      'http://localhost:4000/apps',
    );
  });

  it('supports options plus a callback', async () => {
    const configurator = new ModulesConfigurator([httpModule]);
    mockServiceDiscovery(configurator, { baseUri: 'http://localhost:4000' }, (builder) => {
      builder.addService({ key: 'my-api', uri: 'http://localhost:5000/my-api' });
    });

    expect((await resolveThroughModule(configurator, 'apps')).uri).toBe(
      'http://localhost:4000/apps',
    );
    expect((await resolveThroughModule(configurator, 'my-api')).uri).toBe(
      'http://localhost:5000/my-api',
    );
  });
});
