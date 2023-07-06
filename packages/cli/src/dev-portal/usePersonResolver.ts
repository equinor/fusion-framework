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
            fn: async (azureId: string) => {
                const user = await client.json<PersonDetails>(
                    `/persons/${azureId}?api-version=4.0&$expand=positions,manager`
                );

                // Profile image
                await client
                    .fetch(`/persons/${azureId}/photo?api-version=2.0`)
                    .then(async (response) => {
                        if (response.ok) {
                            const data = await response.blob();
                            const result = URL.createObjectURL(data);
                            user.pictureSrc = result;
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });

                // Manager profile image
                if (user.manager) {
                    await client
                        .fetch(`/persons/${user.manager.azureUniqueId}/photo?api-version=2.0`)
                        .then(async (response) => {
                            if (response.ok) {
                                const data = await response.blob();
                                const result = URL.createObjectURL(data);
                                if (user.manager) {
                                    user.manager.pictureSrc = result;
                                }
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                        });
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
