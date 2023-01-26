import { useMemo } from 'react';
import { ISignalRProvider, Topic } from '@equinor/fusion-framework-module-signalr';

export const useSignalRProvider = <T>(
    provider: ISignalRProvider,
    hubId: string,
    topicId: string
): Topic<T> => {
    const topic = useMemo(() => provider.connect<T>(hubId, topicId), [hubId, topicId]);
    return topic;
};
