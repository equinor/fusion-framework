import { useAppModule } from '@equinor/fusion-framework-react-app';
import { ContextModule } from '@equinor/fusion-framework-module-context';
import { useEffect, useState } from 'react';

import { useObservableState } from '@equinor/fusion-observable/react';

const useCurrentContext = () => {
    const provider = useAppModule<ContextModule>('context');
    return useObservableState(provider.contextClient.currentContext$);
};

export const GetContext = () => {
    const provider = useAppModule<ContextModule>('context');
    const eventHub = useAppModule('event');

    const [event, setEvent] = useState<unknown>(null);

    const [contextId, setContextId] = useState<string>('0c3cb077-fbd5-41e0-a6e7-db4d10dfd2f3');
    const context = useCurrentContext();

    const status = useObservableState(provider.contextClient.status$);

    useEffect(() => {
        if (!contextId) {
            return;
        }
        provider.contextClient.setCurrentContext(contextId);
    }, [provider, contextId]);

    useEffect(() => {
        eventHub.addEventListener('onCurrentContextChange', (e) => setEvent(e.detail));
    }, [eventHub]);

    useEffect(() => {
        setTimeout(() => setContextId('2c49b999-2feb-49dc-bb13-42a651cd92bc'), 10);
    });

    return (
        <div>
            <select onChange={(e) => setContextId(e.currentTarget.value)}>
                <option value="2c49b999-2feb-49dc-bb13-42a651cd92bc">Johan Castberg</option>
                <option value="a007e04a-e372-4da5-b5be-8d2f6b671065">Krafla</option>
                <option value="03f56966-4732-48bc-8b42-6450cedb38fa">Fusion</option>
                <option value="0c3cb077-fbd5-41e0-a6e7-db4d10dfd2f3">
                    Oseberg Gas Capacity Upgrade (OGP)
                </option>
            </select>
            <div>
                <span>Status:</span>
                <span>{status}</span>
            </div>

            <pre>
                <code>{JSON.stringify(context, undefined, 4)}</code>
            </pre>

            <div style={{ border: 1, padding: 20, background: 'cornflowerblue' }}>
                <span>onCurrentContextChange:</span>
                <pre>
                    <code>{JSON.stringify(event, undefined, 4)}</code>
                </pre>
            </div>
        </div>
    );
};

export default GetContext;
