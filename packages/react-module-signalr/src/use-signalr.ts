import { useFramework } from '@equinor/fusion-framework-react';
import { useEffect, useRef, useState } from 'react';
import { Subscription } from 'rxjs';
import { SignalRModule, Topic } from '@equinor/fusion-framework-module-signalr';


export const useSignalRTopic = <T>(topicId: string, cb: (data: T) => void, args?: any) => {
    const [topic, setTopic] = useState<Topic<T>>();
    const hub = useFramework<[SignalRModule]>().modules.signalr;
    const subscription = useRef<Subscription>();

    useEffect(() => {
        const mount = { isMounted: true };

        hub.connect<T>(topicId, args).then((topicConnection) => {
            if (topicConnection && mount.isMounted) {
                subscription.current = topicConnection.subscribe(cb);
                setTopic(topicConnection);
            }
        });

        return () => {
            mount.isMounted = false;
            if (subscription.current) subscription.current.unsubscribe();
        };
    }, [topicId, args]);

    return topic;
};
