import { useAppModule } from '@equinor/fusion-framework-react-app';
import { ContextModule } from '@equinor/fusion-framework-module-context';
import { useEffect, useMemo, useState } from 'react';

import { useObservableState } from '@equinor/fusion-observable/react';
import { useFramework } from '@equinor/fusion-framework-react';

export const useCurrentContext = () => {
    const provider = useAppModule<ContextModule>('context');
    const currentContext$ = useMemo(
        () => provider.contextClient.currentContext$,
        [provider.contextClient]
    );
    return useObservableState(currentContext$).value;
};

const useFrameworkCurrentContext = () => {
    const provider = useFramework<[ContextModule]>().modules.context;
    const currentContext$ = useMemo(
        () => provider.contextClient.currentContext$,
        [provider.contextClient]
    );
    return useObservableState(currentContext$).value
};

export const GetContext = () => {
    const provider = useAppModule<ContextModule>('context');
    const eventHub = useAppModule('event');

    const portalEventHub = useFramework().modules.event;

    const [event, setEvent] = useState<unknown>(null);

    const [contextId, setContextId] = useState<string>('');
    const context = useCurrentContext();
    const portalContext = useFrameworkCurrentContext();

    useEffect(() => {
        if (!contextId) {
            return;
        }
        provider.contextClient.setCurrentContext(contextId);
    }, [provider, contextId]);

    useEffect(() => {
        return eventHub.addEventListener('onCurrentContextChanged', (e) => setEvent(e.detail));
    }, [eventHub]);

    useEffect(() => {
        // TODO - check propagation
        /** prevent setting context krafla */
        return portalEventHub.addEventListener('onCurrentContextChange', (e) => {
            if (e.detail.context?.id === 'a007e04a-e372-4da5-b5be-8d2f6b671065') {
                e.preventDefault();
            }
        });
    }, [portalEventHub]);

    return (
        <div>
            <select onChange={(e) => setContextId(e.currentTarget.value)}>
                <option value="0c3cb077-fbd5-41e0-a6e7-db4d10dfd2f3">
                    Oseberg Gas Capacity Upgrade (OGP)
                </option>
                <option value="2c49b999-2feb-49dc-bb13-42a651cd92bc">Johan Castberg</option>
                <option value="a007e04a-e372-4da5-b5be-8d2f6b671065">Krafla</option>
                <option value="03f56966-4732-48bc-8b42-6450cedb38fa">Fusion</option>
            </select>

            <h3>App Context</h3>
            <pre>
                <code>{JSON.stringify(context, undefined, 4)}</code>
            </pre>
            <h3>Portal Context</h3>
            <pre>
                <code>{JSON.stringify(portalContext, undefined, 4)}</code>
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
