import { describe, expect, it } from 'vitest';
import type { AppConfig } from '@equinor/fusion-framework-cli/app';
import { mergeAppConfig } from './merge-app-config.js';

/**
 * Treats a minimal fixture as an app config shape.
 *
 * @template T - Shape the fixture stands in for.
 * @param value - Minimal fixture object.
 * @returns The fixture typed as `T`.
 */
const fixture = <T>(value: unknown): T =>
  // Fixtures only carry the keys under test; the merge never reads the omitted required fields
  value as T;

describe('mergeAppConfig', () => {
  it('replaces scopes at any depth while deep-merging other properties', () => {
    const base = fixture<AppConfig>({
      environment: { a: 1 },
      endpoints: { api: { url: 'https://base', scopes: ['base/.default'] } },
    });
    const overrides = fixture<Partial<AppConfig>>({
      environment: { b: 2 },
      endpoints: { api: { scopes: ['override/.default'] } },
    });

    expect(mergeAppConfig(base, overrides)).toEqual({
      environment: { a: 1, b: 2 },
      endpoints: { api: { url: 'https://base', scopes: ['override/.default'] } },
    });
  });

  it('does not mutate the base configuration', () => {
    const base = fixture<AppConfig>({ environment: { a: 1 } });

    mergeAppConfig(base, fixture<Partial<AppConfig>>({ environment: { b: 2 } }));

    expect(base).toEqual({ environment: { a: 1 } });
  });
});
