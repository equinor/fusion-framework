import { HubConnection } from '@microsoft/signalr';
import { Observable } from 'rxjs';

export class Topic<T> extends Observable<T> {
    connection: HubConnection | undefined;

    constructor(public topic: string, public hubConnection: Observable<HubConnection>) {
        super((subscriber) => {
            const hubConnectionSubscription = hubConnection.subscribe((connection) => {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public send(...args: any[]): void {
        if (!this.connection) {
            throw new Error('No hub connection awaitable');
        }
        this.connection.send(this.topic, args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public invoke<T>(...args: any[]): Promise<T> {
        if (!this.connection) {
            throw new Error('No hub connection awaitable');
        }
        return this.connection?.invoke(this.topic, args);
    }
}
