import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { type DemoModule, demoModule } from './modules/demo';

export const configure: AppModuleInitiator<[DemoModule]> = (configurator) => {
    configurator.addConfig({
        module: demoModule,
        configure(configBuilder) {
            configBuilder.setFoo(async () => 'https://foo.bar');
            /** disable to see default process */
            configBuilder.setBar(() => 69);
        },
    });
};

export default configure;
