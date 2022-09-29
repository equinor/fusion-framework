import { useEffect, useState } from 'react';

import { ApiVersion } from '@equinor/fusion-framework-module-services/context';

import { useContextClient } from './useContextClient';

const useGetContext = <TVersion extends string = keyof typeof ApiVersion>(
    id: string,
    version: TVersion
) => {
    const [context, setContext] = useState<any | null>(null);

    const client = useContextClient('json$');

    useEffect(() => {
        if (client && id.trim().length === 36) {
            const subscription = client.get(String(version), { id }).subscribe(setContext);
            return () => subscription.unsubscribe();
        }
    }, [client, version, id]);

    return context;
};

export const GetContext = () => {
    const [id, setId] = useState('29c865ad-1178-4dfd-9e8b-ed5440473da3');
    const context = useGetContext(id, 'v1');
    return (
        <div>
            <label>
                ContextId:
                <input size={40} value={id} onChange={(e) => setId(e.currentTarget.value)} />
            </label>
            <pre>
                <code>{JSON.stringify(context, null, 2)}</code>
            </pre>
        </div>
    );
};

export default GetContext;
