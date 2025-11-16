import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, skip } from 'rxjs';
import { createHistory } from '../lib/create-history';
import type { History } from '../lib/types';

describe('HashHistory', () => {
  let history: History;

  beforeEach(() => {
    history = createHistory('hash');
  });

  afterEach(() => {
    history[Symbol.dispose]();
  });

  describe('hash-based navigation', () => {
    it('should update hash instead of pathname on push', async () => {
      const initialPathname = window.location.pathname;

      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.push('/about', { test: 'test' });
      await updatePromise;

      expect(history.location.pathname).toBe('/about');
      expect(history.action).toBe('PUSH');
      expect(history.location.state).toEqual({ test: 'test' });
      // Pathname should remain unchanged
      expect(window.location.pathname).toBe(initialPathname);
      // Hash should contain the route
      expect(window.location.hash).toBe('#/about');
    });

    it('should update hash instead of pathname on replace', async () => {
      const initialPathname = window.location.pathname;

      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.replace('/profile', { userId: 123 });
      await updatePromise;

      expect(history.location.pathname).toBe('/profile');
      expect(history.action).toBe('REPLACE');
      expect(history.location.state).toEqual({ userId: 123 });
      // Pathname should remain unchanged
      expect(window.location.pathname).toBe(initialPathname);
      // Hash should contain the route
      expect(window.location.hash).toBe('#/profile');
    });

    it('should resolve location from hash', async () => {
      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.push('/test?query=1#section');
      await updatePromise;

      const location = history.location;
      expect(location.pathname).toBe('/test');
      expect(location.search).toBe('?query=1');
      expect(location.hash).toBe('#section');
      expect(window.location.hash).toBe('#/test?query=1#section');
    });

    it('should handle hashchange events for back/forward', async () => {
      const initialPathname = window.location.pathname;

      // Push multiple entries
      history.push('/page1', { page: 1 });
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(window.location.hash).toBe('#/page1');

      history.push('/page2', { page: 2 });
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(window.location.hash).toBe('#/page2');

      // Go back - should trigger hashchange event
      const backPromise = firstValueFrom(history.state$.pipe(skip(1)));
      window.history.back();
      await backPromise;
      expect(history.location.pathname).toBe('/page1');
      expect(history.action).toBe('POP');
      expect(history.location.state).toEqual({ page: 1 });
      expect(window.location.hash).toBe('#/page1');
      expect(window.location.pathname).toBe(initialPathname);

      // Go forward
      const forwardPromise = firstValueFrom(history.state$.pipe(skip(1)));
      window.history.forward();
      await forwardPromise;
      expect(history.location.pathname).toBe('/page2');
      expect(history.action).toBe('POP');
      expect(history.location.state).toEqual({ page: 2 });
      expect(window.location.hash).toBe('#/page2');
      expect(window.location.pathname).toBe(initialPathname);
    });

    it('should handle hash with search and hash fragments', async () => {
      const initialPathname = window.location.pathname;

      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.push('/users?filter=active#list', { filter: 'active' });
      await updatePromise;

      expect(history.location.pathname).toBe('/users');
      expect(history.location.search).toBe('?filter=active');
      expect(history.location.hash).toBe('#list');
      // Hash should contain full path with search and hash
      expect(window.location.hash).toBe('#/users?filter=active#list');
      expect(window.location.pathname).toBe(initialPathname);
    });
  });

  describe('state$ observable', () => {
    it('should emit state updates on navigation', async () => {
      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.push('/test');
      const update = await updatePromise;

      expect(update.action).toBe('PUSH');
      expect(update.location.pathname).toBe('/test');
    });
  });
});
