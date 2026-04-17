import { describe, it, expect } from 'vitest';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';

import { legacyPathStrategyAdapter } from '../strategy-adapters/legacy-path-adapter';
import { pathStrategyAdapter } from '../strategy-adapters/path-strategy-adapter';
import { queryStrategyAdapter } from '../strategy-adapters/query-strategy-adapter';
import { customStrategyAdapter } from '../strategy-adapters/custom-adapter';
import { getContextNavigationStrategyAdapter } from '../strategy-adapters/registry';

const UUID = '12345678-1234-1234-1234-123456789abc';

const createMockProvider = (overrides: Partial<IContextProvider> = {}): IContextProvider =>
  ({
    version: '8.0.0',
    routingStrategy: undefined,
    currentContext: null,
    extractContextIdFromPath: undefined,
    generatePathFromContext: undefined,
    ...overrides,
  }) as unknown as IContextProvider;

const CONTEXT_ITEM = { id: UUID } as any;

describe('strategy-adapters', () => {
  describe('legacyPathStrategyAdapter', () => {
    it('mode is legacy', () => {
      expect(legacyPathStrategyAdapter.mode).toBe('legacy');
    });

    it('onContextChange upserts context in path', () => {
      const result = legacyPathStrategyAdapter.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: createMockProvider(),
        portalPathname: '/apps/my-app',
        portalSearch: '',
      });
      expect(result?.pathname).toBe(`/apps/my-app/${UUID}`);
    });

    it('onAppSwitch uses generatePathFromContext when available', () => {
      const provider = createMockProvider({
        currentContext: CONTEXT_ITEM,
        generatePathFromContext: (_ctx, _path) => `/apps/my-app/${UUID}`,
        extractContextIdFromPath: (path) => path.split('/')[3],
      });
      const result = legacyPathStrategyAdapter.onAppSwitch({
        newPathname: '/apps/my-app',
        newSearch: '',
        contextIdToCarry: UUID,
        activeContextProvider: provider,
      });
      expect(result?.pathname).toBe(`/apps/my-app/${UUID}`);
    });

    it('onAppSwitch falls back to upsert when generatePath not available', () => {
      const result = legacyPathStrategyAdapter.onAppSwitch({
        newPathname: '/apps/my-app',
        newSearch: '',
        contextIdToCarry: UUID,
        activeContextProvider: createMockProvider(),
      });
      expect(result?.pathname).toBe(`/apps/my-app/${UUID}`);
    });
  });

  describe('pathStrategyAdapter', () => {
    it('mode is path', () => {
      expect(pathStrategyAdapter.mode).toBe('path');
    });

    it('onContextChange upserts context in path', () => {
      const result = pathStrategyAdapter.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: createMockProvider(),
        portalPathname: '/apps/my-app',
        portalSearch: '',
      });
      expect(result?.pathname).toBe(`/apps/my-app/${UUID}`);
    });

    it('onContextChange preserves sub-routes', () => {
      const NEW_UUID = 'abcdef01-2345-6789-abcd-ef0123456789';
      const result = pathStrategyAdapter.onContextChange({
        newContext: { id: NEW_UUID } as any,
        activeContextProvider: createMockProvider(),
        portalPathname: `/apps/my-app/${UUID}/settings`,
        portalSearch: '',
      });
      expect(result?.pathname).toBe(`/apps/my-app/${NEW_UUID}/settings`);
    });

    it('onAppSwitch upserts context', () => {
      const result = pathStrategyAdapter.onAppSwitch({
        newPathname: '/apps/target-app',
        newSearch: '',
        contextIdToCarry: UUID,
        activeContextProvider: createMockProvider(),
      });
      expect(result?.pathname).toBe(`/apps/target-app/${UUID}`);
    });
  });

  describe('queryStrategyAdapter', () => {
    it('mode is query', () => {
      expect(queryStrategyAdapter.mode).toBe('query');
    });

    it('onContextChange adds $contextId query param', () => {
      const result = queryStrategyAdapter.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: createMockProvider(),
        portalPathname: '/apps/my-app',
        portalSearch: '',
      });
      expect(result?.pathname).toBe('/apps/my-app');
      expect(result?.search).toContain(`$contextId=${UUID}`);
    });

    it('onContextChange canonicalizes path→query', () => {
      const provider = createMockProvider({
        extractContextIdFromPath: (path) => path.split('/')[3],
      });
      const result = queryStrategyAdapter.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: provider,
        portalPathname: `/apps/my-app/${UUID}`,
        portalSearch: '',
      });
      // Context stripped from path, added to query
      expect(result?.pathname).toBe('/apps/my-app');
      expect(result?.search).toContain(`$contextId=${UUID}`);
    });

    it('onAppSwitch adds $contextId to target', () => {
      const result = queryStrategyAdapter.onAppSwitch({
        newPathname: '/apps/target-app',
        newSearch: '',
        contextIdToCarry: UUID,
        activeContextProvider: createMockProvider(),
      });
      expect(result?.pathname).toBe('/apps/target-app');
      expect(result?.search).toContain(`$contextId=${UUID}`);
    });
  });

  describe('customStrategyAdapter', () => {
    it('mode is custom', () => {
      expect(customStrategyAdapter.mode).toBe('custom');
    });

    it('onContextChange returns undefined when no generatePathFromContext', () => {
      const result = customStrategyAdapter.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: createMockProvider(),
        portalPathname: '/apps/my-app/custom',
        portalSearch: '',
      });
      expect(result).toBeUndefined();
    });

    it('onContextChange uses generatePathFromContext when available', () => {
      const provider = createMockProvider({
        generatePathFromContext: (_ctx, _path) => '/custom-generated',
      });
      const result = customStrategyAdapter.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: provider,
        portalPathname: '/apps/my-app/custom',
        portalSearch: '',
      });
      expect(result?.pathname).toBe('/apps/my-app/custom-generated');
    });

    it('onAppSwitch returns undefined when no hooks', () => {
      const result = customStrategyAdapter.onAppSwitch({
        newPathname: '/apps/custom-app',
        newSearch: '',
        contextIdToCarry: UUID,
        activeContextProvider: createMockProvider(),
      });
      expect(result).toBeUndefined();
    });
  });

  describe('getContextNavigationStrategyAdapter (registry)', () => {
    it('returns legacy adapter', () => {
      expect(getContextNavigationStrategyAdapter('legacy').mode).toBe('legacy');
    });

    it('returns path adapter', () => {
      expect(getContextNavigationStrategyAdapter('path').mode).toBe('path');
    });

    it('returns query adapter', () => {
      expect(getContextNavigationStrategyAdapter('query').mode).toBe('query');
    });

    it('returns custom adapter', () => {
      expect(getContextNavigationStrategyAdapter('custom').mode).toBe('custom');
    });
  });
});
