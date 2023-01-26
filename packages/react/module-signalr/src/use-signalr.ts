import { useModule } from '@equinor/fusion-framework-react-module';
import { moduleKey } from '@equinor/fusion-framework-module-signalr';

import { useSignalRProvider } from './use-signalr-provider';

export const useTopic = <T>(
    hubId: string,
    topicId: string
): ReturnType<typeof useSignalRProvider<T>> =>
    useSignalRProvider(useModule(moduleKey), hubId, topicId);

export default useTopic;
