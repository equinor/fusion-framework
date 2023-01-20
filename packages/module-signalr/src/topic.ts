import { HubConnection } from '@microsoft/signalr';
import { Observable } from 'rxjs';

export class Topic<T> extends Observable<T> {
    connection: HubConnection | undefined;

    constructor(
        public topic: string,
        public hubConnection: Observable<HubConnection>,
        args: any[]
    ) {
        super((subscriber) => {
            const hubConnectionSubscription = hubConnection.subscribe((connection) => {
                connection.stream(topic, args);
                const cb = subscriber.next.bind(subscriber);
                connection.on(topic, cb);
                subscriber.add(() => connection.off(topic, cb));
                this.connection = connection;
            });
            subscriber.add(() => {
                hubConnectionSubscription.unsubscribe();
            });
        });
    }

    send(...args: any[]): void {
        if (!this.connection) {
            throw new Error('No hub connection awaitable');
        }
        this.connection.send(this.topic, args);
    }

    invoke<T>(...args: any[]): Promise<T> {
        if (!this.connection) {
            throw new Error('No hub connection awaitable');
        }
        return this.connection?.invoke(this.topic, args);
    }
}
