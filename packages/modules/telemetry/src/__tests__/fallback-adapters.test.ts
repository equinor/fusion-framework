import { describe, expect, it, vi } from 'vitest';
import { TelemetryProvider } from '../TelemetryProvider.js';

describe('fallback telemetry adapters', () => {
  it('flushes and shuts down exporter adapters when the provider is disposed', async () => {
    const shutdown = vi.fn().mockResolvedValue(undefined);
    const adapter = { initialize: vi.fn(), processItem: vi.fn(), shutdown };
    const provider = new TelemetryProvider({ adapters: { exporter: adapter } });
    await provider.initialize();
    const disposal = provider.dispose();
    expect(provider.dispose()).toBe(disposal);
    await disposal;
    expect(shutdown).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('honors explicit child adapters: %s', async (explicit) => {
    const fallback = { fallback: true, initialize: vi.fn(), processItem: vi.fn() };
    const consoleAdapter = { initialize: vi.fn(), processItem: vi.fn() };
    const appAdapter = { initialize: vi.fn(), processItem: vi.fn() };
    const parent = new TelemetryProvider({
      adapters: { fallback, console: consoleAdapter },
      metadata: async () => ({ fusion: { spa: { version: 'test' } } }),
    });
    await parent.initialize();
    const app = new TelemetryProvider({
      adapters: explicit ? { app: appAdapter } : {},
      defaultScope: ['app'],
      metadata: { fusion: { app: { key: 'example-app' } } },
    });
    await app.initialize({ parent });
    app.trackEvent({ name: 'app log' });
    await vi.waitFor(() => expect(consoleAdapter.processItem).toHaveBeenCalledTimes(1));
    expect(fallback.processItem).toHaveBeenCalledTimes(explicit ? 0 : 1);
    expect(appAdapter.processItem).toHaveBeenCalledTimes(explicit ? 1 : 0);
    expect(consoleAdapter.processItem).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { fusion: { app: { key: 'example-app' }, spa: { version: 'test' } } },
      }),
    );
    parent.trackEvent({ name: 'framework log' });
    await vi.waitFor(() => expect(fallback.processItem).toHaveBeenCalledTimes(explicit ? 1 : 2));
    await app.dispose();
    await parent.dispose();
  });

  it('preserves precedence across more than one parent', async () => {
    const fallback = { fallback: true, initialize: vi.fn(), processItem: vi.fn() };
    const appAdapter = { initialize: vi.fn(), processItem: vi.fn() };
    const root = new TelemetryProvider({ adapters: { fallback } });
    const middle = new TelemetryProvider({});
    const app = new TelemetryProvider({ adapters: { app: appAdapter } });
    await root.initialize();
    await middle.initialize({ parent: root });
    await app.initialize({ parent: middle });
    app.trackEvent({ name: 'nested app log' });
    expect(appAdapter.processItem).toHaveBeenCalledTimes(1);
    expect(fallback.processItem).not.toHaveBeenCalled();
    await app.dispose();
    await middle.dispose();
    await root.dispose();
  });
});
