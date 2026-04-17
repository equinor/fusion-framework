import { describe, it, expect } from 'vitest';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';

import { mergeContextProviders } from '../orchestrator/context-provider-adapter';

const createMockProvider = (overrides: Partial<IContextProvider> = {}): IContextProvider =>
  ({
    version: '8.0.0',
    routingStrategy: undefined,
    currentContext: null,
    extractContextIdFromPath: undefined,
    generatePathFromContext: undefined,
    ...overrides,
  }) as unknown as IContextProvider;

describe('mergeContextProviders', () => {
  it('prefers app version over portal version', () => {
    const merged = mergeContextProviders(
      createMockProvider({ version: '9.0.0' }),
      createMockProvider({ version: '8.0.0' }),
    );
    expect(merged.version).toBe('9.0.0');
  });

  it('falls back to portal version when app has none', () => {
    const merged = mergeContextProviders(undefined, createMockProvider({ version: '8.0.0' }));
    expect(merged.version).toBe('8.0.0');
  });

  it('prefers app routingStrategy over portal', () => {
    const merged = mergeContextProviders(
      createMockProvider({ routingStrategy: 'query' }),
      createMockProvider({ routingStrategy: 'path' }),
    );
    expect(merged.routingStrategy).toBe('query');
  });

  it('falls back to portal routingStrategy when app has none', () => {
    const merged = mergeContextProviders(
      createMockProvider({ routingStrategy: undefined }),
      createMockProvider({ routingStrategy: 'path' }),
    );
    expect(merged.routingStrategy).toBe('path');
  });

  it('prefers app currentContext over portal', () => {
    const appContext = { id: 'app-ctx' } as any;
    const portalContext = { id: 'portal-ctx' } as any;
    const merged = mergeContextProviders(
      createMockProvider({ currentContext: appContext }),
      createMockProvider({ currentContext: portalContext }),
    );
    expect(merged.currentContext?.id).toBe('app-ctx');
  });

  it('uses app extractContextIdFromPath when available', () => {
    const appExtract = (path: string) => `app-${path}`;
    const portalExtract = (path: string) => `portal-${path}`;
    const merged = mergeContextProviders(
      createMockProvider({ extractContextIdFromPath: appExtract }),
      createMockProvider({ extractContextIdFromPath: portalExtract }),
    );
    expect(merged.extractContextIdFromPath?.('/test')).toBe('app-/test');
  });

  it('falls back to portal extractContextIdFromPath', () => {
    const portalExtract = (path: string) => `portal-${path}`;
    const merged = mergeContextProviders(
      createMockProvider({ extractContextIdFromPath: undefined }),
      createMockProvider({ extractContextIdFromPath: portalExtract }),
    );
    expect(merged.extractContextIdFromPath?.('/test')).toBe('portal-/test');
  });

  it('uses app generatePathFromContext when available', () => {
    const appGen = (_ctx: any, _path: string) => '/app-generated';
    const portalGen = (_ctx: any, _path: string) => '/portal-generated';
    const merged = mergeContextProviders(
      createMockProvider({ generatePathFromContext: appGen }),
      createMockProvider({ generatePathFromContext: portalGen }),
    );
    expect(merged.generatePathFromContext?.({} as any, '/current')).toBe('/app-generated');
  });
});
