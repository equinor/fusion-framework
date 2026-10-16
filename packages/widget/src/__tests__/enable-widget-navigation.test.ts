import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';
import { mockFramework } from '@equinor/fusion-framework/mock';

import { configureWidgetModules } from '../configure-widget-modules';
import { enableWidgetNavigation } from '../enable-widget-navigation';
import type { WidgetEnv, WidgetModulesInstance } from '../types';

type Instance = WidgetModulesInstance<[NavigationModule]>;

const manifest: WidgetEnv['manifest'] = {
  id: 'test-widget',
  name: 'Test widget',
  version: '1.0.0',
  description: 'A test widget',
  entryPoint: 'index.js',
};

const instances: Instance[] = [];

/** Initializes a widget the way a widget host would: one call per widget instance. */
const mount = async (
  navigation?: WidgetEnv['navigation'],
  configure?: Parameters<typeof enableWidgetNavigation>[2],
): Promise<Instance> => {
  const fusion = await mockFramework();
  const env: WidgetEnv = { manifest, navigation };
  const instance = await configureWidgetModules<[NavigationModule]>((configurator) => {
    // The widget's MSAL module requires telemetry; parent it on the host framework as the app pipeline does.
    enableTelemetry(configurator, {
      configure: (builder) => builder.setParent(fusion.modules.telemetry),
    });
    enableWidgetNavigation(configurator, env, configure);
  })({ fusion, env });
  instances.push(instance);
  return instance;
};

/** History state updates are applied asynchronously; wait for them to settle. */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  for (const instance of instances.splice(0)) {
    instance.dispose();
  }
});

describe('enableWidgetNavigation', () => {
  it('isolates navigation state between two simultaneous widgets', async () => {
    const first = await mount();
    const second = await mount();

    first.navigation.push('/only-first');
    await flush();

    expect(first.navigation.path.pathname).toBe('/only-first');
    expect(second.navigation.path.pathname).toBe('/');
    expect(first.navigation.history).not.toBe(second.navigation.history);
  });

  it('does not read or modify window.location', async () => {
    const before = window.location.href;
    const locationSpy = vi.spyOn(window, 'location', 'get');

    const widget = await mount({ initialLocation: '/start', basename: '/widget' });
    widget.navigation.push('/next');
    await flush();
    expect(widget.navigation.path.pathname).toBe('/next');

    expect(locationSpy).not.toHaveBeenCalled();
    locationSpy.mockRestore();
    expect(window.location.href).toBe(before);
  });

  it('applies initial location and basename', async () => {
    const widget = await mount({ initialLocation: '/start', basename: '/widget' });
    expect(widget.navigation.basename).toBe('/widget');
    expect(widget.navigation.path.pathname).toBe('/start');
  });

  it('releases the owned history on dispose and starts fresh on remount', async () => {
    const first = await mount();
    const disposeSpy = vi.spyOn(first.navigation.history, Symbol.dispose);
    first.navigation.push('/dirty');
    await flush();
    first.dispose();
    await flush();
    expect(disposeSpy).toHaveBeenCalled();

    const remounted = await mount();
    expect(remounted.navigation.path.pathname).toBe('/');
  });

  it('keeps explicit configuration authoritative', async () => {
    const widget = await mount({ initialLocation: '/ignored' }, (config) =>
      config.setBasename('/explicit'),
    );
    expect(widget.navigation.basename).toBe('/explicit');
  });
});
