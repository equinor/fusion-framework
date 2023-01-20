import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { Observable, shareReplay } from 'rxjs';
import { SignalRConfig } from './configurator';
import { Topic } from './topic';

export interface ISignalRProvider {
    connect<T>(methodName: string, args: any): Promise<Topic<T> | undefined>;
}

export class SignalRProvider implements ISignalRProvider {
    #hubConnection: Observable<HubConnection>;

    constructor(config: SignalRConfig, getToken: () => Promise<string>) {
        const url = config.baseUrl ? config.baseUrl + config.url : config.url;

        this.#hubConnection = new Observable<HubConnection>((observer) => {
            const connection = new HubConnectionBuilder()
                .withAutomaticReconnect()
                .withUrl(url, {
                    accessTokenFactory: async () => await getToken(),
                    timeout: config.timeout,
                })
                .build();

            connection.start().then(() => {
                observer.next(connection);
            });
            return () => {
                connection.stop();
            };
        }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }

    async connect<T>(methodName: string, args: any) {
        try {
            return new Topic<T>(methodName, this.#hubConnection, args);
        } catch (error) {
            console.log(error);
        }
        return;
    }
}
