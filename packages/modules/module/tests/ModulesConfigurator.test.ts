import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { of, throwError, timeout, type Observable } from 'rxjs';
import { ModulesConfigurator } from '../src/configurator.js';
import type { Module, ModuleInitializerArgs, AnyModule } from '../src/types.js';
import { BaseModuleProvider } from '../src/lib/provider/index.js';

// Mock modules for testing
const createMockModule = (name: string): AnyModule => ({
  name,
  version: '1.0.0',
  configure: vi.fn(() => Promise.resolve({})),
  initialize: vi.fn((args: ModuleInitializerArgs<any>) => {
    const provider = new BaseModuleProvider({ version: '1.0.0', config: {} });
    return Promise.resolve(provider);
  }),
});

const createAsyncMockModule = (name: string, delay = 10): AnyModule => ({
  name,
  version: '1.0.0',
  configure: vi.fn(() => Promise.resolve({})),
  initialize: vi.fn((args: ModuleInitializerArgs<any>) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const provider = new BaseModuleProvider({ version: '1.0.0', config: {} });
        resolve(provider);
      }, delay);
    });
  }),
});

const createFailingModule = (name: string, error: Error): AnyModule => ({
  name,
  version: '1.0.0',
  configure: vi.fn(() => Promise.resolve({})),
  initialize: vi.fn(() => Promise.reject(error)),
});

