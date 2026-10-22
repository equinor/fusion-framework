import { afterEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom, lastValueFrom, Observable, Subject, throwError } from 'rxjs';
import type { ITelemetryProvider, TelemetryItem } from '@equinor/fusion-framework-module-telemetry';

import { OperationalTelemetry } from '../integrations/OperationalTelemetry';

afterEach(() => vi.restoreAllMocks());

/** Minimal host telemetry with source identity, capturing tracked records. */
const createTelemetry = () => {
  const track = vi.fn<(item: TelemetryItem) => void>();
  const telemetry = {
    source: { source: 'app', hostId: 'host' },
    track,
    trackEvent: vi.fn(),
  } as unknown as ITelemetryProvider;
  return { telemetry, track };
};

describe('OperationalTelemetry', () => {
  it('propagates synchronous downstream unsubscription before a later source error', async () => {
    const { telemetry, track } = createTelemetry();
    const scope = new OperationalTelemetry('app', () => telemetry);
    const continued = vi.fn();
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      if (!subscriber.closed) {
        continued();
        subscriber.error(new Error('sentinel-secret'));
      }
    });

    await expect(firstValueFrom(source.pipe(scope.measure('load')))).resolves.toBe(1);
    expect(continued).not.toHaveBeenCalled();
    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][0]).toMatchObject({
      name: 'fusion.app.load.duration',
      diagnostic: { outcome: 'success' },
    });
    expect(scope.pending).toBe(0);
  });

  it('preserves errors and measures each subscription with independent cancellation state', async () => {
    const { telemetry, track } = createTelemetry();
    const scope = new OperationalTelemetry('app', () => telemetry);
    const original = new Error('sentinel-secret');
    await expect(
      lastValueFrom(throwError(() => original).pipe(scope.measure('load'))),
    ).rejects.toBe(original);
    const gate = new Subject<number>();
    const measured = gate.pipe(scope.measure('load'));
    const first = measured.subscribe();
    const second = measured.subscribe();
    first.unsubscribe();
    gate.next(1);
    second.unsubscribe();
    expect(track.mock.calls.map(([record]) => [record.name, record.diagnostic?.outcome])).toEqual([
      ['fusion.app.load.duration', 'failure'],
      ['fusion.app.load.failure', 'failure'],
      ['fusion.app.load.duration', 'cancelled'],
      ['fusion.app.load.duration', 'success'],
    ]);
    expect(scope.pending).toBe(0);
    expect(JSON.stringify(track.mock.calls)).not.toContain('sentinel-secret');
  });

  it('reserves no timer once 256 operations are pending, so callers can skip observers', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { telemetry } = createTelemetry();
    const scope = new OperationalTelemetry('app', () => telemetry);
    const ends = Array.from({ length: 256 }, () => scope.reserve('load'));
    expect(ends.every((end) => typeof end === 'function')).toBe(true);
    expect(scope.reserve('load')).toBeUndefined();
    expect(scope.pending).toBe(256);
    // Settling one frees one slot.
    ends[0]?.('success');
    expect(scope.reserve('load')).toBeTypeOf('function');
  });

  it('reserves nothing without telemetry and stays inactive', () => {
    const scope = new OperationalTelemetry('app', () => undefined);
    expect(scope.active).toBe(false);
    expect(scope.reserve('load')).toBeUndefined();
    expect(new OperationalTelemetry('app').reserve('load')).toBeUndefined();
  });

  it('derives child scopes that share connection and close only work in flight', () => {
    const { telemetry, track } = createTelemetry();
    const parent = new OperationalTelemetry('app');
    const busy = parent.createScope({ identity: () => ({ appKey: 'busy' }) });
    const idle = parent.createScope({ identity: () => ({ appKey: 'idle' }) });
    // Children resolve telemetry through the parent, so connecting later reaches them.
    expect(busy.active).toBe(false);
    parent.connect(() => telemetry);
    expect(busy.active).toBe(true);

    busy.start('load-manifest');
    idle.start('load-manifest')('success');
    expect(track).toHaveBeenCalledTimes(1);

    // Closing a child never affects its siblings or the parent.
    const sibling = parent.createScope();
    sibling.close();
    expect(busy.active).toBe(true);

    parent.close({ reason: 'disposed' });
    expect(track).toHaveBeenCalledTimes(2);
    expect(track.mock.calls[1][0]).toMatchObject({
      name: 'fusion.app.load-manifest.duration',
      properties: { appKey: 'busy', reason: 'disposed' },
    });
    // Idle children go inert with the parent, and new children cannot report.
    idle.start('import')('success');
    parent.createScope().start('import')('success');
    expect(track).toHaveBeenCalledTimes(2);
  });

  it('closes with end-time identity, releases owned teardowns and then emits nothing', () => {
    const { telemetry, track } = createTelemetry();
    let version = 'unknown';
    const scope = new OperationalTelemetry('app', () => telemetry, {
      identity: () => ({ appVersion: version }),
    });
    const teardown = vi.fn();
    scope.own(teardown);
    scope.start('load');
    version = '1.2.3';
    scope.close({ reason: 'disposed' });
    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][0]).toMatchObject({
      name: 'fusion.app.load.duration',
      properties: { appVersion: '1.2.3', reason: 'disposed' },
    });
    expect(teardown).toHaveBeenCalledTimes(1);
    // Resources added after close are released immediately, and nothing more is recorded.
    const late = vi.fn();
    scope.own(late);
    expect(late).toHaveBeenCalledTimes(1);
    scope.start('load')('success');
    scope.notify('status', 'success');
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('treats a throwing telemetry lookup as absent', () => {
    const scope = new OperationalTelemetry('app', () => {
      throw new Error('lookup failed');
    });
    expect(scope.active).toBe(false);
    expect(() => scope.start('load')('success')).not.toThrow();
  });
});
