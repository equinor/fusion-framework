import { describe, expect, it } from 'vitest';
import { BaseConfigBuilder, ConfigBuilderCallback } from '../src/BaseConfigBuilder';

// Define the structure of the configuration object.
export type TestConfigType = {
    string: string; // A string property
    array: string[]; // An array of strings
    complex: {
        foo: string; // A nested string property
        bar: number; // A nested number property
    };
};

// Extend BaseConfigBuilder to create a builder for TestConfigType.
export class TestConfigBuilder extends BaseConfigBuilder<TestConfigType> {
    constructor() {
        super();
    }

    // Method to set the 'string' property of the configuration.
    public setTestString(cb: ConfigBuilderCallback<string>) {
        this._set('string', cb); // Utilize the internal method to set the value.
    }

    // Method to set the 'array' property of the configuration.
    public setTestArray(cb: ConfigBuilderCallback<string[]>) {
        this._set('array', cb); // Utilize the internal method to set the value.
    }

    // Method to set the 'foo' property within the 'complex' object of the configuration.
    public setFoo(cb: ConfigBuilderCallback<string>) {
        this._set('complex.foo', cb); // Utilize the internal method to set the value.
    }

    // Method to set the 'bar' property within the 'complex' object of the configuration.
    public setBar(cb: ConfigBuilderCallback<number>) {
        this._set('complex.bar', cb); // Utilize the internal method to set the value.
    }
}

// Test suite to validate the functionality of the TestConfigBuilder.
describe('Module configuration builder', () => {
    // Initial setup for the tests.
    const init = {
        config: {}, // Empty config object.
        hasModule: () => false, // Dummy implementation, always returns false.
        requireInstance: () => {
            throw new Error('Not implemented'); // Dummy implementation, throws not implemented error.
        },
    };
    // Test case to ensure the config builder creates the expected configuration.
    it('should create config', async () => {
        const builder = new TestConfigBuilder(); // Instantiate the builder.
        const expectedConfig: TestConfigType = {
            // Define the expected configuration.
            string: 'test',
            array: ['a', 'b', 'c'],
            complex: { foo: 'foo', bar: 42 },
        };

        // Set configuration values using the builder methods.
        builder.setTestString(() => expectedConfig.string);
        builder.setTestArray(() => expectedConfig.array);
        builder.setFoo(() => expectedConfig.complex.foo);
        builder.setBar(() => expectedConfig.complex.bar);

        // Create the configuration using the builder.
        const config = await builder.createConfigAsync(init);

        expect(config).toEqual(expectedConfig); // Assert the created config matches the expected config.
    });

    // Test case to ensure the config builder supports asynchronous value resolution.
    it('should create config with async values', async () => {
        const builder = new TestConfigBuilder(); // Instantiate the builder.
        const expectedConfig: Partial<TestConfigType> = {
            // Define the expected partial configuration.
            string: 'test',
        };

        // Set a configuration value with an asynchronous callback.
        builder.setTestString(async (args) => {
            expect(args).toEqual(init); // Assert the arguments passed to the callback match the initial setup.
            return expectedConfig.string!; // Return the expected string value.
        });

        // Create the configuration using the builder.
        const config = await builder.createConfigAsync(init);

        expect(config).toEqual(expectedConfig); // Assert the created config matches the expected partial config.
    });

    // Test case to ensure the config builder allows specifying an initial configuration.
    it('should allow initial config', async () => {
        const builder = new TestConfigBuilder(); // Instantiate the builder.
        const initialConfig: TestConfigType = {
            // Define the initial configuration.
            string: 'initial',
            array: [],
            complex: { foo: '', bar: 0 },
        };

        // Set a configuration value, overriding part of the initial configuration.
        builder.setTestString(() => 'test');

        // Create the configuration using the builder, providing the initial configuration.
        const config = await builder.createConfigAsync(init, initialConfig);

        expect(config).toEqual({ ...initialConfig, string: 'test' }); // Assert the created config matches the expected merged result.
    });
});
