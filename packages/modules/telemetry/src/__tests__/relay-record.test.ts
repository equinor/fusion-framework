import { describe, expect, it, vi } from 'vitest';
import { relayRecord } from '../utils/relay-record.js';
import { TelemetryLevel, TelemetryType } from '../static.js';
import type { ITelemetryProvider } from '../TelemetryProvider.interface.js';
import type { TelemetryItem } from '../types.js';

const item: TelemetryItem = {
  name: 'record',
  type: TelemetryType.Event,
  level: TelemetryLevel.Information,
  scope: [],
};

/** Creates a parent; legacy parents lack `trackRelayed`. */
function parent(legacy = false): ITelemetryProvider {
  return {
    track: vi.fn(),
    ...(legacy ? {} : { trackRelayed: vi.fn() }),
  } as unknown as ITelemetryProvider;
}

describe('relay record', () => {
  it('carries exporter ownership to ownership-aware parents', () => {
    const target = parent();
    expect(relayRecord(target, item, { ownsExport: true })).toBe(true);
    expect(target.trackRelayed).toHaveBeenCalledWith(item, true);
    expect(target.track).not.toHaveBeenCalled();
  });

  it('treats an intentional relay filter rejection as handled without delivering', () => {
    const target = parent();
    expect(relayRecord(target, item, { ownsExport: false, relay: () => false })).toBe(true);
    expect(target.trackRelayed).not.toHaveBeenCalled();
  });

  it('only gives legacy parents records that no child exporter owns', () => {
    const target = parent(true);
    expect(relayRecord(target, item, { ownsExport: false })).toBe(true);
    expect(target.track).toHaveBeenCalledWith(item);
    expect(relayRecord(target, item, { ownsExport: true })).toBe(false);
    expect(target.track).toHaveBeenCalledOnce();
  });

  it('rethrows filter errors for the caller to report', () => {
    const failure = new Error('filter failed');
    expect(() =>
      relayRecord(parent(), item, {
        ownsExport: false,
        relay: () => {
          throw failure;
        },
      }),
    ).toThrow(failure);
  });
});
