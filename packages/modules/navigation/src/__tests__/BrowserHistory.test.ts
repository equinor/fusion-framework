import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, skip } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavigationProvider } from '../NavigationProvider';
import { createHistory } from '../lib/create-history';
import type { History } from '../lib/types';

describe('BrowserHistory', () => {
  let provider: NavigationProvider;
  let history: History;

  beforeEach(() => {
    history = createHistory('browser');
    provider = new NavigationProvider({
      version: '1.0.0',
      config: { history },
    });
  });

  afterEach(() => {
    provider?.dispose();
    history[Symbol.dispose]();
  });

  describe('push', () => {
    it('should navigate when push is called', async () => {
      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      provider.push('/about', { test: 'test' });
      await updatePromise;

      expect(history.location.pathname).toBe('/about');
      expect(history.action).toBe('PUSH');
      expect(history.location.state).toEqual({ test: 'test' });
      expect(window.location.pathname).toBe('/about');
    });

    it('should support browser back/forward navigation', async () => {
      history.push('/page1', { page: 1 });
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page1');

      history.push('/page2', { page: 2 });
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page2');

      // Go back
      const backPromise = firstValueFrom(history.state$.pipe(skip(1)));
      window.history.back();
      await backPromise;
      expect(history.location.pathname).toBe('/page1');
      expect(history.action).toBe('POP');
      expect(history.location.state).toEqual({ page: 1 });

      // Go forward
      const forwardPromise = firstValueFrom(history.state$.pipe(skip(1)));
      window.history.forward();
      await forwardPromise;
      expect(history.location.pathname).toBe('/page2');
      expect(history.action).toBe('POP');
      expect(history.location.state).toEqual({ page: 2 });
    });

    it('should support go() method', async () => {
      history.push('/page1');
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page1');

      history.push('/page2');
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page2');

      history.push('/page3');
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page3');

      // Go back - wait for state update to /page2
      const goBackPromise = firstValueFrom(
        history.state$.pipe(
          skip(1),
          filter((update) => update.location.pathname === '/page2'),
        ),
      );
      history.go(-1);
      await goBackPromise;
      expect(history.location.pathname).toBe('/page2');
      expect(history.action).toBe('POP');

      // Go forward - wait for state update to /page3
      const goForwardPromise = firstValueFrom(
        history.state$.pipe(
          skip(1),
          filter((update) => update.location.pathname === '/page3'),
        ),
      );
      history.go(1);
      await goForwardPromise;
      expect(history.location.pathname).toBe('/page3');
      expect(history.action).toBe('POP');
    });
  });

  describe('replace', () => {
    it('should navigate when replace is called', async () => {
      const updatePromise = firstValueFrom(history.state$.pipe(skip(1)));
      provider.replace('/about', { test: 'test' });
      await updatePromise;

      expect(history.location.pathname).toBe('/about');
      expect(history.action).toBe('REPLACE');
      expect(history.location.state).toEqual({ test: 'test' });
      expect(window.location.pathname).toBe('/about');
    });

    it('should replace current entry without adding to history stack', async () => {
      // Start at root
      expect(history.location.pathname).toBe('/');

      // Push an entry
      history.push('/page1', { page: 1 });
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page1');

      // Replace current entry
      history.replace('/page2', { page: 2 });
      await firstValueFrom(history.state$.pipe(skip(1)));
      expect(history.location.pathname).toBe('/page2');
      expect(history.action).toBe('REPLACE');

      // Go back - should go to root, not page1 (because page1 was replaced)
      const backPromise = firstValueFrom(history.state$.pipe(skip(1)));
      window.history.back();
      await backPromise;
      expect(history.location.pathname).toBe('/');
      expect(history.action).toBe('POP');
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
  });
});
