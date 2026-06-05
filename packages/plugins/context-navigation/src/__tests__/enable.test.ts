import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { ContextNavigationBuilder } from '../enable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const builderInstances: MockContextNavigationConfigurator[] = [];
const teardownFns: ReturnType<typeof vi.fn>[] = [];

const createConfigSpy = vi.fn(() => ({
  debug: false,
  origin: 'https://example.com',
  portalName: 'Portal',
  enableUrlGuard: true,
  navigationOptions: { replace: true },
  adapters: [],
  sourceFactory: vi.fn(),
  resolveInitialContext: vi.fn(async () => undefined),
}));

class MockContextNavigationConfigurator {
  setDebug(_enabled: boolean): this {
    return this;
  }

  createConfig() {
    return createConfigSpy();
  }

  constructor() {
    builderInstances.push(this);
  }
}

vi.mock('../configurator', () => ({
  ContextNavigationConfigurator: MockContextNavigationConfigurator,
}));

vi.mock('../plugin', () => ({
  createContextNavigationPlugin: vi.fn().mockImplementation(() => {
    const teardown = vi.fn();
    teardownFns.push(teardown);
    return teardown;
  }),
}));

describe('enableContextNavigation', () => {
  beforeEach(() => {
    builderInstances.length = 0;
    teardownFns.length = 0;
    createConfigSpy.mockClear();
  });

  it('registers a plugin instead of module config', async () => {
    const registerPlugin = vi.fn();
    const addConfig = vi.fn();

    const { enableContextNavigation } = await import('../enable');

    enableContextNavigation({
      registerPlugin,
      addConfig,
    } as unknown as IModulesConfigurator);

    expect(registerPlugin).toHaveBeenCalledOnce();
    expect(registerPlugin.mock.calls[0]?.[0]?.name).toBe('contextNavigation');
    expect(addConfig).not.toHaveBeenCalled();
  });

  it('creates and disposes the runtime plugin from the registered plugin callback', async () => {
    const registerPlugin = vi.fn();
    const builder = vi.fn<ContextNavigationBuilder>((configurator) => {
      configurator.setDebug(true);
    });
    const ref = { parent: true };
    const modules = {
      app: { id: 'app' },
      navigation: { id: 'navigation' },
      context: { id: 'context' },
      event: { id: 'event' },
    };

    const { enableContextNavigation } = await import('../enable');

    enableContextNavigation(
      {
        registerPlugin,
      } as unknown as IModulesConfigurator,
      builder,
    );

    const plugin = registerPlugin.mock.calls[0]?.[0];
    const registration = await plugin({ modules, ref });

    expect(builder).toHaveBeenCalledWith(builderInstances[0]);
    expect(createConfigSpy).toHaveBeenCalledOnce();

    expect(registration).toBe(teardownFns[0]);
    expect(teardownFns[0]).not.toHaveBeenCalled();

    await registration();

    expect(teardownFns[0]).toHaveBeenCalledOnce();
  });
});
