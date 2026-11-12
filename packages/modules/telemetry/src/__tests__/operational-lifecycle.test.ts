import { afterEach, describe, expect, it, vi } from 'vitest';
import { EMPTY, firstValueFrom, lastValueFrom, Observable, Subject, throwError } from 'rxjs';
import type { ITelemetryProvider, TelemetryItem } from '@equinor/fusion-framework-module-telemetry';

import {
  createOperationalTelemetry,
  classifyOperationalError,
  markOperationalCancellation,
  markOperationalReason,
  safeOperationalIdentity,
} from '../utils/index.js';

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
    const scope = createOperationalTelemetry('app');
    scope.connect(telemetry);
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
    const scope = createOperationalTelemetry('app');
    scope.connect(telemetry);
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
    const scope = createOperationalTelemetry('app');
    scope.connect(telemetry);
    const ends = Array.from({ length: 256 }, () => scope.reserve('load'));
    expect(ends.every((end) => typeof end === 'function')).toBe(true);
    expect(scope.reserve('load')).toBeUndefined();
    expect(scope.pending).toBe(256);
    // Settling one frees one slot.
    ends[0]?.('success');
    expect(scope.reserve('load')).toBeTypeOf('function');
  });

  it('reserves nothing without telemetry and stays inactive', () => {
    const scope = createOperationalTelemetry('app');
    expect(scope.active).toBe(false);
    expect(scope.reserve('load')).toBeUndefined();
    expect(createOperationalTelemetry('app').reserve('load')).toBeUndefined();
  });

  it('derives child scopes that share connection and close only work in flight', async () => {
    const { telemetry, track } = createTelemetry();
    const parent = createOperationalTelemetry('app');
    const busy = parent.createScope({ identity: () => ({ appKey: 'busy' }) });
    const idle = parent.createScope({ identity: () => ({ appKey: 'idle' }) });
    // Children resolve telemetry through the parent, so connecting later reaches them.
    expect(busy.active).toBe(false);
    parent.connect(telemetry);
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
    const scope = createOperationalTelemetry('app', {
      identity: () => ({ appVersion: version }),
    });
    scope.connect(telemetry);
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

  it('isolates a throwing identity resolver and warns once without exposing its error', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { telemetry, track } = createTelemetry();
    const scope = createOperationalTelemetry('app', {
      identity: () => {
        throw new Error('sentinel-secret');
      },
    });
    scope.connect(telemetry);
    expect(() => scope.start('load')('success')).not.toThrow();
    scope.start('load')('failure');
    expect(track).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
    expect(JSON.stringify(warn.mock.calls)).not.toContain('sentinel-secret');
  });

  it('cancels pending work exactly once on disconnect and ignores all late outcomes', () => {
    const { telemetry, track } = createTelemetry();
    const scope = createOperationalTelemetry('app');
    scope.connect(telemetry);
    const end = scope.start('load', { count: 2 });
    scope.disconnect();
    scope.disconnect();
    end('success');
    end('failure');
    scope.connect(telemetry);
    scope.report({ operation: 'load', outcome: 'success', duration: 1 });
    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][0]).toMatchObject({
      properties: { count: 2 },
      diagnostic: { outcome: 'cancelled' },
    });
    expect(scope.pending).toBe(0);
  });

  it('closes nested busy scopes and observer-only children, including idle descendants', () => {
    const { telemetry, track } = createTelemetry();
    const parent = createOperationalTelemetry('app');
    parent.connect(telemetry);
    const child = parent.createScope();
    const grandchild = child.createScope();
    const idle = child.createScope();
    const end = grandchild.start('load');
    const release = vi.fn();
    parent.createScope().own(release);
    parent.close({ reason: 'disposed' });
    end('failure');
    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][0]).toMatchObject({
      properties: { reason: 'disposed' },
      diagnostic: { outcome: 'cancelled' },
    });
    expect(release).toHaveBeenCalledOnce();
    const late = vi.fn();
    idle.own(late);
    expect(late).toHaveBeenCalledOnce();
    expect(idle.active).toBe(false);
  });

  it('keeps an observer-only child owned until a disconnected parent closes', () => {
    const parent = createOperationalTelemetry('app');
    const release = vi.fn();
    parent.createScope().own(release);
    expect(release).not.toHaveBeenCalled();
    parent.close();
    expect(release).toHaveBeenCalledOnce();
  });

  it('releases other observers and records one sanitized warning if a teardown throws', () => {
    const scope = createOperationalTelemetry('app');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const release = vi.fn();
    scope.own(() => {
      throw new Error('sentinel-secret');
    });
    scope.own(release);
    expect(() => scope.close()).not.toThrow();
    expect(release).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledOnce();
    expect(JSON.stringify(warn.mock.calls)).not.toContain('sentinel-secret');
  });

  it('treats empty completion as success and marked wrapped errors as cancellation', () => {
    const { telemetry, track } = createTelemetry();
    const scope = createOperationalTelemetry('app');
    scope.connect(telemetry);
    EMPTY.pipe(scope.measure('load')).subscribe();
    const error = new Error('wrapper', {
      cause: markOperationalCancellation(new Error('sentinel-secret'), 'listener'),
    });
    const observed = vi.fn();
    throwError(() => error)
      .pipe(scope.measure('load'))
      .subscribe({ error: observed });
    expect(observed).toHaveBeenCalledWith(error);
    expect(track.mock.calls.map(([record]) => record.diagnostic?.outcome)).toEqual([
      'success',
      'cancelled',
    ]);
    expect(track.mock.calls[1][0].properties).toEqual({ reason: 'listener' });
  });

  it('copies primitive summaries onto both failure records and notification reports', () => {
    const { telemetry, track } = createTelemetry();
    const scope = createOperationalTelemetry('app');
    scope.connect(telemetry);
    const properties = { reason: 'validation', count: 2, cached: false };
    scope.report({ operation: 'load', outcome: 'failure', duration: 0, properties });
    scope.report({ operation: 'status', outcome: 'success', notification: true, properties });
    properties.count = 3;
    expect(track.mock.calls.map(([record]) => record.properties)).toEqual([
      { reason: 'validation', count: 2, cached: false },
      { reason: 'validation', count: 2, cached: false },
    ]);
    expect(telemetry.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: { reason: 'validation', count: 2, cached: false },
      }),
    );
  });
});

