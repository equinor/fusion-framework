import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { Observable, shareReplay } from 'rxjs';

import { SignalRConfig } from './SignalRModuleConfigurator';

import { Topic } from './lib/Topic';

export interface ISignalRProvider {
    /**
     * connect to SignalR hub
     * re-use existing connections and close connection when nobody is listening
     */
    connect<T>(ubId: string, methodName: string): Topic<T>;
}

export class SignalRModuleProvider implements ISignalRProvider {
    #config: SignalRConfig;
    #hubConnections: Record<string, Observable<HubConnection>> = {};

    constructor(config: SignalRConfig) {
        this.#config = config;
    }

    public connect<T>(hubId: string, methodName: string): Topic<T> {
        return new Topic<T>(methodName, this._createHubConnection(hubId));
    }

    protected _createHubConnection(hubId: string): Observable<HubConnection> {
        if (hubId in this.#hubConnections) {
            return this.#hubConnections[hubId];
        }
        const config = this.#config.hubs[hubId];
        if (!config) {
            throw Error(`could not find any configuration for hub [${hubId}]`);
        }

        this.#hubConnections[hubId] = new Observable<HubConnection>((observer) => {
            const builder = new HubConnectionBuilder().withUrl(config.url, {
                ...config.options,
            });

            config.automaticReconnect && builder.withAutomaticReconnect();

            const connection = builder.build();

            connection.start().then(() => {
                observer.next(connection);
            });

            const teardown = () => {
                connection.stop();
                observer.complete();
                delete this.#hubConnections[hubId];
            };

            return teardown;
        }).pipe(
            shareReplay({
                /** only emit last connection when new subscriber connects */
                bufferSize: 1,
                /** when no subscribers, teardown observable */
                refCount: true,
            })
        );

        return this.#hubConnections[hubId];
    }
}

export default SignalRModuleProvider;
