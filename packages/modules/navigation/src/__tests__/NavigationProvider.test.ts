import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NavigationProvider } from '../NavigationProvider';
import { MemoryHistory } from '../lib/MemoryHistory';
import type { INavigationConfigurator } from '../NavigationConfigurator.interface';
import type { History } from '../lib/types';

describe('NavigationProvider', () => {
  let history: History;
  let provider: NavigationProvider;
  let config: INavigationConfigurator;

  beforeEach(() => {
    history = new MemoryHistory();
    config = { history };
    provider = new NavigationProvider({
      version: '1.0.0',
      config,
    });
  });

  afterEach(() => {
    provider?.dispose();
    history[Symbol.dispose]();
  });

  it('should have version', () => {
    expect(provider.version).toBeDefined();
    expect(provider.version.toString()).toBe('1.0.0');
  });

  it('should have history property', () => {
    expect(provider.history).toBe(history);
  });

  it('should have path property', () => {
    expect(provider.path).toBeDefined();
    expect(provider.path.pathname).toBeDefined();
  });

  it('should have state$ observable', () => {
    expect(provider.state$).toBeDefined();
    expect(typeof provider.state$.subscribe).toBe('function');
  });

  it('should throw error if no history provided', () => {
    config = {};
    expect(() => {
      new NavigationProvider({
        version: '1.0.0',
        config,
      });
    }).toThrow('no history provided!');
  });

  it('should dispose correctly', () => {
    const disposeSpy = vi.spyOn(history as { [Symbol.dispose]: () => void }, Symbol.dispose);
    provider.dispose();
    expect(disposeSpy).toHaveBeenCalled();
  });

  it('should normalize root basename "/" to empty string', () => {
    const providerWithRootBasename = new NavigationProvider({
      version: '1.0.0',
      config: { history, basename: '/' },
    });

    // Root basename '/' should be treated as "no basename"
    expect(providerWithRootBasename.basename).toBe('');

    providerWithRootBasename.dispose();
  });

  describe('basename normalization', () => {
    it('should strip trailing slashes from basename', () => {
      const provider1 = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/apps/my-app/' },
      });
      expect(provider1.basename).toBe('/apps/my-app');
      provider1.dispose();

      const provider2 = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/apps/my-app///' },
      });
      expect(provider2.basename).toBe('/apps/my-app');
      provider2.dispose();
    });

    it('should collapse consecutive slashes in basename', () => {
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/apps//my-app' },
      });
      expect(provider.basename).toBe('/apps/my-app');
      provider.dispose();
    });

    it('should handle pathological input efficiently (ReDoS protection)', () => {
      // Create a string with many consecutive slashes to test performance
      // This would cause ReDoS with certain regex patterns
      const manySlashes = '/apps' + '/'.repeat(10000) + 'my-app';

      const startTime = Date.now();
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: manySlashes },
      });
      const endTime = Date.now();

      // Should complete in reasonable time (< 100ms for 10k slashes)
      expect(endTime - startTime).toBeLessThan(100);
      expect(provider.basename).toBe('/apps/my-app');
      provider.dispose();
    });

    it('should handle pathological trailing slashes efficiently (ReDoS protection)', () => {
      // Create a string with many trailing slashes
      // The /\/+$/ regex pattern would cause ReDoS with this input
      const manyTrailingSlashes = '/apps/my-app' + '/'.repeat(10000);

      const startTime = Date.now();
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: manyTrailingSlashes },
      });
      const endTime = Date.now();

      // Should complete in reasonable time (< 100ms for 10k trailing slashes)
      expect(endTime - startTime).toBeLessThan(100);
      expect(provider.basename).toBe('/apps/my-app');
      provider.dispose();
    });

    it('should handle undefined basename', () => {
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: undefined },
      });
      expect(provider.basename).toBe('');
      provider.dispose();
    });
  });

  describe('_isWithinBasenameScope', () => {
    it('should allow all paths when basename is "/" (no basename)', () => {
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/' },
      });

      // All paths should be in scope
      expect((provider as any)._isWithinBasenameScope('/')).toBe(true);
      expect((provider as any)._isWithinBasenameScope('/apps')).toBe(true);
      expect((provider as any)._isWithinBasenameScope('/apps/my-app')).toBe(true);
      expect((provider as any)._isWithinBasenameScope('/apps/my-app/users')).toBe(true);

      provider.dispose();
    });

    it('should check path boundaries correctly with basename', () => {
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/apps/my-app' },
      });

      // Exact match should be in scope
      expect((provider as any)._isWithinBasenameScope('/apps/my-app')).toBe(true);

      // Paths starting with basename/ should be in scope
      expect((provider as any)._isWithinBasenameScope('/apps/my-app/')).toBe(true);
      expect((provider as any)._isWithinBasenameScope('/apps/my-app/users')).toBe(true);

      // Similar but different path should NOT be in scope (path boundary check)
      expect((provider as any)._isWithinBasenameScope('/apps/my-app-other')).toBe(false);
      expect((provider as any)._isWithinBasenameScope('/apps/my-app-other/users')).toBe(false);

      // Completely different paths should NOT be in scope
      expect((provider as any)._isWithinBasenameScope('/other')).toBe(false);
      expect((provider as any)._isWithinBasenameScope('/')).toBe(false);

      provider.dispose();
    });

    it('should handle consecutive slashes in pathname', () => {
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/apps/my-app' },
      });

      // Pathname with consecutive slashes should be normalized
      expect((provider as any)._isWithinBasenameScope('/apps//my-app')).toBe(true);
      expect((provider as any)._isWithinBasenameScope('/apps/my-app//users')).toBe(true);

      provider.dispose();
    });
  });

  describe('_localizePath', () => {
    it('should strip basename from paths on boundary', () => {
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/apps/my-app' },
      });

      // Exact match should become '/'
      expect(
        (provider as any)._localizePath({ pathname: '/apps/my-app', search: '', hash: '' }),
      ).toEqual({ pathname: '/', search: '', hash: '' });

      // Path with basename prefix should have it stripped
      expect(
        (provider as any)._localizePath({
          pathname: '/apps/my-app/users',
          search: '?q=test',
          hash: '#section',
        }),
      ).toEqual({ pathname: '/users', search: '?q=test', hash: '#section' });

      provider.dispose();
    });

    it('should not strip similar paths without boundary match', () => {
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/apps/my-app' },
      });

      // Path that starts similarly but isn't a real match should not be stripped
      const result = (provider as any)._localizePath({
        pathname: '/apps/my-app-other/users',
        search: '',
        hash: '',
      });

      // Should not strip anything since it doesn't match on path boundary
      expect(result.pathname).toBe('/apps/my-app-other/users');

      provider.dispose();
    });

    it('should handle root basename "/" correctly', () => {
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/' },
      });

      // With no basename, paths should be returned normalized
      expect((provider as any)._localizePath({ pathname: '/', search: '', hash: '' })).toEqual({
        pathname: '/',
        search: '',
        hash: '',
      });

      expect((provider as any)._localizePath({ pathname: '/apps', search: '', hash: '' })).toEqual({
        pathname: '/apps',
        search: '',
        hash: '',
      });

      expect(
        (provider as any)._localizePath({ pathname: '/apps/my-app', search: '', hash: '' }),
      ).toEqual({ pathname: '/apps/my-app', search: '', hash: '' });

      provider.dispose();
    });

    it('should normalize consecutive slashes', () => {
      const provider = new NavigationProvider({
        version: '1.0.0',
        config: { history, basename: '/apps/my-app' },
      });

      // Consecutive slashes should be collapsed
      expect(
        (provider as any)._localizePath({ pathname: '/apps//my-app//users', search: '', hash: '' }),
      ).toEqual({ pathname: '/users', search: '', hash: '' });

      provider.dispose();
    });
  });
});
