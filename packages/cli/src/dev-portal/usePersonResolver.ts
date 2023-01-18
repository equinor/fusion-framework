// TODO - @AndrejNikolicEq fix export for react component
import { PersonPresence, PersonDetails } from '@equinor/fusion-wc-person';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { useFramework } from '@equinor/fusion-framework-react';
import Query from '@equinor/fusion-query';
import { useMemo, useState } from 'react';

const createPersonClient = (client: IHttpClient) => {
    const queryDetails = new Query({
        client: {
            fn: (azureId: string) => {
                return client.json(`/persons/${azureId}?api-version=4.0`, {
                    method: 'GET',
                    // TODO: move to selector
                    selector: (response): Promise<PersonDetails> => response.json(),
                });
            },
        },
        key: (azureId) => azureId,
        // TODO - good cache amount? 3min?
        expire: 3 * 60 * 1000,
    });

    const queryPresence = new Query({
        client: {
            fn: (azureId: string) => {
                return client.json(`/persons/${azureId}/presence?api-version=1.0`, {
                    method: 'GET',
                    // TODO: move to selector
                    selector: (response): Promise<PersonPresence> => response.json(),
                });
            },
        },
        key: (azureId) => azureId,
        // TODO - good cache amount? 3min?
        expire: 3 * 60 * 1000,
    });

    return {
        getDetails: (azureId: string) => queryDetails.queryAsync(azureId),
        getPresence: (azureId: string) => queryPresence.queryAsync(azureId),
    };
};

export const usePersonResolver = () => {
    // TODO - make better 🐒
    const [resolver, setResolver] = useState<any | undefined>(undefined);
    useMemo(() => {
        useFramework()
            .modules.serviceDiscovery.createClient('people')
            .then((httpClient) => createPersonClient(httpClient))
            .then(setResolver);
    }, []);
    return resolver;
};
