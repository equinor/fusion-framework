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
});
