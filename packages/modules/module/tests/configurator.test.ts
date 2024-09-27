import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '../src/configurator';
import { type Module } from '../src/types';

type TestModule = Module<'testModule', object, object>;

// TODO - allow never ref
const testModule: TestModule = {
    name: 'testModule',
    configure: vi.fn(async () => ({})),
    initialize: vi.fn(async () => ({})),
};

// let testConfigurator: ModulesConfigurator;
let testConfigurator: ModulesConfigurator<[TestModule]>;

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
        const expectedInstance = {};
        vi.spyOn(testModule, 'initialize').mockImplementationOnce(async () => expectedInstance);

        const instance = await testConfigurator.initialize();

        expect(testModule.initialize).toHaveBeenCalledOnce();

        expect(instance).toHaveProperty(testModule.name);
        expect(instance[testModule.name]).toBe(expectedInstance);
    });
});
