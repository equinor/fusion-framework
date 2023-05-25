import { BaseConfigBuilder, type ConfigBuilderCallback } from '@equinor/fusion-framework-module';

export type DemoModuleConfig = { foo: string; bar?: number };

export class DemoModuleConfigurator extends BaseConfigBuilder<DemoModuleConfig> {
    public setFoo(cb: ConfigBuilderCallback<string>) {
        this._set('foo', cb);
    }

    public setBar(cb: ConfigBuilderCallback<number>) {
        this._set('bar', cb);
    }

    protected async _processConfig(config: Partial<DemoModuleConfig>) {
        if (!config.bar) {
            /** halt operation for demo purpose */
            await new Promise((resolve) => setTimeout(resolve, 10000));
            config.bar = 5;
        }
        return config as DemoModuleConfig;
    }
}

export default DemoModuleConfig;
