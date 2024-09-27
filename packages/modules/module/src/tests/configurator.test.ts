import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '../configurator';
import { type Module } from '../types';

// TODO - allow never ref
const testModule = {
    name: 'testModule',
    configure: vi.fn(async () => ({})),
    initialize: vi.fn(async () => ({})),
} satisfies Module<'testModule', object, object>;

// let testConfigurator: ModulesConfigurator;
let testConfigurator: ModulesConfigurator<[typeof testModule]>;

describe('ModulesConfigurator', () => {
    beforeAll(() => {
        testConfigurator = new ModulesConfigurator([testModule]);
    });
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should have a configurator with one module registered', () => {
        expect(testConfigurator).toBeInstanceOf(ModulesConfigurator);
        expect(testConfigurator.modules).toHaveLength(1);
    });

    it('should allow adding configuration', () => {
        testConfigurator.addConfig({
            module: {
                name: 'tester2',
                initialize: () => ({}),
            },
        });
        expect(testConfigurator.modules).toHaveLength(2);
    });

    it('should create an instance', async () => {
        const expectedInstance = Symbol('expectedInstance');
        const module: Module<'shouldCreateInstance', object, object> = {
            name: 'shouldCreateInstance',
            initialize: vi.fn(async () => expectedInstance),
        };

        const configurator = new ModulesConfigurator([module]);

        const result = await configurator.initialize();

        expect(module.initialize).toHaveBeenCalledOnce();

        expect(result).toHaveProperty(module.name);
        expect(result[module.name]).toBe(expectedInstance);
    });

    it('should generate module config', async () => {
        const expectedConfig = Symbol('expectedConfig');
        const configure = vi.fn(async () => expectedConfig);

        testConfigurator.addConfig({
            module: {
                name: 'shouldGenerateModuleConfig',
                configure,
                initialize: async ({ config }) => {
                    expect(config).toBe(expectedConfig);
                    return {};
                },
            },
        });

        await testConfigurator.initialize();

        expect(configure).toHaveBeenCalledOnce();
    });

    it('should call postConfigure on modules', async () => {
        const postConfigure = vi.fn();
        testConfigurator.addConfig({
            module: {
                name: 'shouldCallPostConfigure',
                initialize: async () => ({}),
                postConfigure,
            },
        });

        await testConfigurator.initialize();

        expect(postConfigure).toHaveBeenCalled();
    });
});
