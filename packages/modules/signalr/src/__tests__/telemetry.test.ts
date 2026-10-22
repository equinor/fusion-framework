import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ITelemetryProvider, TelemetryItem } from '@equinor/fusion-framework-module-telemetry';

const sentinel = 'privacy-sentinel-5e02';

/** Controllable stand-in for a SignalR hub connection. */
let nextStart: () => Promise<void> = async () => undefined;

class FakeConnection {
  start = vi.fn<() => Promise<void>>(() => nextStart());
  stop = vi.fn<() => Promise<void>>(async () => undefined);
  on = vi.fn();
  off = vi.fn();
  reconnecting?: (error?: Error) => void;
  reconnected?: () => void;
  close?: (error?: Error) => void;
  onreconnecting(cb: (error?: Error) => void) {
    this.reconnecting = cb;
  }
  onreconnected(cb: () => void) {
    this.reconnected = cb;
  }
  onclose(cb: (error?: Error) => void) {
    this.close = cb;
  }
}

const connections: FakeConnection[] = [];

vi.mock('@microsoft/signalr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@microsoft/signalr')>();
  class HubConnectionBuilder {
    withUrl() {
      return this;
    }
    withAutomaticReconnect() {
      return this;
    }
    configureLogging() {
      return this;
    }
    build() {
      const connection = new FakeConnection();
      connections.push(connection);
      return connection;
    }
  }
  return { ...actual, HubConnectionBuilder };
});

const { AbortError } = await import('@microsoft/signalr');
const { SignalRModuleProvider } = await import('../SignalRModuleProvider.js');

/** Telemetry double that keeps every record the provider would export. */
const createTelemetry = (): { telemetry: ITelemetryProvider; items: TelemetryItem[] } => {
  const items: TelemetryItem[] = [];
  const telemetry = {
    source: { source: 'app', hostId: 'host-1' },
    track: (item: TelemetryItem) => items.push(item),
    trackEvent: (item: TelemetryItem) => items.push(item),
  } as unknown as ITelemetryProvider;
  return { telemetry, items };
};

const names = (items: TelemetryItem[]): string[] =>
  items.map((item) => `${item.name}:${item.diagnostic?.outcome}`);

/** Opens one hub connection with telemetry connected, returning the fake connection. */
const open = (start: () => Promise<void>) => {
  const provider = new SignalRModuleProvider({
    hubs: { [sentinel]: { url: `https://${sentinel}.test/hub`, automaticReconnect: true } },
  } as ConstructorParameters<typeof SignalRModuleProvider>[0]);
  const { telemetry, items } = createTelemetry();
  provider.connectTelemetry(telemetry);
  const hub = (
    provider as unknown as { _createHubConnection(id: string): import('rxjs').Observable<unknown> }
  )._createHubConnection(sentinel);
  const before = connections.length;
  nextStart = start;
  const subscription = hub.subscribe();
  const connection = connections[before];
  return { provider, items, subscription, connection };
};

describe('SignalR operational telemetry', () => {
  afterEach(() => {
    connections.length = 0;
  });

  it('records connect, reconnect and disconnect lifecycles without hub identity', async () => {
    let resolve!: () => void;
    const { provider, items, subscription, connection } = open(
      () => new Promise<void>((r) => (resolve = r)),
    );
    expect(connection.start).toHaveBeenCalledOnce();
    resolve();
    await vi.waitFor(() =>
      expect(names(items)).toContain('fusion.signalr.connect.duration:success'),
    );

    connection.reconnecting?.(new Error(sentinel));
    connection.reconnected?.();
    subscription.unsubscribe();
    await vi.waitFor(() => expect(items).toHaveLength(3));

    expect(names(items)).toEqual([
      'fusion.signalr.connect.duration:success',
      'fusion.signalr.reconnect.duration:success',
      'fusion.signalr.disconnect.duration:success',
    ]);
    expect(connection.stop).toHaveBeenCalledOnce();
    expect(JSON.stringify(items)).not.toContain(sentinel);
    provider.dispose();
  });

  it('classifies teardown during start as cancelled without a failure or disconnect', async () => {
    let reject!: (error: Error) => void;
    const { items, subscription } = open(() => new Promise<void>((_, r) => (reject = r)));
    subscription.unsubscribe();
    reject(new AbortError('stopped during negotiation'));

    await vi.waitFor(() => expect(items).toHaveLength(1));
    expect(names(items)).toEqual(['fusion.signalr.connect.duration:cancelled']);
  });

  it('classifies a start that resolves after teardown as cancelled, not connected', async () => {
    let resolve!: () => void;
    const { items, subscription, connection } = open(() => new Promise<void>((r) => (resolve = r)));
    subscription.unsubscribe();
    resolve();

    await vi.waitFor(() => expect(items).toHaveLength(1));
    expect(names(items)).toEqual(['fusion.signalr.connect.duration:cancelled']);
    // Never marked connected, so a later close is not reported as a lost connection.
    connection.close?.(new Error(sentinel));
    expect(items).toHaveLength(1);
  });

  it('reports a failed start once and keeps rethrowing the original error', async () => {
    const original = new Error(sentinel);
    const unhandled: unknown[] = [];
    const capture = (reason: unknown) => unhandled.push(reason);
    // The provider deliberately rethrows non-abort start failures, as before telemetry.
    process.on('unhandledRejection', capture);
    try {
      const { items, subscription } = open(async () => {
        throw original;
      });
      await vi.waitFor(() => expect(unhandled).toContain(original));
      expect(names(items)).toEqual([
        'fusion.signalr.connect.duration:failure',
        'fusion.signalr.connect.failure:failure',
      ]);
      expect(JSON.stringify(items)).not.toContain(sentinel);
      subscription.unsubscribe();
    } finally {
      process.off('unhandledRejection', capture);
    }
  });

  it('reports a reconnect that ends in close as a failed reconnect', async () => {
    const { items, subscription, connection } = open(async () => undefined);
    await vi.waitFor(() => expect(items).toHaveLength(1));

    connection.reconnecting?.(new Error(sentinel));
    connection.close?.(new Error(sentinel));

    expect(names(items).slice(1)).toEqual([
      'fusion.signalr.reconnect.duration:failure',
      'fusion.signalr.reconnect.failure:failure',
    ]);
    expect(JSON.stringify(items)).not.toContain(sentinel);
    subscription.unsubscribe();
  });

  it('reports an unexpected loss of an established connection once', async () => {
    const { items, subscription, connection } = open(async () => undefined);
    await vi.waitFor(() => expect(items).toHaveLength(1));

    connection.close?.(new Error(sentinel));
    connection.close?.(new Error(sentinel));

    expect(names(items).slice(1)).toEqual(['fusion.signalr.connection-lost:failure']);
    expect(JSON.stringify(items)).not.toContain(sentinel);
    subscription.unsubscribe();
  });

  it('records nothing once telemetry is disconnected', async () => {
    const { provider, items, subscription, connection } = open(async () => undefined);
    provider.connectTelemetry(undefined);
    expect(connection.start).toHaveBeenCalledOnce();
    await Promise.resolve();
    subscription.unsubscribe();
    await Promise.resolve();
    expect(items).toHaveLength(0);
  });
});
