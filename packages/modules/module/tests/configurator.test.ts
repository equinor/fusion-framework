import { afterEach, beforeAll, describe, expect, it, Mock, vi } from 'vitest';
import { ModulesConfigurator } from '../src/configurator';
import { type Module } from '../src/types';

type MockModule<TName extends string, TType extends object, TConfig = unknown> = {
    name: string;
    initialize: Mock<Module<TName, TType, TConfig>['initialize']>;
    configure?: Mock<Required<Module<TName, TType, TConfig>>['configure']>;
};

const createMockModule = <TName extends string, TType extends object, TConfig = unknown>(
    name: string,
    initialize: Mock<Module<TName, TType, TConfig>['initialize']>,
    configure?: Mock<Required<Module<TName, TType, TConfig>>['configure']>,
): MockModule<TName, TType, TConfig> => ({
    name,
    initialize,
    configure,
});

let testModule: MockModule<string, object>;
let testConfigurator: ModulesConfigurator;

describe('ModulesConfigurator', () => {
    beforeAll(() => {
        testModule = createMockModule(
            'tester',
            vi.fn(() => ({})),
        );
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
        testModule.initialize.mockImplementationOnce(() => expectedInstance);

        const instance = await testConfigurator.initialize();
        expect(instance).toHaveProperty('tester');
        expect(instance.tester).toBe(expectedInstance);
        expect(testModule.initialize).toHaveBeenCalledOnce();
    });
});
