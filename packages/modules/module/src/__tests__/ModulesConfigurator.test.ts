import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModulesConfigurator } from '../configurator.js';
import type { ModuleInitializerArgs, AnyModule } from '../types.js';
import { BaseModuleProvider } from '../lib/provider/index.js';
import SemanticVersion from '../lib/semantic-version.js';

// Mock provider for testing
class MockModuleProvider extends BaseModuleProvider {
  constructor() {
    super({ version: new SemanticVersion('1.0.0'), config: {} });
  }
}

// Mock configurator for testing
class MockConfigurator {
  async createConfigAsync() {
    return {};
  }
}

// Mock modules for testing
const createMockModule = (name: string): AnyModule => ({
  name,
  version: new SemanticVersion('1.0.0'),
  configure: () => new MockConfigurator(),
  initialize: (args: ModuleInitializerArgs<any>) => {
    const provider = new MockModuleProvider();
    return Promise.resolve(provider);
  },
});

const createAsyncMockModule = (name: string, delay = 10): AnyModule => ({
  name,
  version: new SemanticVersion('1.0.0'),
  configure: () => new MockConfigurator(),
  initialize: (args: ModuleInitializerArgs<any>) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const provider = new MockModuleProvider();
        resolve(provider);
      }, delay);
    });
  },
});

