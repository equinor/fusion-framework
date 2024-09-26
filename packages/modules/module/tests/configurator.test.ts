import { describe, expect, it } from 'vitest';
import { ModulesConfigurator } from '../src/configurator';

describe('ModulesConfigurator', () => {
    it('should create a new instance', () => {
        const configurator = new ModulesConfigurator();
        expect(configurator).toBeInstanceOf(ModulesConfigurator);
    });
});
