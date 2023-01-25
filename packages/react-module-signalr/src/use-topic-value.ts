import { useObservableState } from '@equinor/fusion-observable/react';
import { useTopic } from './use-topic';

export const useTopicValue = <T>(hubId: string, topicId: string): T | undefined => {
    const topic = useTopic<T>(hubId, topicId);
    return useObservableState<T>(topic);
};

export default useTopicValue;
