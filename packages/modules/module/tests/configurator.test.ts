import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '../src/configurator';
import { AnyModule, type Module } from '../src/types';

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
        const expectedInstance = {
            name: 'test-instance',
        };
        vi.spyOn(testModule, 'initialize').mockImplementationOnce(async () => expectedInstance);

        const instance = await testConfigurator.initialize();

        expect(testModule.initialize).toHaveBeenCalledOnce();

        expect(instance).toHaveProperty(testModule.name);
        expect(instance[testModule.name]).toBe(expectedInstance);
    });

    it('should generate module config', async () => {
        const expectedConfig = { name: 'test-config' };
        vi.spyOn(testModule, 'configure').mockImplementationOnce(async () => expectedConfig);

        const originalInitialize = testModule.initialize;
        vi.spyOn(testModule as AnyModule, 'initialize').mockImplementationOnce((args) => {
            expect(args.config).toBe(expectedConfig);
            return originalInitialize();
        });

        await testConfigurator.initialize();
    });
});
