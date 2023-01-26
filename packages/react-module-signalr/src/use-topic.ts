import { useModule } from '@equinor/fusion-framework-react-module';
import { moduleKey } from '@equinor/fusion-framework-module-signalr';
import { useProviderTopic } from './use-provider-topic';

export const useTopic = <T>(
    hubId: string,
    topicId: string
): ReturnType<typeof useProviderTopic<T>> => useProviderTopic(useModule(moduleKey), hubId, topicId);

export default useTopic;
