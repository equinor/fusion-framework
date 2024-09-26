import { describe, expect, it } from 'vitest';
import { ModulesConfigurator } from '../src/configurator';
import { AnyModule } from '../src/types';

describe('ModulesConfigurator', () => {
    it('should create a new instance', () => {
        const configurator = new ModulesConfigurator();
        expect(configurator).toBeInstanceOf(ModulesConfigurator);
    });
    it('should create instance with initial configuration', () => {
        const testModule: AnyModule = {
            name: 'tester',
            initialize: () => {},
        };
        const configurator = new ModulesConfigurator([testModule]);
        expect(configurator.modules).toHaveLength(1);
    });
});
