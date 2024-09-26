import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ModulesConfigurator } from '../src/configurator';
import { type Module } from '../src/types';

type MockModule<TName extends string, TType extends object, TConfig = unknown> = {
    name: string;
    initialize: Mock<Module<TName, TType, TConfig>['initialize']>;
    configure?: Mock<Required<Module<TName, TType, TConfig>>['configure']>;
};

type TestModule = MockModule<'tester', object>;

const testModule: TestModule = {
    name: 'tester',
    initialize: vi.fn(() => ({})),
};

let testConfigurator: ModulesConfigurator<[TestModule]>;

describe('ModulesConfigurator', () => {
    beforeEach(() => {
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
        const instance = await testConfigurator.initialize();
        expect(instance).toHaveProperty('tester');
        expect(testModule.initialize).toHaveBeenCalledOnce();
    });
});
