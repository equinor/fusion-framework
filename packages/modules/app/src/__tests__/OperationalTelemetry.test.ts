import { afterEach, describe, expect, it, vi } from 'vitest';
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

  it('joins the owner registry only while operations are pending', () => {
    const { telemetry } = createTelemetry();
    const registry = new Set<OperationalTelemetry>();
    const scope = new OperationalTelemetry('app', () => telemetry, { registry });
    expect(registry.size).toBe(0);
    const first = scope.start('load');
    const second = scope.start('import');
    expect(registry.has(scope)).toBe(true);
    first('success');
    expect(registry.has(scope)).toBe(true);
    second('success');
    expect(registry.size).toBe(0);
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
