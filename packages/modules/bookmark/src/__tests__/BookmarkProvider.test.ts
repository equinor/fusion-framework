import { throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BookmarkProvider } from '../BookmarkProvider.js';
import { BookmarkFlowError } from '../BookmarkFlowError.js';
import { bookmarkActions } from '../bookmark-actions.js';
import { BookmarkMockClient } from '../mock/index.js';

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
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each([
    {
      detail: 'cause messages',
      createCause: (message: string) => new Error(message),
    },
    {
      detail: 'nested causes',
      createCause: (message: string) =>
        new Error('Request failed', {
          cause: new Error('Transport failed', { cause: new Error(message) }),
        }),
    },
    {
      detail: 'custom error properties',
      createCause: (message: string) =>
        Object.assign(new Error('Request failed'), { code: message }),
    },
    {
      detail: 'plain object causes',
      createCause: (message: string) => ({ message, status: 503 }),
    },
    {
      detail: 'primitive causes',
      createCause: (message: string) => message,
    },
  ])('deduplicates equivalent $detail and emits changed details', async ({ createCause }) => {
    vi.useFakeTimers();
    const client = new BookmarkMockClient();
    const firstCause = createCause('Unable to fetch bookmarks');
    const equivalentCause = createCause('Unable to fetch bookmarks');
    const changedCause = createCause('Service unavailable');
    vi.spyOn(client, 'getAllBookmarks')
      .mockImplementationOnce(() => throwError(() => firstCause))
      .mockImplementationOnce(() => throwError(() => equivalentCause))
      .mockImplementationOnce(() => throwError(() => changedCause));
    const provider = new BookmarkProvider({
      client,
      resolve: {
        context: async () => undefined,
        application: async () => undefined,
      },
    });
    const emissions: BookmarkFlowError[][] = [];
    const subscription = provider.errors$.subscribe((errors) => emissions.push(errors));

    try {
      const firstRequest = expect(provider.getAllBookmarksAsync()).rejects.toThrow(
        'Failed to fetch bookmarks',
      );
      await vi.advanceTimersByTimeAsync(250);
      await firstRequest;
      const equivalentRequest = expect(provider.getAllBookmarksAsync()).rejects.toThrow(
        'Failed to fetch bookmarks',
      );
      await vi.advanceTimersByTimeAsync(250);
      await equivalentRequest;

      expect(emissions).toHaveLength(2);
      const changedRequest = expect(provider.getAllBookmarksAsync()).rejects.toThrow(
        'Failed to fetch bookmarks',
      );
      await vi.advanceTimersByTimeAsync(250);
      await changedRequest;

      expect(emissions).toHaveLength(3);
      expect(emissions[0]).toEqual([]);
      expect(emissions[1]?.[0]?.cause).toBe(firstCause);
      expect(emissions[2]?.[0]?.cause).toBe(changedCause);
    } finally {
      subscription.unsubscribe();
      provider.dispose();
    }
  });
});

describe('BookmarkFlowError', () => {
  it('identifies bookmark flow errors without accepting unrelated values', () => {
    const error = new BookmarkFlowError('Failed', bookmarkActions.fetchBookmarks());

    expect(BookmarkFlowError.is(error)).toBe(true);
    expect(BookmarkFlowError.is({ ...error, name: error.name, message: error.message })).toBe(true);
    expect(BookmarkFlowError.is(new Error('Failed'))).toBe(false);
    expect(BookmarkFlowError.is({ name: error.name, message: error.message })).toBe(false);
    expect(BookmarkFlowError.is({ type: BookmarkFlowError.Type })).toBe(false);
    expect(BookmarkFlowError.is({ ...error, type: 'AnotherError' })).toBe(false);
    expect(BookmarkFlowError.is(null)).toBe(false);
    expect(BookmarkFlowError.is(undefined)).toBe(false);
  });

  it('compares message, name, and action while ignoring stack traces', () => {
    const error = new BookmarkFlowError('Failed', bookmarkActions.fetchBookmark('first'));
    const equivalent = new BookmarkFlowError('Failed', bookmarkActions.fetchBookmark('first'));
    equivalent.stack = 'a different stack';

    expect(BookmarkFlowError.compare(error, equivalent)).toBe(true);
    expect(
      BookmarkFlowError.compare(
        error,
        new BookmarkFlowError('Changed', bookmarkActions.fetchBookmark('first')),
      ),
    ).toBe(false);
    expect(
      BookmarkFlowError.compare(
        error,
        new BookmarkFlowError('Failed', bookmarkActions.fetchBookmark('second')),
      ),
    ).toBe(false);

    equivalent.name = 'AnotherError';
    expect(BookmarkFlowError.compare(error, equivalent)).toBe(false);
  });
});
