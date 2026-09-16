import { throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { BookmarkProvider } from '../BookmarkProvider';
import type { BookmarkFlowError } from '../BookmarkFlowError';
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

describe('BookmarkProvider errors', () => {
  it('emits only when bookmark errors change structurally', async () => {
    const client = new BookmarkMockClient();
    vi.spyOn(client, 'getAllBookmarks')
      .mockImplementationOnce(() => throwError(() => new Error('Unable to fetch bookmarks')))
      .mockImplementationOnce(() => throwError(() => new Error('Unable to fetch bookmarks')))
      .mockImplementationOnce(() => throwError(() => new Error('Service unavailable')));
    const provider = new BookmarkProvider({
      client,
      resolve: {
        context: async () => undefined,
        application: async () => undefined,
      },
    });
    const emissions: BookmarkFlowError[][] = [];
    const subscription = provider.errors$.subscribe((errors) => emissions.push(errors));

    await expect(provider.getAllBookmarksAsync()).rejects.toThrow('Failed to fetch bookmarks');
    await new Promise((resolve) => setTimeout(resolve, 250));
    await expect(provider.getAllBookmarksAsync()).rejects.toThrow('Failed to fetch bookmarks');
    await new Promise((resolve) => setTimeout(resolve, 250));
    await expect(provider.getAllBookmarksAsync()).rejects.toThrow('Failed to fetch bookmarks');

    expect(emissions).toHaveLength(3);
    expect(emissions[0]).toEqual([]);
    expect(emissions[1]?.[0]?.cause).toEqual(new Error('Unable to fetch bookmarks'));
    expect(emissions[2]?.[0]?.cause).toEqual(new Error('Service unavailable'));

    subscription.unsubscribe();
    provider.dispose();
  });
});
