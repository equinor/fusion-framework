import { Module } from '../src/types';
import { TestConfigType, TestConfigBuilder } from './config-builder.test';

class TestProvider {
    constructor(public config: TestConfigType) {}
}

type TestModule = Module<'test', TestProvider, TestConfigBuilder>;

export const testModule: TestModule = {
    name: 'test',
    configure: () => new TestConfigBuilder(),
    initialize: async (init) => {
        const config = await init.config.createConfigAsync(init);
        return new TestProvider(config);
    },
};

// TODO: Add test for module
