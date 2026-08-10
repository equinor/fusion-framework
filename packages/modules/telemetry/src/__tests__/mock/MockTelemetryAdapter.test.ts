import { afterEach, describe, expect, it, vi } from 'vitest';

import { TelemetryLevel, TelemetryType } from '../../static.js';
import type { TelemetryItem } from '../../types.js';
import { MockTelemetryAdapter } from '../../mock/MockTelemetryAdapter.js';

const createItem = (name: string, overrides: Partial<TelemetryItem> = {}): TelemetryItem => ({
  name,
  type: TelemetryType.Custom,
  level: TelemetryLevel.Information,
  scope: [],
  ...overrides,
});

describe('MockTelemetryAdapter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('ignores processItem before initialize, matching BaseTelemetryAdapter', () => {
    const adapter = new MockTelemetryAdapter();

    adapter.processItem(createItem('button-click'));

    expect(adapter.getItems()).toHaveLength(0);
  });

  it('records items via processItem and returns them from getItems, once initialized', async () => {
    const adapter = new MockTelemetryAdapter();
    await adapter.initialize();

    adapter.processItem(createItem('button-click'));
    adapter.processItem(createItem('page-view'));

    expect(adapter.getItems().map((item) => item.name)).toEqual(['button-click', 'page-view']);
  });

  it('filters getItems by a single name, an array, and a predicate', async () => {
    const adapter = new MockTelemetryAdapter();
    await adapter.initialize();

    adapter.processItem(createItem('button-click', { properties: { section: 'header' } }));
    adapter.processItem(createItem('page-view'));

    expect(adapter.getItems('button-click')).toHaveLength(1);
    expect(adapter.getItems(['button-click', 'page-view'])).toHaveLength(2);
    expect(adapter.getItems((item) => item.properties?.section === 'header')).toHaveLength(1);
  });

  it('resolves waitForItem immediately when a matching item is already recorded', async () => {
    const adapter = new MockTelemetryAdapter();
    await adapter.initialize();
    adapter.processItem(createItem('button-click'));

    const item = await adapter.waitForItem('button-click');

    expect(item.name).toBe('button-click');
  });

  it('resolves waitForItem when a matching item is recorded later', async () => {
    const adapter = new MockTelemetryAdapter();
    await adapter.initialize();

    const promise = adapter.waitForItem('button-click');
    adapter.processItem(createItem('page-view'));
    adapter.processItem(createItem('button-click'));
    const item = await promise;

    expect(item.name).toBe('button-click');
  });

  it('rejects when the timeout elapses before a matching item is recorded', async () => {
    vi.useFakeTimers();
    const adapter = new MockTelemetryAdapter();
    await adapter.initialize();

    const promise = adapter.waitForItem('button-click', { timeout: 500 });
    vi.advanceTimersByTime(501);

    await expect(promise).rejects.toThrow('waitForItem timed out after 500ms');
  });

  it('rejects when the AbortSignal fires before a matching item', async () => {
    const adapter = new MockTelemetryAdapter();
    await adapter.initialize();
    const controller = new AbortController();

    const promise = adapter.waitForItem('button-click', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrow();
  });

  it('rejects pending waitForItem calls when the adapter is disposed', async () => {
    const adapter = new MockTelemetryAdapter();
    await adapter.initialize();

    const promise = adapter.waitForItem('button-click');
    adapter[Symbol.dispose]();

    await expect(promise).rejects.toThrow('disposed before a matching item was recorded');
  });

  it('clears recorded items without rejecting pending waitForItem calls', async () => {
    const adapter = new MockTelemetryAdapter();
    await adapter.initialize();
    adapter.processItem(createItem('page-view'));

    adapter.clear();

    expect(adapter.getItems()).toHaveLength(0);

    const promise = adapter.waitForItem('button-click');
    adapter.processItem(createItem('button-click'));

    await expect(promise).resolves.toMatchObject({ name: 'button-click' });
  });
});
