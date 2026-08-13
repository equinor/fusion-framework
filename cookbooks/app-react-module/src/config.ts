import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { type DemoModule, demoModule } from './modules/demo';

export const configure: AppModuleInitiator<[DemoModule]> = (configurator) => {
  configurator.addConfig({
    module: demoModule,
    configure(configBuilder) {
      configBuilder.setFoo(async () => 'https://foo.bar');
      /** comment out to see the configurator's delayed default (bar: 5) instead */
      configBuilder.setBar(async () => 69);
    },
  });
};

export default configure;
