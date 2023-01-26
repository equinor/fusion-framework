import {
    AnyModule,
    ModuleConfigBuilder,
    ModuleInitializerArgs,
} from '@equinor/fusion-framework-module';

import { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import { IHttpConnectionOptions } from '@microsoft/signalr';

export interface ISignalRConfigurator {
    /** add configuration for hub connection */
    addHub(name: string, config: SignalRHubConfig | Promise<SignalRHubConfig>): void;

    /** add callback for building config on init */
    onCreateConfig(cb: SignalRModuleConfigBuilderCallback): void;
}

/** configuration callback */
export type SignalRModuleConfigBuilderCallback<TDeps = unknown> = (
    builder: SignalRModuleConfigBuilder<TDeps>
) => void | Promise<void>;

/**
 * Configuration for hub connection
 */
export type SignalRHubConfig = {
    /** connection endpoint */
    url: string;

    /** connection options */
    options: Omit<IHttpConnectionOptions, 'httpClient'>;

    /** reconnect when connection lost */
    automaticReconnect?: boolean;
};

/**
 * Configuration for creating SignalR provider
 */
export type SignalRConfig = {
    hubs: Record<string, SignalRHubConfig>;
};

/**
 * builder utility class for generating configuration
 */
export class SignalRModuleConfigBuilder<
    TDeps extends AnyModule[] | unknown = unknown
> extends ModuleConfigBuilder<TDeps, ISignalRConfigurator> {
    async addHub(name: string, config: SignalRHubConfig) {
        this._config.addHub(name, config);
    }
}

export class SignalRConfigurator implements ISignalRConfigurator {
    #builderCallbacks: Array<SignalRModuleConfigBuilderCallback> = [];

    #hubs: Record<string, SignalRHubConfig> = {};

    /**
     * register SignalR hub configuration.
     */
    public addHub(name: string, config: SignalRHubConfig) {
        this.#hubs[name] = config;
    }

    /**
     * add callback for building config on when configurator is creating config.
     * {@link SignalRConfigurator.createConfig}
     */
    public onCreateConfig<T>(cb: SignalRModuleConfigBuilderCallback<T>): void {
        this.#builderCallbacks.push(cb);
    }

    /**
     * normally executed in `init` phase of module, which creates configuration to the module provider.
     * cycles threw all registered configuration builders.
     * await all registered hub configurations.
     */
    public async createConfig(
        init: ModuleInitializerArgs<ISignalRConfigurator, [ServiceDiscoveryModule]>
    ): Promise<SignalRConfig> {
        /** trigger all builder callbacks */
        for (const cb of this.#builderCallbacks) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const builder = new SignalRModuleConfigBuilder<[ServiceDiscoveryModule]>(init, this);
            await Promise.resolve(cb(builder));
        }

        return { hubs: this.#hubs };
    }
}
