import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { SignalRModuleConfigBuilderCallback } from '../../SignalRModuleConfigurator';
import { module } from '../../SignalRModule';
import { configureFromFramework } from './configure-from-framework';

export interface enableSignalR {
    (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        configurator: IModulesConfigurator<any, any>,
        name: string,
        cb: SignalRModuleConfigBuilderCallback,
    ): void;
    (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        configurator: IModulesConfigurator<any, any>,
        name: string,
        options: { service: string; path: string },
    ): void;
}

/**
 * @example
 ```ts
 import { 
    enableSignalR, 
    configurePortalHub, 
    configureNotificationHub 
 } from '@equinor/fusion-framework-module-signalr';

 export const configure = (configurator) => {
    enableSignalR(configurator, { 
        name: 'portal', 
        service: 'portal', 
        path: '/signalr/hubs/service-message'
    });
    enableSignalR(configurator, 'notifications');
    // custom
    enableSignalR(configurator, builder => {
        builder.addHub('myHub', {
            uri: 'https://foo.bar',
            path: '/my_messages'
            accessTokenFactory: () => makeToken(),
        })
    });
 }
 ```
 */
export function enableSignalR(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    name: string,
    optionsOrCallback: SignalRModuleConfigBuilderCallback | { service: string; path: string },
) {
    if (typeof optionsOrCallback === 'function') {
        configurator.addConfig({
            module,
            configure: (signalRConfigurator) => {
                signalRConfigurator.onCreateConfig(optionsOrCallback);
            },
        });
    } else {
        configurator.addConfig({
            module,
            configure: (signalRConfigurator) => {
                signalRConfigurator.onCreateConfig((builder) =>
                    configureFromFramework({ name, ...optionsOrCallback }, builder),
                );
            },
        });
    }
}
