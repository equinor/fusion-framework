import { useMemo } from 'react';
import type { ISignalRProvider, Topic } from '@equinor/fusion-framework-module-signalr';

/**
 * Hook for connecting to a SignalR hub topic via the given provider.
 *
 * @template T - The type of data emitted by the topic
 * @param provider - The SignalR provider used to establish the connection
 * @param hubId - The id of the hub to connect to
 * @param topicId - The id of the topic within the hub to subscribe to
 * @returns The connected topic
 */
export const useSignalRProvider = <T>(
  provider: ISignalRProvider,
  hubId: string,
  topicId: string,
): Topic<T> => {
  const topic = useMemo(() => provider.connect<T>(hubId, topicId), [provider, hubId, topicId]);
  return topic;
};
