import { describe, expect, it, vi } from 'vitest';

import type { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import type { AdapterResolutionContext } from '../types.js';
import { createPathAdapter } from '../create-path-adapter.js';
import { resolveAdapter } from '../../helpers/resolve-adapter.js';
import { createQueryAdapter } from '../create-query-adapter.js';
import { createCustomAdapter } from './create-custom-adapter.js';
import { resolveContextFromUrl } from '../../utils/resolve-context-from-url.js';

describe('createCustomAdapter', () => {
  // Adapter matching only needs the custom path hooks; the rest of the provider is irrelevant here.
  const appContext: AdapterResolutionContext['appContext'] = {
    extractContextIdFromPath: () => null,
    generatePathFromContext: () => null,
  } as unknown as AdapterResolutionContext['appContext'];

  it('defers to query routing when custom path hooks are present', () => {
    const currentURL = new URL(
      'https://example.com/apps/my-app/projects/project-slug/edit?$contextId=context-uuid',
    );
    const adapter = resolveAdapter(
      {
        appContext,
        appKey: 'my-app',
        routingStrategy: 'query',
        currentURL,
      },
      [createCustomAdapter(), createQueryAdapter(), createPathAdapter()],
    );

    expect(adapter?.id).toBe('query');
    expect(adapter?.decode(currentURL)).toBe('context-uuid');
  });

  it('continues using custom path hooks for path routing', () => {
    const adapter = createCustomAdapter()({
      appContext,
      appKey: 'my-app',
      routingStrategy: 'path',
      currentURL: new URL('https://example.com/apps/my-app/projects/project-slug'),
    });

    expect(adapter?.id).toBe('custom');
  });

  it('continues using custom path hooks when no strategy is declared', () => {
    const adapter = createCustomAdapter()({
      appContext,
      appKey: 'my-app',
      currentURL: new URL('https://example.com/apps/my-app/projects/project-slug'),
    });

    expect(adapter?.id).toBe('custom');
  });

  it('resolves query context from a direct deep link when custom hooks are present', async () => {
    const setCurrentContextByIdAsync = vi.fn(async () => undefined);
    const resolveInitialContext = resolveContextFromUrl(
      [createCustomAdapter(), createQueryAdapter(), createPathAdapter()],
      'https://example.com',
    );

    // Initial URL resolution only invokes the context setter from this test provider.
    await resolveInitialContext({
      context: { setCurrentContextByIdAsync } as unknown as IContextProvider,
      navigation: {
        path: {
          pathname: '/apps/my-app/projects/project-slug/edit',
          search: '?$contextId=deep-link-context',
        },
      } as never,
    });

    expect(setCurrentContextByIdAsync).toHaveBeenCalledWith('deep-link-context');
  });

  it('replaces a unique exact context path segment and preserves URL query behavior', () => {
    const currentURL = new URL(
      'https://example.com/apps/my-app/projects/old-context/edit?tab=activity#details',
    );
    // The adapter only reads these two hooks from the minimal test provider.
    const appContext = {
      extractContextIdFromPath: (path: string) => path.match(/\/projects\/([^/]+)/)?.[1],
      generatePathFromContext: () => null,
    } as unknown as AdapterResolutionContext['appContext'];
    const adapter = createCustomAdapter()({
      appContext,
      appKey: 'my-app',
      currentURL,
    });

    const result = adapter?.encode({
      context: { id: 'new-context' } as ContextItem,
      currentURL,
    });

    expect(result?.pathname).toBe('/apps/my-app/projects/new-context/edit');
    expect(result?.search).toBe('?tab=activity');
    expect(result?.hash).toBe('');
  });

  it.each([
    { path: '/projects/old-context/edit/old-context', extractedId: 'old-context' },
    { path: '/projects/prefix-old-context-suffix/edit', extractedId: 'old-context' },
  ])('skips fallback replacement for ambiguous path matches ($path)', ({ path, extractedId }) => {
    const currentURL = new URL(`https://example.com/apps/my-app${path}`);
    // The adapter only reads these two hooks from the minimal test provider.
    const appContext = {
      extractContextIdFromPath: () => extractedId,
      generatePathFromContext: () => null,
    } as unknown as AdapterResolutionContext['appContext'];
    const adapter = createCustomAdapter()({
      appContext,
      appKey: 'my-app',
      currentURL,
    });

    expect(
      adapter?.encode({ context: { id: 'new-context' } as ContextItem, currentURL }),
    ).toBeNull();
  });
});
