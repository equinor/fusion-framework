import { describe, expect, it, vi } from 'vitest';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { WidgetModuleProvider } from '../WidgetModuleProvider.js';
import type { IClient } from '../types.js';
import { version } from '../version.js';

/** Builds a widget client whose queries are never executed by these tests. */
const createClient = (): IClient => ({
  apiVersion: '1.0',
  baseImportUrl: 'https://widgets.example.com',
  getWidgetManifest: { client: { fn: vi.fn() }, key: (args) => JSON.stringify(args) },
  getWidgetConfig: { client: { fn: vi.fn() }, key: (args) => JSON.stringify(args) },
});

describe('WidgetModuleProvider', () => {
  it('extends BaseModuleProvider and exposes the package version', () => {
    const provider = new WidgetModuleProvider({ config: { client: createClient() } });

    expect(provider).toBeInstanceOf(BaseModuleProvider);
    expect(String(provider.version)).toBe(version);

    provider.dispose();
  });

  it('can be disposed more than once without throwing', () => {
    const provider = new WidgetModuleProvider({ config: { client: createClient() } });

    provider.dispose();

    expect(() => provider.dispose()).not.toThrow();
  });
});
