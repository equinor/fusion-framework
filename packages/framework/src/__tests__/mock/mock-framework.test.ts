import { describe, expect, it, vi } from 'vitest';

import type { Module } from '@equinor/fusion-framework-module';
import { enableMsalMock } from '@equinor/fusion-framework-module-msal/mock';
import { enableServiceDiscoveryMock } from '@equinor/fusion-framework-module-service-discovery/mock';
import { TelemetryLevel } from '@equinor/fusion-framework-module-telemetry';

import { FrameworkConfigurator } from '../../FrameworkConfigurator.js';
import { init } from '../../init.js';
import { FrameworkMockConfigurator, mockFramework } from '../../mock/index.js';

/** A minimal configurator, standing in for an application's own. */
class WidgetsConfigurator {
  #name = 'default';
  setName(name: string): this {
    this.#name = name;
    return this;
  }
  get name(): string {
    return this.#name;
  }
}

/** A minimal module, standing in for one an application supplies through `TModules`. */
type WidgetsModule = Module<'widgets', { name: string }, WidgetsConfigurator>;
const widgetsModule: WidgetsModule = {
  name: 'widgets',
  configure: () => new WidgetsConfigurator(),
  initialize: ({ config }) => ({ name: config.name }),
};

describe('mockFramework', () => {
  it('initializes every built-in module without configuration', async () => {
    const fusion = await mockFramework();

    expect(fusion.modules.event).toBeDefined();
    expect(fusion.modules.auth).toBeDefined();
    expect(fusion.modules.http).toBeDefined();
    expect(fusion.modules.serviceDiscovery).toBeDefined();
    expect(fusion.modules.context).toBeDefined();
    expect(fusion.modules.telemetry).toBeDefined();
  });

  it('signs in a default user so an application has an identity to read', async () => {
    const fusion = await mockFramework();

    expect(fusion.modules.auth.account?.name).toBe('Test User');
  });

  it('resolves the services a Fusion application needs at start-up', async () => {
    const fusion = await mockFramework();

    await expect(fusion.modules.serviceDiscovery.resolveService('apps')).resolves.toMatchObject({
      key: 'apps',
    });
  });

  it('passes a real FrameworkConfigurator to the callback', async () => {
    expect.assertions(2);

    await mockFramework((configurator) => {
      expect(configurator).toBeInstanceOf(FrameworkMockConfigurator);
      expect(configurator).toBeInstanceOf(FrameworkConfigurator);
    });
  });

  it('awaits an asynchronous callback before initializing', async () => {
    const fusion = await mockFramework(async (configurator) => {
      await Promise.resolve();
      configurator.msal.setAccount({ name: 'Ada Lovelace' });
    });

    expect(fusion.modules.auth.account?.name).toBe('Ada Lovelace');
  });
});

