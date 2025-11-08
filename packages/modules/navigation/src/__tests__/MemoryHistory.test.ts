import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, skip } from 'rxjs';
import { MemoryHistory } from '../lib/MemoryHistory';
import type { History } from '../lib/types';

describe('MemoryHistory', () => {
  let history: MemoryHistory;

  beforeEach(() => {
    history = new MemoryHistory();
  });

  afterEach(() => {
    history[Symbol.dispose]();
  });

  describe('initialization', () => {
    it('should initialize with default location', () => {
      expect(history.location.pathname).toBe('/');
      expect(history.action).toBe('POP');
    });

    it('should initialize with custom initial location', () => {
      const customHistory = new MemoryHistory({
        initialLocation: {
          action: 'POP',
          location: { pathname: '/custom', search: '', hash: '', key: 'custom-key', state: { test: 'value' } },
        },
      });

      expect(customHistory.location.pathname).toBe('/custom');
      expect(customHistory.location.state).toEqual({ test: 'value' });
      expect(customHistory.action).toBe('POP');

      customHistory[Symbol.dispose]();
    });
  });

  describe('in-memory navigation', () => {
    it('should push without affecting browser', async () => {
      const initialPathname = window.location.pathname;
      const initialHash = window.location.hash;

      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.push('/about', { test: 'test' });
      await updatePromise;

      expect(history.location.pathname).toBe('/about');
      expect(history.action).toBe('PUSH');
      expect(history.location.state).toEqual({ test: 'test' });
      // Browser should not be affected
      expect(window.location.pathname).toBe(initialPathname);
      expect(window.location.hash).toBe(initialHash);
    });

    it('should replace without affecting browser', async () => {
      const initialPathname = window.location.pathname;
      const initialHash = window.location.hash;

      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.replace('/profile', { userId: 123 });
      await updatePromise;

      expect(history.location.pathname).toBe('/profile');
      expect(history.action).toBe('REPLACE');
      expect(history.location.state).toEqual({ userId: 123 });
      // Browser should not be affected
      expect(window.location.pathname).toBe(initialPathname);
      expect(window.location.hash).toBe(initialHash);
    });

    it('should maintain in-memory history stack', async () => {
      // Push multiple entries
      history.push('/page1', { page: 1 });
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page1');

      history.push('/page2', { page: 2 });
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page2');

      history.push('/page3', { page: 3 });
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page3');

      // Go back
      const goBackPromise1 = firstValueFrom(history.state$.pipe(skip(1)));
      history.go(-1);
      await goBackPromise1;
      expect(history.location.pathname).toBe('/page2');
      expect(history.action).toBe('POP');
      expect(history.location.state).toEqual({ page: 2 });

      // Go back again
      const goBackPromise2 = firstValueFrom(history.state$.pipe(skip(1)));
      history.go(-1);
      await goBackPromise2;
      expect(history.location.pathname).toBe('/page1');
      expect(history.action).toBe('POP');
      expect(history.location.state).toEqual({ page: 1 });

      // Go forward
      const goForwardPromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.go(1);
      await goForwardPromise;
      expect(history.location.pathname).toBe('/page2');
      expect(history.action).toBe('POP');
      expect(history.location.state).toEqual({ page: 2 });
    });

    it('should clamp go() to history bounds', async () => {
      history.push('/page1');
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page1');

      // Try to go back beyond start
      const goBackPromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.go(-10);
      await goBackPromise;
      // Should clamp to first entry
      expect(history.location.pathname).toBe('/');
      expect(history.action).toBe('POP');

      // Try to go forward beyond end
      const goForwardPromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.go(10);
      await goForwardPromise;
      // Should clamp to last entry
      expect(history.location.pathname).toBe('/page1');
      expect(history.action).toBe('POP');
    });
  });

  describe('createURL', () => {
    it('should create URLs with memory:// protocol', () => {
      const url = history.createURL('/test');
      expect(url.protocol).toBe('memory:');
      expect(url.pathname).toBe('/test');
      expect(url.href).toContain('memory://');
    });

    it('should create URLs with search and hash', () => {
      const url = history.createURL('/test?query=1#section');
      expect(url.protocol).toBe('memory:');
      expect(url.pathname).toBe('/test');
      expect(url.search).toBe('?query=1');
      expect(url.hash).toBe('#section');
      expect(url.href).toContain('memory://');
    });
  });

  describe('state$ observable', () => {
    it('should emit state updates on navigation', async () => {
      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.push('/test', { data: 'test' });
      const update = await updatePromise;

      expect(update.action).toBe('PUSH');
      expect(update.location.pathname).toBe('/test');
      expect(update.location.state).toEqual({ data: 'test' });
    });

    it('should emit state updates on go()', async () => {
      history.push('/page1');
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page1');

      history.push('/page2');
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page2');

      const goPromise = firstValueFrom(history.state$.pipe(skip(1)));
      history.go(-1);
      const update = await goPromise;

      expect(update.action).toBe('POP');
      expect(update.location.pathname).toBe('/page1');
    });
  });
});
