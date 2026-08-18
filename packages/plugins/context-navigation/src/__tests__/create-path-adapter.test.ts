import { describe, expect, it } from 'vitest';

import { createPathAdapter } from '../adapters/create-path-adapter';

const CONTEXT_ID = '11111111-1111-1111-1111-111111111111';

describe('createPathAdapter', () => {
  const adapter = createPathAdapter();

  it('drops the context segment and sub-route when context becomes null', () => {
    const currentURL = new URL(`/apps/my-app/${CONTEXT_ID}/settings/general`, 'https://example.com');
    const result = adapter.encode({ context: null, currentURL });

    expect(result?.pathname).toBe('/apps/my-app');
  });

  it('preserves the sub-route when swapping to a new context', () => {
    const currentURL = new URL(`/apps/my-app/${CONTEXT_ID}/settings/general`, 'https://example.com');
    const result = adapter.encode({
      context: { id: 'new-context-id' } as never,
      currentURL,
    });

    expect(result?.pathname).toBe('/apps/my-app/new-context-id/settings/general');
  });

  it('preserves the full route tail when there was no prior context id to distinguish from a route name', () => {
    // With no active context, the segment after the app key is a route name
    // (e.g. "settings"), not a context id — it must be folded into the tail
    // rather than clobbered by the new context id.
    const currentURL = new URL('/apps/my-app/settings/general', 'https://example.com');
    const result = adapter.encode({
      context: { id: CONTEXT_ID } as never,
      currentURL,
    });

    expect(result?.pathname).toBe(`/apps/my-app/${CONTEXT_ID}/settings/general`);
  });
});
