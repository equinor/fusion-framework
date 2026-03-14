import type { HubConnection } from '@microsoft/signalr';
import { Observable } from 'rxjs';

/**
 * RxJS Observable wrapper around a SignalR hub method.
 *
 * A `Topic` subscribes to a named method on a `HubConnection` and emits
 * incoming messages as observable values. It also exposes {@link Topic.send}
 * and {@link Topic.invoke} for sending messages back to the server.
 *
 * Created by {@link SignalRModuleProvider.connect} — consumers typically
 * do not instantiate `Topic` directly.
 *
 * @template T - Type of messages received from the hub method
 *
 * @example
 * ```ts
 * const topic = provider.connect<ChatMessage>('chat', 'ReceiveMessage');
 * topic.subscribe((msg) => console.log(msg.text));
 *
 * // Send a message to the server on the same method
 * topic.send('Hello, world!');
 * ```
 */
export class Topic<T> extends Observable<T> {
  /** The active hub connection, set once the connection observable emits. */
  connection: HubConnection | undefined;

  /**
   * @param topic - Server-side method name to listen on and send to
   * @param hubConnection - Observable that emits the active `HubConnection`
   */
  constructor(
    public topic: string,
    public hubConnection: Observable<HubConnection>,
  ) {
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

  /**
   * Send a fire-and-forget message to the server on this topic.
   *
   * @param args - Arguments forwarded to `HubConnection.send()`
   * @throws {Error} When the hub connection has not been established yet
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public send(...args: any[]): void {
    if (!this.connection) {
      throw new Error('No hub connection awaitable');
    }
    this.connection.send(this.topic, args);
  }

  /**
   * Invoke a server method on this topic and wait for a response.
   *
   * @template T - Expected return type from the server method
   * @param args - Arguments forwarded to `HubConnection.invoke()`
   * @returns Promise resolving with the server's response
   * @throws {Error} When the hub connection has not been established yet
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public invoke<T>(...args: any[]): Promise<T> {
    if (!this.connection) {
      throw new Error('No hub connection awaitable');
    }
    return this.connection?.invoke(this.topic, args);
  }
}
