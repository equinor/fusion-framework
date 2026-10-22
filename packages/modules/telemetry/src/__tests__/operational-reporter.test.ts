import { afterEach, describe, expect, it, vi } from 'vitest';
import { TelemetryLevel } from '../static.js';
import type { TelemetryItem } from '../types.js';
import {
  createOperationalReporter,
  type OperationalTelemetryTarget,
} from '../utils/create-operational-reporter.js';
import { createOperationalTelemetry } from '../utils/index.js';

afterEach(() => vi.restoreAllMocks());

/** Narrowed provider double, as modules pass when they depend only on these members. */
const createTarget = (): OperationalTelemetryTarget & { items: TelemetryItem[] } => {
  const items: TelemetryItem[] = [];
  return {
    items,
    source: { source: 'framework', hostId: 'host-1' },
    track: (item) => {
      items.push(item);
    },
    trackEvent: (item) => {
      items.push(item as TelemetryItem);
    },
  };
};

describe('createOperationalReporter', () => {
  it('pairs a measured failure with one sanitized exception', () => {
    const target = createTarget();
    const report = createOperationalReporter(() => target);

    report({ module: 'reports', operation: 'export', outcome: 'failure', duration: 0 });

    expect(target.items.map((item) => [item.name, item.level])).toEqual([
      ['fusion.reports.export.duration', TelemetryLevel.Information],
      ['fusion.reports.export.failure', TelemetryLevel.Error],
    ]);
    expect(target.items[0].diagnostic).toMatchObject({ outcome: 'failure', hostId: 'host-1' });
  });

  it('derives notification severity from the outcome unless a level is given', () => {
    const target = createTarget();
    const report = createOperationalReporter(() => target);

    report({ module: 'reports', operation: 'hit', outcome: 'success', notification: true });
    report({ module: 'reports', operation: 'lost', outcome: 'failure', notification: true });
    report({
      module: 'reports',
      operation: 'fallback',
      outcome: 'success',
      notification: true,
      level: TelemetryLevel.Warning,
    });

    expect(target.items.map((item) => [item.name, item.level])).toEqual([
      ['fusion.reports.hit', TelemetryLevel.Information],
      ['fusion.reports.lost', TelemetryLevel.Error],
      ['fusion.reports.fallback', TelemetryLevel.Warning],
    ]);
    // Severity is the event's own field, never part of the allowlisted envelope.
    expect(target.items[2].diagnostic).not.toHaveProperty('level');
    expect(target.items[2].diagnostic).not.toHaveProperty('notification');
  });

  it('records nothing without a provider and warns once for a provider without identity', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() =>
      createOperationalReporter(() => undefined)({
        module: 'reports',
        operation: 'export',
        outcome: 'success',
        duration: 1,
      }),
    ).not.toThrow();
    expect(warn).not.toHaveBeenCalled();

    const anonymous = { ...createTarget(), source: undefined };
    const report = createOperationalReporter(() => anonymous);
    report({ module: 'reports', operation: 'export', outcome: 'success', duration: 1 });
    report({ module: 'reports', operation: 'export', outcome: 'success', duration: 1 });

    expect(anonymous.items).toHaveLength(0);
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe('createOperationalTelemetry', () => {
  it('binds the module label and reports only while connected', () => {
    const target = createTarget();
    const telemetry = createOperationalTelemetry('reports');

    telemetry.report({ operation: 'export', outcome: 'success', duration: 1 });
    expect(telemetry.connected).toBe(false);

    telemetry.connect(target);
    telemetry.report({ operation: 'export', outcome: 'success', duration: 1 });
    telemetry.report({
      operation: 'fallback',
      outcome: 'success',
      notification: true,
      level: TelemetryLevel.Warning,
    });

    expect(telemetry.connected).toBe(true);
    expect(target.items.map((item) => [item.name, item.diagnostic?.module])).toEqual([
      ['fusion.reports.export.duration', 'reports'],
      ['fusion.reports.fallback', 'reports'],
    ]);
  });

  it('stops permanently on disconnect, ignoring a late connection', () => {
    const target = createTarget();
    const telemetry = createOperationalTelemetry('reports');
    telemetry.connect(target);

    telemetry.disconnect();
    telemetry.connect(target);
    telemetry.report({ operation: 'export', outcome: 'success', duration: 1 });

    expect(telemetry.connected).toBe(false);
    expect(target.items).toHaveLength(0);
  });

  it('rejects a dynamic module label when the handle is created', () => {
    expect(() => createOperationalTelemetry('https://example.com')).toThrow(RangeError);
  });
});
