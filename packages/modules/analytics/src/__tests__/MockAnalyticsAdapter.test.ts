import { describe, it, expect, vi, afterEach } from 'vitest';

import { MockAnalyticsAdapter } from '../mock/MockAnalyticsAdapter.js';
import type { AnalyticsEvent } from '../types.js';

const createEvent = (name: string, overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent => ({
  name,
  value: null,
  ...overrides,
});

describe('MockAnalyticsAdapter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('records events via registerAnalytic and returns them from getAnalytics', () => {
    const adapter = new MockAnalyticsAdapter();

    adapter.registerAnalytic(createEvent('button-click'));
    adapter.registerAnalytic(createEvent('page-view'));

    expect(adapter.getAnalytics().map((e) => e.name)).toEqual(['button-click', 'page-view']);
  });

  it('filters getAnalytics by a single name, an array, and a predicate', () => {
    const adapter = new MockAnalyticsAdapter();
    adapter.registerAnalytic(createEvent('button-click', { attributes: { section: 'header' } }));
    adapter.registerAnalytic(createEvent('page-view'));

    expect(adapter.getAnalytics('button-click')).toHaveLength(1);
    expect(adapter.getAnalytics(['button-click', 'page-view'])).toHaveLength(2);
    expect(adapter.getAnalytics((e) => e.attributes?.section === 'header')).toHaveLength(1);
  });

  it('resolves waitForAnalytic immediately when a matching event is already recorded', async () => {
    const adapter = new MockAnalyticsAdapter();
    adapter.registerAnalytic(createEvent('button-click'));

    const event = await adapter.waitForAnalytic('button-click');

    expect(event.name).toBe('button-click');
  });

  it('resolves waitForAnalytic when a matching event is recorded later', async () => {
    const adapter = new MockAnalyticsAdapter();

    const promise = adapter.waitForAnalytic('button-click');
    adapter.registerAnalytic(createEvent('page-view'));
    adapter.registerAnalytic(createEvent('button-click'));
    const event = await promise;

    expect(event.name).toBe('button-click');
  });

  it('resolves waitForAnalytic via predicate matcher', async () => {
    const adapter = new MockAnalyticsAdapter();

    const promise = adapter.waitForAnalytic((e) => e.attributes?.id === 42);
    adapter.registerAnalytic(createEvent('button-click', { attributes: { id: 1 } }));
    adapter.registerAnalytic(createEvent('button-click', { attributes: { id: 42 } }));
    const event = await promise;

    expect(event.attributes?.id).toBe(42);
  });

  it('rejects when the timeout elapses before a matching event is recorded', async () => {
    vi.useFakeTimers();
    const adapter = new MockAnalyticsAdapter();

    const promise = adapter.waitForAnalytic('button-click', { timeout: 500 });
    vi.advanceTimersByTime(501);

    await expect(promise).rejects.toThrow('waitForAnalytic timed out after 500ms');
  });

  it('rejects when the AbortSignal fires before a matching event', async () => {
    const adapter = new MockAnalyticsAdapter();
    const controller = new AbortController();

    const promise = adapter.waitForAnalytic('button-click', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrow();
  });

  it('rejects immediately when passed an already-aborted signal', async () => {
    const adapter = new MockAnalyticsAdapter();
    const controller = new AbortController();
    controller.abort();

    await expect(
      adapter.waitForAnalytic('button-click', { signal: controller.signal }),
    ).rejects.toThrow();
  });

  it('rejects pending waitForAnalytic calls when the adapter is disposed', async () => {
    const adapter = new MockAnalyticsAdapter();

    const promise = adapter.waitForAnalytic('button-click');
    adapter[Symbol.dispose]();

    await expect(promise).rejects.toThrow('disposed before a matching event was recorded');
  });

  it('does not interfere with events recorded by another adapter instance', () => {
    const adapterA = new MockAnalyticsAdapter();
    const adapterB = new MockAnalyticsAdapter();

    adapterA.registerAnalytic(createEvent('button-click'));

    expect(adapterA.getAnalytics()).toHaveLength(1);
    expect(adapterB.getAnalytics()).toHaveLength(0);
  });
});
