import { describe, expect, it } from 'vitest';

import { BookmarkProvider } from '../BookmarkProvider';
import { BookmarkMockClient } from '../mock';

describe('BookmarkProvider filters', () => {
  it('exposes an immutable snapshot of the configured filters', () => {
    const filters = { context: true, application: true };
    const provider = new BookmarkProvider({
      client: new BookmarkMockClient(),
      filters,
      resolve: {
        context: async () => undefined,
        application: async () => undefined,
      },
    });

    filters.context = false;

    expect(provider.filters).toEqual({ context: true, application: true });
    expect(Object.isFrozen(provider.filters)).toBe(true);
    expect(Reflect.set(provider.filters ?? {}, 'application', false)).toBe(false);
    expect(provider.filters?.application).toBe(true);

    provider.dispose();
  });

  it('preserves an omitted filters configuration', () => {
    const provider = new BookmarkProvider({
      client: new BookmarkMockClient(),
      resolve: {
        context: async () => undefined,
        application: async () => undefined,
      },
    });

    expect(provider.filters).toBeUndefined();

    provider.dispose();
  });
});
