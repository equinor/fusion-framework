import { type DemoModuleConfig } from './configurator';

export class DemoProvider {
    #config: DemoModuleConfig;
    constructor(config: DemoModuleConfig) {
        this.#config = config;
    }

    get foo(): string {
        return this.#config.foo;
    }
    get bar(): number | undefined {
        return this.#config.bar;
    }
}

export default DemoProvider;