describe('operational safety helpers', () => {
  it('classifies marked reasons without changing errors and bounds cyclic cause traversal', () => {
    const error = new Error('sentinel-secret');
    expect(markOperationalReason(error, 'validation')).toBe(error);
    expect(classifyOperationalError(error)).toEqual({ outcome: 'failure', reason: 'validation' });
    expect(markOperationalCancellation(error)).toBe(error);
    expect(classifyOperationalError(new Error('wrapper', { cause: error }))).toEqual({
      outcome: 'cancelled',
      reason: 'validation',
    });
    const cyclic: { cause?: unknown } = {};
    cyclic.cause = cyclic;
    expect(classifyOperationalError(cyclic)).toEqual({ outcome: 'failure', reason: undefined });
    expect(classifyOperationalError('sentinel-secret').outcome).toBe('failure');
    expect(error.message).toBe('sentinel-secret');
  });

  it('allows bounded static keys and versions but omits dynamic identity fragments', () => {
    expect(safeOperationalIdentity('my-app')).toBe('my-app');
    expect(safeOperationalIdentity('1.2.3-beta+build', 'version')).toBe('1.2.3-beta+build');
    for (const value of [undefined, 12, '', 'https://host', '/path', 'two words', 'a'.repeat(65)]) {
      expect(safeOperationalIdentity(value)).toBeUndefined();
      expect(safeOperationalIdentity(value, 'version')).toBeUndefined();
    }
  });
});
