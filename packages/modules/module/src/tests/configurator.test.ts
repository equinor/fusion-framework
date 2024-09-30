import { describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '../configurator';
import { AnyModule } from '../types';
import { SemanticVersion } from '../lib';

describe('ModulesConfigurator', () => {
    it('should allow adding configuration', () => {
        const configurator = new ModulesConfigurator();
        configurator.addConfig({
            module: {
                name: 'additionalModule',
                initialize: async () => Symbol('instance'),
            },
        });
        expect(configurator.modules).toHaveLength(1);
    });

    it('should allow creating with modules', () => {
        const configurator = new ModulesConfigurator([
            {
                name: 'initialModule',
                initialize: async () => Symbol('instance'),
            },
        ]);
        expect(configurator.modules).toHaveLength(1);
    });

    it('should create an instance', async () => {
        const expectedInstance = Symbol('expectedInstance');
        const module: AnyModule = {
            name: 'shouldCreateInstance',
            initialize: vi.fn(async () => expectedInstance),
        };

        const result = await new ModulesConfigurator([module]).initialize();

        expect(module.initialize).toHaveBeenCalledOnce();

        expect(result).toHaveProperty(module.name);
        expect(result[module.name]).toBe(expectedInstance);
    });

    it('should generate module config', async () => {
        const expectedConfig = Symbol('expectedConfig');

        const module: AnyModule = {
            name: 'shouldGenerateModuleConfig',
            configure: vi.fn(async () => expectedConfig),
            initialize: async ({ config }) => {
                expect(config).toBe(expectedConfig);
                return Symbol('instance');
            },
        };

        await new ModulesConfigurator([module]).initialize();

        expect(module.configure).toHaveBeenCalledOnce();
    });

    it('should call postConfigure on modules', async () => {
        const module: AnyModule = {
            name: 'shouldCallPostConfigure',
            initialize: async () => Symbol('instance'),
            postConfigure: vi.fn(),
        };

        await new ModulesConfigurator([module]).initialize();

        expect(module.postConfigure).toHaveBeenCalled();
    });

    it('should execute callback to module after initialization', async () => {
        const module: AnyModule = {
            name: 'shouldCallOnInitialized',
            initialize: async () => Symbol('instance'),
            postInitialize: vi.fn(async () => {}),
        };

        await new ModulesConfigurator([module]).initialize();

        expect(module.postInitialize).toHaveBeenCalled();
    });

    it('should use the module version of the configurator', async () => {
        const module: AnyModule = {
            name: 'shouldUseModuleVersion',
            version: new SemanticVersion('1.0.0'),
            initialize: async () => ({}),
        };

        const result = await new ModulesConfigurator([module]).initialize();

        expect(result[module.name]).toHaveProperty('version');
        expect(result[module.name].version).toBeInstanceOf(SemanticVersion);
        expect(module.version?.toString()).toBe('1.0.0');
        expect(module.version?.compare(result[module.name].version)).toBe(0);
    });

    it('should dispose of modules', async () => {
        const module: AnyModule = {
            name: 'shouldDispose',
            initialize: async () => Symbol('instance'),
            dispose: vi.fn(async () => {}),
        };

        const configurator = new ModulesConfigurator([module]);
        const instance = await configurator.initialize();
        await configurator.dispose(instance);

        expect(module.dispose).toHaveBeenCalled();
    });
});