describe('FrameworkMockConfigurator', () => {
  it('exposes the same msal configurator the auth module is built from', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.msal.setAccount({ name: 'Ada Lovelace', username: 'ada@equinor.com' });
    });

    expect(fusion.modules.auth.account).toMatchObject({
      name: 'Ada Lovelace',
      username: 'ada@equinor.com',
    });
  });

  it('lets the last declared account win', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.msal.setAccount({ name: 'Ada Lovelace' });
      configurator.msal.setAccount({ name: 'Grace Hopper' });
    });

    expect(fusion.modules.auth.account?.name).toBe('Grace Hopper');
  });

  it('resolves an account callback when the config is built', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.msal.setAccount(async () => ({ name: 'Ada Lovelace' }));
    });

    expect(fusion.modules.auth.account?.name).toBe('Ada Lovelace');
  });

  it('builds the auth client when the module builds its config, not when the account is set', async () => {
    const configurator = new FrameworkMockConfigurator();

    configurator.msal.setAccount({ name: 'Ada Lovelace' });

    // The account is configuration; nothing is constructed from it yet
    expect(configurator.msal.getClient()).toBeUndefined();

    const fusion = await init(configurator);

    expect(fusion.modules.auth.account?.name).toBe('Ada Lovelace');
  });

  it('exposes the same service discovery configurator the module is built from', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.serviceDiscovery.setBaseUri('http://localhost:6669');
      configurator.serviceDiscovery.addService({ key: 'my-api' });
    });

    const service = await fusion.modules.serviceDiscovery.resolveService('my-api');

    expect(service.uri).toContain('http://localhost:6669');
  });

  it('lets a service be removed so its absence can be asserted', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.serviceDiscovery.setResolveUnknownServices(false);
      configurator.serviceDiscovery.removeService('bookmarks');
    });

    await expect(fusion.modules.serviceDiscovery.resolveService('bookmarks')).rejects.toThrow();
  });

  it('accepts an enableX helper directly, because it is a real configurator', async () => {
    const fusion = await mockFramework((configurator) => {
      enableMsalMock(configurator, (builder) => builder.setAccount({ name: 'Grace Hopper' }));
      enableServiceDiscoveryMock(configurator, (builder) => builder.addService({ key: 'my-api' }));
    });

    expect(fusion.modules.auth.account?.name).toBe('Grace Hopper');
    await expect(fusion.modules.serviceDiscovery.resolveService('my-api')).resolves.toBeDefined();
  });

  it('registers a module through addModule', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.addModule((c) =>
        enableMsalMock(c, (builder) => builder.setAccount({ name: 'Grace Hopper' })),
      );
    });

    expect(fusion.modules.auth.account?.name).toBe('Grace Hopper');
  });

  it('returns itself from addModule so calls can be chained', () => {
    const configurator = new FrameworkMockConfigurator();

    expect(configurator.addModule(() => undefined)).toBe(configurator);
  });

  it('exposes the same http configurator the http module is built from', async () => {
    const configurator = new FrameworkMockConfigurator();

    configurator.http.configureClient('my-api', { baseUri: 'http://localhost:6669' });

    const fusion = await init(configurator);

    expect(fusion.modules.http.createClient('my-api')).toBeDefined();
  });

  it('exposes the same services configurator the services module is built from', () => {
    const configurator = new FrameworkMockConfigurator();

    expect(configurator.services).toBeDefined();
  });

  it('exposes the same context configurator the context module is built from', () => {
    const configurator = new FrameworkMockConfigurator();

    expect(configurator.context).toBeDefined();
  });

  it('seeds the initial context through the context module, so `.context` backs the real module', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.context.setCurrentContext({
        id: 'my-ctx',
        type: { id: 'ProjectMaster' },
        value: {},
      });
    });

    expect(fusion.modules.context.currentContext).toMatchObject({ id: 'my-ctx' });
  });

  it('exposes the same telemetry configurator the telemetry module is built from', () => {
    const configurator = new FrameworkMockConfigurator();

    expect(configurator.telemetry).toBeDefined();
  });

  it('collects a tracked event through the telemetry mock adapter, reaching no real endpoint', async () => {
    let mockConfigurator: FrameworkMockConfigurator | undefined;
    const fusion = await mockFramework((configurator) => {
      mockConfigurator = configurator;
    });

    fusion.modules.telemetry.trackEvent({
      name: 'button-click',
      level: TelemetryLevel.Information,
      scope: [],
    });

    await vi.waitFor(() => {
      expect(mockConfigurator?.telemetry.adapter.getItems('button-click')).toHaveLength(1);
    });
  });

  it('lets a module supplied through TModules get the same kind of accessor as msal and serviceDiscovery', async () => {
    // Standing in for an application subclassing FrameworkMockConfigurator to
    // expose its own module the same way the built-ins are exposed.
    class AppMockConfigurator extends FrameworkMockConfigurator<[WidgetsModule]> {
      constructor() {
        super();
        this._pin(widgetsModule);
      }
      get widgets(): WidgetsConfigurator {
        return this._getConfig('widgets');
      }
    }

    const configurator = new AppMockConfigurator();
    configurator.widgets.setName('Ada');

    const fusion = await init(configurator);

    expect(fusion.modules.widgets.name).toBe('Ada');
  });

  it('pins the same instance across repeated reads, so declarations accumulate on one configurator', () => {
    class AppMockConfigurator extends FrameworkMockConfigurator<[WidgetsModule]> {
      constructor() {
        super();
        this._pin(widgetsModule);
      }
      get widgets(): WidgetsConfigurator {
        return this._getConfig('widgets');
      }
    }

    const configurator = new AppMockConfigurator();

    expect(configurator.widgets).toBe(configurator.widgets);
  });

  it('throws from _getConfig when nothing was pinned for that name', () => {
    class AppMockConfigurator extends FrameworkMockConfigurator {
      readMissing(): unknown {
        return this._getConfig('widgets');
      }
    }

    expect(() => new AppMockConfigurator().readMissing()).toThrow(/widgets/);
  });

  it('throws from _pin when the module declares no configure factory', () => {
    class AppMockConfigurator extends FrameworkMockConfigurator {
      pinMissingConfigure(): void {
        this._pin({ ...widgetsModule, configure: undefined } as WidgetsModule);
      }
    }

    expect(() => new AppMockConfigurator().pinMissingConfigure()).toThrow(/configure factory/);
  });
});
