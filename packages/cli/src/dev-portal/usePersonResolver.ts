// TODO - @AndrejNikolicEq fix export for react component
import { PersonPresence, PersonDetails } from '@equinor/fusion-wc-person';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { useFramework } from '@equinor/fusion-framework-react';
import { Query } from '@equinor/fusion-query';
import { useMemo, useState } from 'react';

const createPersonClient = (client: IHttpClient) => {
    // TODO - good cache amount? 3min?
    const expire = 3 * 60 * 1000;
    const queryDetails = new Query({
        expire,
        queueOperator: 'merge',
        key: (azureId) => azureId,
        client: {
            fn: (azureId: string) => {
                return client.json<PersonDetails>(`/persons/${azureId}?api-version=4.0`);
            },
        },
    });

    const queryPerson = new Query({
        expire,
        queueOperator: 'merge',
        key: (query) => query,
        client: {
            fn: (query: string) => {
                return client.json<PersonDetails>(`/search/persons/query?api-version=1.0`, {
                    method: 'POST',
                    body: {
                        matchAll: true,
                        fullQueryMode: true,
                        search: query,
                        searchFields: ['name', 'mobilePhone', 'mail'],
                        includeTotalResultCount: true,
                    },
                });
            },
        },
    });

    const queryPresence = new Query({
        expire,
        queueOperator: 'merge',
        key: (azureId) => azureId,
        client: {
            fn: (azureId: string) =>
                client.json<PersonPresence>(`/persons/${azureId}/presence?api-version=1.0`),
        },
    });

    return {
        getPerson: (query: string) => queryPerson.queryAsync(query).then((x) => x.value),
        getDetails: (azureId: string) => queryDetails.queryAsync(azureId).then((x) => x.value),
        getPresence: (azureId: string) => queryPresence.queryAsync(azureId).then((x) => x.value),
    };
};

export const usePersonResolver = () => {
    // TODO - make better 🐒
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [resolver, setResolver] = useState<any | undefined>(undefined);
    const framework = useFramework();
    useMemo(() => {
        framework.modules.serviceDiscovery
            .createClient('people')
            .then((httpClient) => createPersonClient(httpClient))
            .then(setResolver);
    }, [framework]);
    return resolver;
};
