import type z from 'zod';
import { describe, it, expect } from 'vitest';
import { TelemetryLevel, TelemetryType } from '../src/static.js';
import { parseTelemetryItem, TelemetryCustomEventSchema } from '../src/schemas.js';

describe('parseTelemetryItem', () => {
  it('parses a valid event telemetry item', () => {
    const input = {
      name: 'test-event',
      type: TelemetryType.Event,
      level: TelemetryLevel.Information,
      properties: { foo: 'bar' },
      metadata: { meta: 1 },
      scope: ['a', 'b', 'a'],
    };
    // biome-ignore lint/suspicious/noExplicitAny: We are testing the parsing function
    const result = parseTelemetryItem(input as any);
    expect(result).toEqual({
      ...input,
      scope: ['a', 'b'], // deduplicated
    });
  });

  it('parses a valid exception telemetry item', () => {
    const error = new Error('fail');
    const input = {
      name: 'test-exception',
      type: TelemetryType.Exception,
      exception: error,
      level: TelemetryLevel.Error,
      properties: { foo: 'bar' },
      metadata: { meta: 1 },
    };
    // biome-ignore lint/suspicious/noExplicitAny: We are testing the parsing function
    const result = parseTelemetryItem(input as any);
    expect(result).toMatchObject(input);
  });

  it('parses a valid metric telemetry item', () => {
    const input = {
      name: 'test-metric',
      type: TelemetryType.Metric,
      value: 42,
      level: TelemetryLevel.Information,
      properties: { foo: 'bar' },
      metadata: { meta: 1 },
    };
    // biome-ignore lint/suspicious/noExplicitAny: We are testing the parsing function
    const result = parseTelemetryItem(input as any);
    expect(result).toMatchObject(input);
  });

  it('parses a valid custom telemetry event with passthrough properties', () => {
    const input = {
      name: 'test-custom',
      type: TelemetryType.Custom,
      extra: 'extra-value',
      properties: { foo: 'bar' },
      metadata: { meta: 1 },
    };
    // biome-ignore lint/suspicious/noExplicitAny: We are testing the parsing function
    const result = parseTelemetryItem(input as any);
    expect(result).toMatchObject(input);
  });

  it('throws on unknown telemetry type', () => {
    const input = {
      name: 'unknown',
      type: 'unknown-type',
    };
    // biome-ignore lint/suspicious/noExplicitAny: We are testing error handling
    expect(() => parseTelemetryItem(input as any)).toThrow(/Unknown telemetry type/);
  });

  it('applies default level if not provided', () => {
    const result = parseTelemetryItem({
      type: TelemetryType.Event,
      name: 'default-level',
    });
    expect(result.level).toBe(TelemetryLevel.Information);
  });

  it('deduplicates scope array', () => {
    const result = parseTelemetryItem({
      type: TelemetryType.Event,
      name: 'scope-test',
      scope: ['x', 'y', 'x', 'z', 'y'],
    });
    expect(result.scope).toEqual(['x', 'y', 'z']);
  });
});
