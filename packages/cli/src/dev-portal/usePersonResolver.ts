// TODO - @AndrejNikolicEq fix export for react component
import {
    PersonPresence,
    PersonDetails,
    PersonResolver,
    PersonSearchResult,
    PersonSearchResponse,
} from '@equinor/fusion-wc-person';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { useFramework } from '@equinor/fusion-framework-react';
import { Query } from '@equinor/fusion-query';
import { useMemo, useState } from 'react';

/* Get photo from endpoint, DRY helper */
const getPhotoAsync = async (client: IHttpClient, azureUniqueId: string) => {
    let blob;
    try {
        const response = await client.fetch(`/persons/${azureUniqueId}/photo?api-version=2.0`);
        const imageBlob = await response.blob();
        blob = URL.createObjectURL(imageBlob);
    } catch (e) {
        console.debug('Could not load avatar for user:', azureUniqueId);
    }
    return blob;
};

const createPersonClient = (client: IHttpClient): PersonResolver => {
    // TODO - good cache amount? 3min?
    const expire = 3 * 60 * 1000;

    const queryPerson = new Query({
        expire,
        queueOperator: 'merge',
        key: (query) => query,
        client: {
            fn: async (query: string) => {
                const persons = await client.json<PersonSearchResponse>(
                    `/search/persons/query?api-version=1.0`,
                    {
                        method: 'POST',
                        body: {
                            matchAll: true,
                            fullQueryMode: true,
                            search: query,
                            searchFields: ['name', 'mobilePhone', 'mail'],
                            includeTotalResultCount: true,
                        },
                    }
                );

                if (persons.count > 0) {
                    persons.results.map(async (person: PersonSearchResult) => {
                        // person.document.pictureSrc =
                        //     'https://cryptologos.cc/logos/shiba-inu-shib-logo.png?v=025';
                        // person.document.pictureSrc = 'account_circle';
                        person.document.pictureSrc = await getPhotoAsync(
                            client,
                            person.document.azureUniqueId
                        );
                    });
                }

                return persons;
            },
        },
    });

    const queryDetails = new Query({
        expire,
        queueOperator: 'merge',
        key: (azureId) => azureId,
        client: {
            fn: async (azureId: string) => {
                const user = await client.json<PersonDetails>(
                    `/persons/${azureId}?api-version=4.0`
                );
                if (user) {
                    user.pictureSrc = await getPhotoAsync(client, user.azureUniqueId);

                    if (user.manager) {
                        user.manager.pictureSrc = await getPhotoAsync(
                            client,
                            user.manager.azureUniqueId
                        );
                    }
                }
                return user;
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
    const [resolver, setResolver] = useState<PersonResolver>();
    const framework = useFramework();
    useMemo(() => {
        framework.modules.serviceDiscovery
            .createClient('people')
            .then((httpClient) => createPersonClient(httpClient))
            .then((res) => setResolver(res));
    }, [framework]);
    return resolver;
};
