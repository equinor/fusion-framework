import { describe, it, expect } from 'vitest';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';

import { contextNavigationOrchestrator } from '../orchestrator/context-navigation-orchestrator';

/** Creates a minimal mock context provider for testing. */
const createMockProvider = (overrides: Partial<IContextProvider> = {}): IContextProvider =>
  ({
    version: '8.0.0',
    routingStrategy: undefined,
    currentContext: null,
    extractContextIdFromPath: undefined,
    generatePathFromContext: undefined,
    ...overrides,
  }) as unknown as IContextProvider;

const CONTEXT_ITEM = { id: 'ctx-abc' } as any;
const NEW_CONTEXT = { id: 'ctx-new' } as any;

describe('contextNavigationOrchestrator', () => {
  // ── Context-change tests ────────────────────────────────────────

  describe('onContextChange', () => {
    it('case 1: query strategy → $contextId query param', () => {
      const { mode, instruction } = contextNavigationOrchestrator.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: createMockProvider({ routingStrategy: 'query', version: '8.0.0' }),
        hasAppContextProvider: true,
        portalPathname: '/apps/my-app',
        portalSearch: '',
      });
      expect(mode).toBe('query');
      expect(instruction).toEqual({
        pathname: '/apps/my-app',
        search: '?$contextId=ctx-abc',
      });
    });

    it('case 2: path strategy → 3rd segment', () => {
      const { mode, instruction } = contextNavigationOrchestrator.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: createMockProvider({ routingStrategy: 'path', version: '8.0.0' }),
        hasAppContextProvider: true,
        portalPathname: '/apps/my-app',
        portalSearch: '',
      });
      expect(mode).toBe('path');
      expect(instruction?.pathname).toBe('/apps/my-app/ctx-abc');
    });

    it('case 3: query strategy replaces existing context', () => {
      const { instruction } = contextNavigationOrchestrator.onContextChange({
        newContext: NEW_CONTEXT,
        activeContextProvider: createMockProvider({ routingStrategy: 'query', version: '8.0.0' }),
        hasAppContextProvider: true,
        portalPathname: '/apps/my-app',
        portalSearch: '?$contextId=ctx-abc',
      });
      expect(instruction?.search).toContain('$contextId=ctx-new');
      expect(instruction?.search).not.toContain('ctx-abc');
    });

    it('case 4: legacy version → forces path mode', () => {
      const { mode, instruction } = contextNavigationOrchestrator.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: createMockProvider({
          routingStrategy: 'query',
          version: '7.5.0',
        }),
        hasAppContextProvider: true,
        portalPathname: '/apps/my-app',
        portalSearch: '',
      });
      expect(mode).toBe('legacy');
      expect(instruction?.pathname).toBe('/apps/my-app/ctx-abc');
    });

    it('case 9: query canonicalization — path context moved to query', () => {
      const provider = createMockProvider({
        routingStrategy: 'query',
        version: '8.0.0',
        extractContextIdFromPath: (path: string) => {
          const parts = path.split('/');
          return parts[3];
        },
      });
      const { instruction } = contextNavigationOrchestrator.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: provider,
        hasAppContextProvider: true,
        portalPathname: '/apps/my-app/ctx-abc',
        portalSearch: '',
      });
      // Should strip context from path and add to query
      expect(instruction?.pathname).toBe('/apps/my-app');
      expect(instruction?.search).toContain('$contextId=ctx-abc');
    });

    it('case 14: custom strategy → returns no instruction', () => {
      const { mode, instruction } = contextNavigationOrchestrator.onContextChange({
        newContext: CONTEXT_ITEM,
        activeContextProvider: createMockProvider({
          routingStrategy: 'custom',
          version: '8.0.0',
        }),
        hasAppContextProvider: true,
        portalPathname: '/apps/my-app/custom-route',
        portalSearch: '',
      });
      expect(mode).toBe('custom');
      expect(instruction).toBeUndefined();
    });

    it('case 16: same context does not change URL (path)', () => {
      const UUID = '12345678-1234-1234-1234-123456789abc';
      const { instruction } = contextNavigationOrchestrator.onContextChange({
        newContext: { id: UUID } as any,
        activeContextProvider: createMockProvider({ routingStrategy: 'path', version: '8.0.0' }),
        hasAppContextProvider: true,
        portalPathname: `/apps/my-app/${UUID}`,
        portalSearch: '',
      });
      // Instruction is returned (same URL), but the provider's applyNavigation skips identical URLs
      expect(instruction?.pathname).toBe(`/apps/my-app/${UUID}`);
    });
  });

  // ── App-switch tests ────────────────────────────────────────────

  describe('onAppSwitch', () => {
    it('case 10: carry-over query→legacy', () => {
      const { mode, instruction } = contextNavigationOrchestrator.onAppSwitch({
        newPathname: '/apps/legacy-app',
        newSearch: '',
        contextIdToCarry: 'ctx-abc',
        activeContextProvider: createMockProvider({ routingStrategy: undefined, version: '7.0.0' }),
        hasAppContextProvider: false,
      });
      expect(mode).toBe('legacy');
      expect(instruction?.pathname).toBe('/apps/legacy-app/ctx-abc');
    });

    it('case 11: carry-over legacy→query', () => {
      const { mode, instruction } = contextNavigationOrchestrator.onAppSwitch({
        newPathname: '/apps/new-app',
        newSearch: '',
        contextIdToCarry: 'ctx-abc',
        activeContextProvider: createMockProvider({ routingStrategy: 'query', version: '8.0.0' }),
        hasAppContextProvider: true,
      });
      expect(mode).toBe('query');
      expect(instruction?.pathname).toBe('/apps/new-app');
      expect(instruction?.search).toContain('$contextId=ctx-abc');
    });

    it('case 11b: carry-over path→query', () => {
      const { instruction } = contextNavigationOrchestrator.onAppSwitch({
        newPathname: '/apps/query-app',
        newSearch: '',
        contextIdToCarry: 'ctx-abc',
        activeContextProvider: createMockProvider({ routingStrategy: 'query', version: '8.0.0' }),
        hasAppContextProvider: true,
      });
      expect(instruction?.search).toContain('$contextId=ctx-abc');
    });

    it('case 11c: carry-over query→path', () => {
      const { instruction } = contextNavigationOrchestrator.onAppSwitch({
        newPathname: '/apps/path-app',
        newSearch: '',
        contextIdToCarry: 'ctx-abc',
        activeContextProvider: createMockProvider({ routingStrategy: 'path', version: '8.0.0' }),
        hasAppContextProvider: true,
      });
      expect(instruction?.pathname).toBe('/apps/path-app/ctx-abc');
    });

    it('custom app-switch → no instruction', () => {
      const { mode, instruction } = contextNavigationOrchestrator.onAppSwitch({
        newPathname: '/apps/custom-app',
        newSearch: '',
        contextIdToCarry: 'ctx-abc',
        activeContextProvider: createMockProvider({
          routingStrategy: 'custom',
          version: '8.0.0',
        }),
        hasAppContextProvider: true,
      });
      expect(mode).toBe('custom');
      expect(instruction).toBeUndefined();
    });
  });
});
