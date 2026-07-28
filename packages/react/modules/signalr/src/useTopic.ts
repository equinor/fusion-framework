import { useModule } from '@equinor/fusion-framework-react-module';
import { moduleKey } from '@equinor/fusion-framework-module-signalr';

import { useSignalRProvider } from './useSignalRProvider';

/**
 * Hook for connecting to a SignalR hub topic, resolving the provider from the framework automatically.
 *
 * @template T - The type of data emitted by the topic
 * @param hubId - The id of the hub to connect to
 * @param topicId - The id of the topic within the hub to subscribe to
 * @returns The connected topic
 */
export const useTopic = <T>(
  hubId: string,
  topicId: string,
): ReturnType<typeof useSignalRProvider<T>> =>
  useSignalRProvider(useModule(moduleKey), hubId, topicId);

export default useTopic;
