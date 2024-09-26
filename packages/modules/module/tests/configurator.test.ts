import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '../src/configurator';
import { type Module } from '../src/types';

const testModule: Module<'tester', object, void> = {
    name: 'tester',
    initialize: vi.fn(() => ({})),
};

describe('ModulesConfigurator', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should create a new instance', () => {
        const configurator = new ModulesConfigurator();
        expect(configurator).toBeInstanceOf(ModulesConfigurator);
    });

    it('should create instance with initial configuration', () => {
        const configurator = new ModulesConfigurator([testModule]);
        expect(configurator.modules).toHaveLength(1);
    });

    it('should allow adding configuration', () => {
        const configurator = new ModulesConfigurator();
        configurator.addConfig({ module: testModule });
        expect(configurator.modules).toHaveLength(1);
    });

    it('should create an instance', async () => {
        const configurator = new ModulesConfigurator([testModule]);
        const instance = await configurator.initialize();
        expect(instance).toHaveProperty('tester');
    });
});
