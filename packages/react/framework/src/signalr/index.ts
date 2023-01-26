import { useFramework } from '../useFramework';

import { SignalRModule, useProviderTopic } from '@equinor/fusion-framework-react-module-signalr';

/**
 * hook for subscribing to a topic of a SignalR hub
 * 
 * @example
 ```ts
// config.ts
import {enableSignalR} from '@equinor/fusion-framework-react-module-signalr';
(configurator) => enableSignalR(configurator, 'notifications');

// myHook.ts
const myHook = () => {
    const topic = useSignalR('notifications', 'foo');
    return useObservableState(topic);
}
 ```
 *
 * @see {@link [module signalr](https://equinor.github.io/fusion-framework/modules/signalr)}
 *
 * @param hubId identifier of connection hub (must be configured)
 * @param topicId identifier of topic to connect to
 * @returns Topic
 */
export const useSignalR = <T>(
    hubId: string,
    topicId: string
): ReturnType<typeof useProviderTopic<T>> => {
    const provider = useFramework<[SignalRModule]>().modules.signalR;
    if (!provider) {
        throw Error(
            'SignalR is not configured, see @equinor/fusion-framework-react-module-signalr'
        );
    }
    return useProviderTopic(provider, hubId, topicId);
};
