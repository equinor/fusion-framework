import { useMemo } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { SignalRModule, Topic } from '@equinor/fusion-framework-module-signalr';

export const useTopic = <T>(hubId: string, topicId: string): Topic<T> => {
    const signalRProvider = useFramework<[SignalRModule]>().modules.signalR;
    const topic = useMemo(() => signalRProvider.connect<T>(hubId, topicId), [hubId, topicId]);
    return topic;
};

export default useTopic;
