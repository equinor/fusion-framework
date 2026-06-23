import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { ContextNavigationBuilder } from '../enable-context-navigation';
import { EMPTY } from 'rxjs';
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
  sourceFactory: vi.fn(() => EMPTY),
  resolveInitialContext: vi.fn(async () => undefined),
}));

/** Mock configurator that captures calls for assertion in tests. */
class MockContextNavigationConfigurator {
  /**
   * Records that debug mode was configured; returns `this` for chaining.
   *
   * @param _enabled - Whether debug mode should be enabled.
   * @returns The configurator instance for chaining.
   */
  setDebug(_enabled: boolean): this {
    return this;
  }

  /** Delegates to the shared spy so tests can assert how config was created. */
  createConfig() {
    return createConfigSpy();
  }

  /** Registers this instance in the outer `builderInstances` array for test inspection. */
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
    createConfigSpy.mockClear();
  });

  it('registers a plugin instead of module config', async () => {
    const registerPlugin = vi.fn();
    const addConfig = vi.fn();

    const { enableContextNavigation } = await import('../enable-context-navigation');

    // Test double — only registerPlugin and addConfig are called by enableContextNavigation
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
      app: { id: 'app', current$: EMPTY },
      navigation: {
        id: 'navigation',
        path: { pathname: '/', search: '' },
        state$: EMPTY,
      },
      context: { id: 'context', currentContext$: EMPTY },
      event: { id: 'event', dispatchEvent: vi.fn() },
    };

    const { enableContextNavigation } = await import('../enable-context-navigation');

    // Test double — only registerPlugin is called by enableContextNavigation
    enableContextNavigation(
      {
        registerPlugin,
      } as unknown as IModulesConfigurator,
      builder,
    );

    const plugin = registerPlugin.mock.calls[0]?.[0];
    const registration = await plugin({ modules, ref });

    expect(builder).toHaveBeenCalledOnce();

    expect(registration).toEqual(expect.any(Function));
    expect(() => registration()).not.toThrow();
  });
});
