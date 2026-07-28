import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableFeatureFlag } from '@equinor/fusion-framework-react-app/feature-flag';

import { Feature } from './static';

/**
 * Registers the feature flags demonstrated by the cookbook application.
 * @param appConfigurator - Application configurator receiving the feature-flag definitions.
 * @returns Nothing; feature flags are registered on the configurator.
 */
export const configure: AppModuleInitiator = (appConfigurator) => {
  enableFeatureFlag(appConfigurator, [
    {
      key: Feature.Basic,
      title: 'Basic',
    },
    {
      key: Feature.WithDescription,
      title: 'With description',
      description: 'Pancetta pork chop burgdoggen',
    },
    {
      key: Feature.ReadOnly,
      title: 'Read only feature',
      description: 'Kielbasa doner ham hock',
      readonly: true,
    },
    {
      key: Feature.WithValue,
      title: 'Feature with value',
      get description() {
        return `When enabled, the header will be colored ${this.value}`;
      },
      value: '#392',
    },
  ]);
};

export default configure;
