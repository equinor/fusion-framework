// TODO - @AndrejNikolicEq fix export for react component
import {
    PersonDetails,
    PersonResolver,
    PersonQueryDetails,
    AvatarData,
    PersonPresence,
} from '@equinor/fusion-wc-person';
import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { useFramework } from '@equinor/fusion-framework-react';
import { Query } from '@equinor/fusion-query';
import { useMemo, useState } from 'react';
import { switchMap, filter, map, take } from 'rxjs/operators';
import { from, lastValueFrom, concat } from 'rxjs';

const createPersonClient = (client: IHttpClient): PersonResolver => {
    const expire = 3 * 60 * 1000;

    const personQuery = new Query({
        expire,
        queueOperator: 'merge',
        key: (query) => query,
        client: {
            fn: (query: string, signal) => {
                return client.json$<PersonQueryDetails>(
                    `/persons?api-version=2.0&$search=${query}`,
                    {
                        signal,
                    }
                );
            },
        },
    });

    const personDetails = new Query({
        expire,
        queueOperator: 'merge',
        key: (azureId) => azureId,
        client: {
            fn: (azureId: string, signal) =>
                client.json$<PersonDetails>(`/persons/${azureId}?api-version=4.0`, {
                    signal,
                }),
        },
    });

    const getPhotoQuery = new Query({
        expire,
        queueOperator: 'merge',
        key: (azureId) => azureId,
        client: {
            fn: (azureId: string, signal) =>
                client
                    .fetch$(`/persons/${azureId}/photo?api-version=2.0`, {
                        signal,
                    })
                    .pipe(
                        switchMap(async (response) => {
                            if (response.ok) {
                                const blob = await response.blob();
                                return URL.createObjectURL(blob);
                            }
                        })
                    ),
        },
    });

    const personAvatar = async (
        params: {
            azureId?: string;
            upn?: string;
        },
        controller?: AbortController
    ): Promise<AvatarData> => {
        console.log('FCLI::personAvatar params', params);
        const { azureId, upn } = params;
        if (!azureId && !upn) {
            throw Error('PersonResolver needs parameter azureId or upn to resolve personAvatar');
        }

        const person$ = azureId
            ? concat(
                  from(Object.values(personQuery.cache.state)).pipe(
                      map((x) => x.value),
                      map((item) => item.find((x) => x.azureUniqueId === azureId))
                  ),
                  personDetails.query(azureId, { client: { controller } }).pipe(map((x) => x.value))
              )
            : concat(
                  from(Object.values(personDetails.cache.state)).pipe(
                      map((x) => x.value),
                      filter((x) => x.mail === upn)
                  ),
                  personQuery.query(upn, { client: { controller } }).pipe(
                      map((x) => x.value),
                      map((item) => item.find((x) => x.mail === upn))
                  )
              );

        const result$ = person$.pipe(
            take(1),
            switchMap((person) => {
                if (!person) {
                    throw Error(
                        'PersonResolver could not find avatar on person based on params' +
                            JSON.stringify({
                                azureId,
                                upn,
                            })
                    );
                }

                const { azureUniqueId, name = '', accountType } = person;

                return getPhotoQuery.query(azureUniqueId, { client: { controller } }).pipe(
                    map((result) => {
                        return {
                            azureUniqueId,
                            name,
                            accountType,
                            pictureSrc: result.value ?? '',
                        } satisfies AvatarData;
                    })
                );
            })
        );

        return lastValueFrom(result$);
    };

    const personPresence = new Query({
        expire,
        queueOperator: 'merge',
        key: (azureId) => azureId,
        client: {
            fn: (azureId: string, signal) =>
                client.json$<PersonPresence>(`/persons/${azureId}/presence?api-version=1.0`, {
                    signal,
                }),
        },
    });

    return {
        getQuery: (query: string, controller?: AbortController) =>
            personQuery
                .queryAsync(query, { client: { controller }, awaitResolve: true })
                .then((x) => x.value),

        getDetails: (azureId: string, controller?: AbortController) =>
            personDetails
                .queryAsync(azureId, { client: { controller }, awaitResolve: true })
                .then((x) => x.value),

        getImageByAzureId: (azureId: string, controller?: AbortController) =>
            personAvatar({ azureId }, controller),

        getImageByUpn: (upn: string, controller?: AbortController) =>
            personAvatar({ upn }, controller),

        getPresence: (azureId: string, controller?: AbortController) =>
            personPresence
                .queryAsync(azureId, { client: { controller }, awaitResolve: true })
                .then((x) => x.value),
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