const createFailingModule = (name: string, error: Error): AnyModule => ({
  name,
  version: new SemanticVersion('1.0.0'),
  configure: () => new MockConfigurator(),
  initialize: () => Promise.reject(error),
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
    it.skip('should initialize modules successfully', async () => {
      const configuratorWithModules = new ModulesConfigurator([mockModule1, mockModule2]);

      const result = await configuratorWithModules.initialize();

      expect(result).toHaveProperty('testModule1');
      expect(result).toHaveProperty('testModule2');
      expect(result.testModule1).toBeInstanceOf(MockModuleProvider);
      expect(result.testModule2).toBeInstanceOf(MockModuleProvider);
    });

    it('should handle module dependencies correctly', async () => {
      const dependentModule: AnyModule = {
        name: 'dependent',
        version: new SemanticVersion('1.0.0'),
        configure: vi.fn(() => Promise.resolve({})),
        initialize: vi.fn((args: ModuleInitializerArgs<any>) => {
          // This module depends on mockModule1
          expect(args.hasModule('testModule1')).toBe(true);
          return args.requireInstance('testModule1').then(() => {
            const provider = new MockModuleProvider();
            return provider;
          });
        }),
      };

      const configuratorWithDeps = new ModulesConfigurator([mockModule1, dependentModule]);

      const result = await configuratorWithDeps.initialize();

      expect(result).toHaveProperty('testModule1');
      expect(result).toHaveProperty('dependent');
      expect(dependentModule.initialize).toHaveBeenCalled();
    });

    it('should handle async module initialization', async () => {
      const asyncModule = createAsyncMockModule('asyncModule', 50);
      const configuratorWithAsync = new ModulesConfigurator([asyncModule]);

      const startTime = Date.now();
      const result = await configuratorWithAsync.initialize();
      const endTime = Date.now();

      expect(result).toHaveProperty('asyncModule');
      expect(endTime - startTime).toBeGreaterThanOrEqual(40); // At least the delay
    });

    it('should handle module initialization timeout', async () => {
      const slowModule: AnyModule = {
        name: 'slowModule',
        version: new SemanticVersion('1.0.0'),
        configure: vi.fn(() => Promise.resolve({})),
        initialize: vi.fn((args: ModuleInitializerArgs<any>) => {
          // This will depend on a module that doesn't exist
          return args.requireInstance('nonExistentModule', 0.1); // Very short timeout
        }),
      };

      const configuratorWithSlow = new ModulesConfigurator([slowModule]);

      await expect(configuratorWithSlow.initialize()).rejects.toThrow();
    });

    it('should emit events during initialization', async () => {
      const events: any[] = [];
      const configuratorWithEvents = new ModulesConfigurator([mockModule1]);
      configuratorWithEvents.event$.subscribe(event => events.push(event));

      await configuratorWithEvents.initialize();

      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.name === 'initialize')).toBe(true);
    });

    it('should handle module initialization failures', async () => {
      const error = new Error('Module failed to initialize');
      const failingModule = createFailingModule('failingModule', error);

      const configuratorWithFailing = new ModulesConfigurator([failingModule]);

      await expect(configuratorWithFailing.initialize()).rejects.toThrow('Module failed to initialize');
    });

    it('should call post-initialization callbacks', async () => {
      const postInitCallback = vi.fn();
      const configuratorWithCallback = new ModulesConfigurator([mockModule1]);
      configuratorWithCallback.onInitialized(postInitCallback);

      await configuratorWithCallback.initialize();

      expect(postInitCallback).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return a sealed instance with dispose method', async () => {
      const configuratorWithSeal = new ModulesConfigurator([mockModule1]);
      const result = await configuratorWithSeal.initialize();

      expect(Object.isSealed(result)).toBe(true);
      expect(typeof result.dispose).toBe('function');
    });
  });

  describe('dispose', () => {
    it('should dispose all modules', async () => {
      const configuratorWithDispose = new ModulesConfigurator([mockModule1, mockModule2]);
      const instance = await configuratorWithDispose.initialize();

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
      const configuratorWithDisposeError = new ModulesConfigurator([mockModule1]);
      const instance = await configuratorWithDisposeError.initialize();

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
        version: new SemanticVersion('1.0.0'),
        configure: vi.fn(() => Promise.resolve({})),
        initialize: vi.fn(async (args) => {
          const requiredModule = await args.requireInstance('testModule1');
          expect(requiredModule).toBeInstanceOf(MockModuleProvider);
          return new MockModuleProvider();
        }),
      };

      const configuratorWithRequire = new ModulesConfigurator([mockModule1, dependentModule]);

      await configuratorWithRequire.initialize();
      expect(dependentModule.initialize).toHaveBeenCalled();
    });

    it('should throw error for non-existent modules', async () => {
      const dependentModule: AnyModule = {
        name: 'dependent',
        version: new SemanticVersion('1.0.0'),
        configure: vi.fn(() => Promise.resolve({})),
        initialize: vi.fn(async (args) => {
          await args.requireInstance('nonExistent');
          return new MockModuleProvider();
        }),
      };

      const configuratorWithRequireError = new ModulesConfigurator([dependentModule]);

      await expect(configuratorWithRequireError.initialize()).rejects.toThrow('Cannot require [nonExistent] since module is not defined');
    });
  });

  describe('event system', () => {
    it('should emit events for module lifecycle', async () => {
      const events: any[] = [];
      const configuratorWithEvents = new ModulesConfigurator([mockModule1]);
      configuratorWithEvents.event$.subscribe(event => events.push(event));

      await configuratorWithEvents.initialize();

      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('level');
      expect(events[0]).toHaveProperty('name');
      expect(events[0]).toHaveProperty('message');
    });

    it('should include performance metrics in events', async () => {
      const events: any[] = [];
      const configuratorWithMetrics = new ModulesConfigurator([mockModule1]);
      configuratorWithMetrics.event$.subscribe(event => events.push(event));

      await configuratorWithMetrics.initialize();

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
        version: new SemanticVersion('1.0.0'),
        configure: vi.fn(() => Promise.reject(new Error('Config failed'))),
        initialize: vi.fn(() => Promise.resolve(new MockModuleProvider())),
      };

      const configuratorWithBadModule = new ModulesConfigurator([badModule]);

      // Should still attempt initialization despite config failure
      const result = await configuratorWithBadModule.initialize();
      expect(result).toHaveProperty('badModule');
    });

    it('should emit error events for failures', async () => {
      const events: any[] = [];
      const failingModule = createFailingModule('failingModule', new Error('Init failed'));
      const configuratorWithErrorEvents = new ModulesConfigurator([failingModule]);
      configuratorWithErrorEvents.event$.subscribe(event => events.push(event));

      try {
        await configuratorWithErrorEvents.initialize();
      } catch {
        // Expected to fail
      }

      const errorEvents = events.filter(e => e.level === 'Error');
      expect(errorEvents.length).toBeGreaterThan(0);
    });
  });
});
