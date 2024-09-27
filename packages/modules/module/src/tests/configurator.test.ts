import { describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '../configurator';
import { AnyModule } from '../types';

describe('ModulesConfigurator', () => {

    it('should allow adding configuration', () => {
        const configurator = new ModulesConfigurator();
        configurator.addConfig({
            module: {
                name: 'additionalModule',
                initialize: () => ({}),
            },
        });
        expect(configurator.modules).toHaveLength(1);
    });

    it('should allow creating with modules', () => {
        const configurator = new ModulesConfigurator([
            {
                name: 'initialModule',
                initialize: () => ({}),
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
});
