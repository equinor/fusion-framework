import { describe, expect, it, vi } from 'vitest';
import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';
import { configureWidgetModules } from '../configure-widget-modules.js';

const env = {
  manifest: {
    id: 'widget-id',
    name: 'telemetry-widget',
    version: '1.0.0',
    description: '',
    entryPoint: 'index.js',
    assetPath: '/',
  },
};

describe('widget host telemetry', () => {
  it('forwards widget lifecycle with widget identity and respects explicit exporters', async () => {
    const inherited = vi.fn();
    const explicit = vi.fn();
    const fusion = await mockFramework((config) => {
      enableTelemetry(config, {
        configure: (builder) => {
          builder.setAdapter('fallback', {
            fallback: true,
            initialize: vi.fn(),
            processItem: inherited,
          });
        },
      });
    });
    inherited.mockClear();
    const initialize = configureWidgetModules((config) => {
      enableTelemetry(config, {
        configure: (builder) => {
          builder.setAdapter('explicit', { initialize: vi.fn(), processItem: explicit });
        },
      });
    });
    const widget = await initialize({ fusion, env });
    await vi.waitFor(() =>
      expect(explicit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'fusion.host.initialize.duration',
          diagnostic: expect.objectContaining({ source: 'widget', widgetKey: 'telemetry-widget' }),
        }),
      ),
    );
    expect(inherited.mock.calls.some(([item]) => item.diagnostic?.source === 'widget')).toBe(false);
    await widget.dispose();
    await fusion.modules.dispose();
  });

  it('preserves a widget configuration failure and reports it to the parent', async () => {
    const processItem = vi.fn();
    const fusion = await mockFramework((config) => {
      enableTelemetry(config, {
        configure: (builder) => {
          builder.setAdapter('test', { initialize: vi.fn(), processItem });
        },
      });
    });
    processItem.mockClear();
    const original = new Error('private-sentinel');
    const initialize = configureWidgetModules(() => {
      throw original;
    });
    await expect(initialize({ fusion, env })).rejects.toBe(original);
    await vi.waitFor(() => expect(processItem).toHaveBeenCalledTimes(2));
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('private-sentinel');
    await fusion.modules.dispose();
  });
});
