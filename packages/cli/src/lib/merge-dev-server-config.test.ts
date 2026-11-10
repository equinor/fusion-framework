import { describe, expect, it } from 'vitest';
import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import { mergeDevServerConfig } from './merge-dev-server-config.js';

type Overrides = Parameters<typeof mergeDevServerConfig>[1];
type MergedApi = {
  api: { routes: Array<{ match: string; middleware: unknown }>; processServices: string[] };
};

/**
 * Treats a minimal fixture as a full dev-server shape.
 *
 * @template T - Shape the fixture stands in for.
 * @param value - Minimal fixture object.
 * @returns The fixture typed as `T`.
 */
const fixture = <T>(value: unknown): T =>
  // Fixtures only carry the keys under test; the merge never reads the omitted required fields
  value as T;

describe('mergeDevServerConfig', () => {
  it('merges routes by match with override routes winning, and de-duplicates other arrays', () => {
    const baseMiddleware = (): void => {};
    const overrideMiddleware = (): void => {};
    const base = fixture<DevServerOptions>({
      api: {
        routes: [
          { match: '/a', middleware: baseMiddleware },
          { match: '/b', middleware: baseMiddleware },
        ],
        processServices: ['x', 'y'],
      },
    });
    const overrides = fixture<Overrides>({
      api: {
        routes: [{ match: '/b', middleware: overrideMiddleware }],
        processServices: ['y', 'z'],
      },
    });

    const result = fixture<MergedApi>(mergeDevServerConfig(base, overrides));

    expect(result.api.routes).toEqual([
      { match: '/a', middleware: baseMiddleware },
      { match: '/b', middleware: overrideMiddleware },
    ]);
    expect(result.api.processServices).toEqual(['x', 'y', 'z']);
  });

  it('keeps base values when overrides are empty', () => {
    const base = fixture<DevServerOptions>({ api: { processServices: ['x'] } });

    expect(mergeDevServerConfig(base, {})).toEqual(base);
  });
});