describe('ModulesConfigurator', () => {
  let configurator: ModulesConfigurator;
  let mockModule1: AnyModule;
  let mockModule2: AnyModule;

  beforeEach(() => {
    configurator = new ModulesConfigurator();
    mockModule1 = createMockModule('testModule1');
    mockModule2 = createMockModule('testModule2');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with no modules', () => {
      expect(configurator.modules).toEqual([]);
    });

    it('should initialize with provided modules', () => {
      const configWithModules = new ModulesConfigurator([mockModule1, mockModule2]);
      expect(configWithModules.modules).toEqual([mockModule1, mockModule2]);
    });
  });

  describe('configure', () => {
    it('should add multiple module configurations', () => {
      const config1 = { module: mockModule1 };
      const config2 = { module: mockModule2 };

      configurator.configure(config1, config2);

      expect(configurator.modules).toContain(mockModule1);
      expect(configurator.modules).toContain(mockModule2);
    });
  });

  describe('addConfig', () => {
    it('should add a module to the configurator', () => {
      configurator.addConfig({ module: mockModule1 });

      expect(configurator.modules).toContain(mockModule1);
    });

    it('should register configure callback', () => {
      const configureCallback = vi.fn();
      configurator.addConfig({
        module: mockModule1,
        configure: configureCallback,
      });

      // The callback should be registered internally
      // This is tested indirectly through initialize
    });

    it('should register afterConfig callback', () => {
      const afterConfigCallback = vi.fn();
      configurator.addConfig({
        module: mockModule1,
        afterConfig: afterConfigCallback,
      });

      // Callback should be stored for later execution
    });
  });

  describe('onConfigured', () => {
    it('should register post-configuration callback', () => {
      const callback = vi.fn();
      configurator.onConfigured(callback);

      // Callback should be stored internally
    });
  });

  describe('onInitialized', () => {
    it('should register post-initialization callback', () => {
      const callback = vi.fn();
      configurator.onInitialized(callback);

      // Callback should be stored internally
    });
  });

  describe('initialize', () => {
    it('should initialize modules successfully', async () => {
      configurator.addConfig({ module: mockModule1 });
      configurator.addConfig({ module: mockModule2 });

      const result = await configurator.initialize();

      expect(result).toHaveProperty('testModule1');
      expect(result).toHaveProperty('testModule2');
      expect(result.testModule1).toBeInstanceOf(BaseModuleProvider);
      expect(result.testModule2).toBeInstanceOf(BaseModuleProvider);
    });

    it('should handle module dependencies correctly', async () => {
      const dependentModule: AnyModule = {
        name: 'dependent',
        version: '1.0.0',
        configure: vi.fn(() => Promise.resolve({})),
        initialize: vi.fn((args: ModuleInitializerArgs<any>) => {
          // This module depends on mockModule1
          expect(args.hasModule('testModule1')).toBe(true);
          return args.requireInstance('testModule1').then(() => {
            const provider = new BaseModuleProvider({ version: '1.0.0', config: {} });
            return provider;
          });
        }),
      };

      configurator.addConfig({ module: mockModule1 });
      configurator.addConfig({ module: dependentModule });

      const result = await configurator.initialize();

      expect(result).toHaveProperty('testModule1');
      expect(result).toHaveProperty('dependent');
      expect(dependentModule.initialize).toHaveBeenCalled();
    });

    it('should handle async module initialization', async () => {
      const asyncModule = createAsyncMockModule('asyncModule', 50);
      configurator.addConfig({ module: asyncModule });

      const startTime = Date.now();
      const result = await configurator.initialize();
      const endTime = Date.now();

      expect(result).toHaveProperty('asyncModule');
      expect(endTime - startTime).toBeGreaterThanOrEqual(40); // At least the delay
    });

    it('should handle module initialization timeout', async () => {
      const slowModule: AnyModule = {
        name: 'slowModule',
        version: '1.0.0',
        configure: vi.fn(() => Promise.resolve({})),
        initialize: vi.fn((args: ModuleInitializerArgs<any>) => {
          // This will depend on a module that doesn't exist
          return args.requireInstance('nonExistentModule', 0.1); // Very short timeout
        }),
      };

      configurator.addConfig({ module: slowModule });

      await expect(configurator.initialize()).rejects.toThrow();
    });

    it('should emit events during initialization', async () => {
      const events: any[] = [];
      configurator.event$.subscribe(event => events.push(event));

      configurator.addConfig({ module: mockModule1 });
      await configurator.initialize();

      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.name === 'initialize')).toBe(true);
    });

    it('should handle module initialization failures', async () => {
      const error = new Error('Module failed to initialize');
      const failingModule = createFailingModule('failingModule', error);

      configurator.addConfig({ module: failingModule });

      await expect(configurator.initialize()).rejects.toThrow('Module failed to initialize');
    });

    it('should call post-initialization callbacks', async () => {
      const postInitCallback = vi.fn();
      configurator.onInitialized(postInitCallback);

      configurator.addConfig({ module: mockModule1 });
      await configurator.initialize();

      expect(postInitCallback).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return a sealed instance with dispose method', async () => {
      configurator.addConfig({ module: mockModule1 });
      const result = await configurator.initialize();

      expect(Object.isSealed(result)).toBe(true);
      expect(typeof result.dispose).toBe('function');
    });
  });

  describe('dispose', () => {
    it('should dispose all modules', async () => {
      configurator.addConfig({ module: mockModule1 });
      configurator.addConfig({ module: mockModule2 });

      const instance = await configurator.initialize();

      // Mock dispose methods
      const dispose1 = vi.fn();
      const dispose2 = vi.fn();
      (instance.testModule1 as any).dispose = dispose1;
      (instance.testModule2 as any).dispose = dispose2;

      await instance.dispose();

      expect(dispose1).toHaveBeenCalled();
      expect(dispose2).toHaveBeenCalled();
    });

    it('should handle disposal errors gracefully', async () => {
      configurator.addConfig({ module: mockModule1 });

      const instance = await configurator.initialize();

      // Mock dispose method that throws
      (instance.testModule1 as any).dispose = vi.fn(() => {
        throw new Error('Dispose failed');
      });

      // Should not throw despite the error
      await expect(instance.dispose()).resolves.not.toThrow();
    });
  });

  describe('requireInstance', () => {
    it('should resolve existing initialized modules immediately', async () => {
      const dependentModule: AnyModule = {
        name: 'dependent',
        version: '1.0.0',
        configure: vi.fn(() => Promise.resolve({})),
        initialize: vi.fn(async (args) => {
          const requiredModule = await args.requireInstance('testModule1');
          expect(requiredModule).toBeInstanceOf(BaseModuleProvider);
          return new BaseModuleProvider({ version: '1.0.0', config: {} });
        }),
      };

      configurator.addConfig({ module: mockModule1 });
      configurator.addConfig({ module: dependentModule });

      await configurator.initialize();
      expect(dependentModule.initialize).toHaveBeenCalled();
    });

    it('should throw error for non-existent modules', async () => {
      const dependentModule: AnyModule = {
        name: 'dependent',
        version: '1.0.0',
        configure: vi.fn(() => Promise.resolve({})),
        initialize: vi.fn(async (args) => {
          await args.requireInstance('nonExistent');
          return new BaseModuleProvider({ version: '1.0.0', config: {} });
        }),
      };

      configurator.addConfig({ module: dependentModule });

      await expect(configurator.initialize()).rejects.toThrow('Cannot require [nonExistent] since module is not defined');
    });
  });

  describe('event system', () => {
    it('should emit events for module lifecycle', async () => {
      const events: any[] = [];
      configurator.event$.subscribe(event => events.push(event));

      configurator.addConfig({ module: mockModule1 });
      await configurator.initialize();

      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('level');
      expect(events[0]).toHaveProperty('name');
      expect(events[0]).toHaveProperty('message');
    });

    it('should include performance metrics in events', async () => {
      const events: any[] = [];
      configurator.event$.subscribe(event => events.push(event));

      configurator.addConfig({ module: mockModule1 });
      await configurator.initialize();

      const initEvent = events.find(e => e.name === 'initialize');
      expect(initEvent).toBeDefined();
      expect(initEvent).toHaveProperty('metric');
      expect(typeof initEvent.metric).toBe('number');
    });
  });

  describe('error handling', () => {
    it('should handle configuration errors gracefully', async () => {
      const badModule: AnyModule = {
        name: 'badModule',
        version: '1.0.0',
        configure: vi.fn(() => Promise.reject(new Error('Config failed'))),
        initialize: vi.fn(() => Promise.resolve(new BaseModuleProvider({ version: '1.0.0', config: {} }))),
      };

      configurator.addConfig({ module: badModule });

      // Should still attempt initialization despite config failure
      const result = await configurator.initialize();
      expect(result).toHaveProperty('badModule');
    });

    it('should emit error events for failures', async () => {
      const events: any[] = [];
      configurator.event$.subscribe(event => events.push(event));

      const failingModule = createFailingModule('failingModule', new Error('Init failed'));
      configurator.addConfig({ module: failingModule });

      try {
        await configurator.initialize();
      } catch {
        // Expected to fail
      }

      const errorEvents = events.filter(e => e.level === 'Error');
      expect(errorEvents.length).toBeGreaterThan(0);
    });
  });
});
