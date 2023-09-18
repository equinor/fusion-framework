import { EMPTY, Observable, concat, from, fromEvent } from 'rxjs';
import { filter, find, map, raceWith, switchMap, take, takeUntil } from 'rxjs/operators';

import type { ApiPerson, PeopleApiClient } from '@equinor/fusion-framework-module-services/people';
import { isApiPerson } from '@equinor/fusion-framework-module-services/people/utils';
import type { ApiResponse as GetPersonApiResponse } from '@equinor/fusion-framework-module-services/people/get';
import type { ApiResponse as QueryPersonApiResponse } from '@equinor/fusion-framework-module-services/people/query';
import { Query } from '@equinor/fusion-query';
import { queryValue } from '@equinor/fusion-query/operators';

type GetPersonResult = GetPersonApiResponse<
    'v4',
    { azureId: ''; expand: ['positions', 'manager'] }
>;

type PersonSearchResult = QueryPersonApiResponse<'v2'>;

type MatcherArgs = { upn: string; azureId?: string } | { upn?: string; azureId: string };

type ResolverArgs<T> = T extends object
    ? { [K in keyof T]: T[K] } & { signal?: AbortSignal }
    : { signal?: AbortSignal };

const personMatcher =
    (args: MatcherArgs) =>
    <T extends { azureUniqueId?: string; upn?: string }>(value: T): value is T => {
        const { azureId, upn } = args;
        if (azureId && upn) {
            return (
                value.upn?.toLocaleLowerCase() === upn.toLocaleLowerCase() &&
                value.azureUniqueId === azureId
            );
        } else if (azureId) {
            return value.azureUniqueId === azureId;
        } else if (upn) {
            return value.upn?.toLocaleLowerCase() === upn.toLocaleLowerCase();
        }
        return false;
    };

export interface IPersonController {
    getPerson(args: ResolverArgs<MatcherArgs>): Observable<GetPersonResult>;
    getPersonInfo(args: ResolverArgs<MatcherArgs>): Observable<ApiPerson<'v2'>>;
    getPhoto(args: ResolverArgs<MatcherArgs>): Observable<string>;
    search(args: ResolverArgs<{ search: string }>): Observable<PersonSearchResult>;
}

export class PersonController implements IPersonController {
    #personQuery: Query<GetPersonResult, ResolverArgs<{ azureId: string }>>;
    #personSearchQuery: Query<PersonSearchResult, ResolverArgs<{ search: string }>>;
    #personPhotoQuery: Query<Blob, ResolverArgs<{ azureId: string }>>;

    constructor(client: PeopleApiClient) {
        const expire = 3 * 60 * 1000;
        this.#personQuery = new Query({
            expire,
            queueOperator: 'merge',
            key: ({ azureId }) => azureId,
            client: {
                fn: ({ azureId }, signal): Observable<GetPersonResult> => {
                    return client.get(
                        'v4',
                        'json$',
                        { azureId, expand: ['manager', 'positions'] },
                        { signal },
                    );
                },
            },
        });
        this.#personSearchQuery = new Query({
            expire,
            queueOperator: 'merge',
            key: ({ search }) => search,
            client: {
                fn: ({ search }, signal) => {
                    return client.query('v2', 'json$', { search }, { signal });
                },
            },
        });
        this.#personPhotoQuery = new Query({
            expire,
            queueOperator: 'merge',
            key: ({ azureId }) => azureId,
            client: {
                fn: ({ azureId }, signal) => {
                    return client.photo('v2', 'blob$', { azureId }, { signal });
                },
            },
        });
    }

    public search(args: { search: string; signal?: AbortSignal }): Observable<PersonSearchResult> {
        const {search, signal} = args;
        return this.#personSearchQuery.query({search}, {signal}).pipe(queryValue);
    }

    /** TODO why does this need to have data?!? */
    public getPhoto(args: ResolverArgs<MatcherArgs>): Observable<string> {
        const { azureId, upn, signal } = args;

        if (azureId) {
            return this._getPersonPhotoByAzureId(azureId, signal);
        } else if (upn) {
            return this._getPersonPhotoByUpn(upn, signal);
        }
        throw Error('invalid args provided');
    }

    public getPerson(args: ResolverArgs<MatcherArgs>): Observable<GetPersonResult> {
        const { azureId, upn, signal } = args;
        if (azureId) {
            return this._getPersonByAzureId(azureId, signal);
        } else if (upn) {
            return this._getPersonByUpn(upn, signal);
        }
        throw Error('invalid args provided');
    }

    public getPersonInfo(args: ResolverArgs<MatcherArgs>): Observable<ApiPerson<'v2'>> {
        const { azureId, upn, signal } = args;
        if (azureId) {
            return this._getPersonInfoById(azureId, signal);
        } else if (upn) {
            return this._getPersonInfoByUpn(upn, signal);
        }
        throw Error('invalid args provided');
    }

    protected _getPersonByUpn(upn: string, signal?: AbortSignal): Observable<GetPersonResult> {
        const abort$ = signal ? fromEvent(signal, 'abort') : EMPTY;
        return concat(
            this._personCache$({ upn }),
            this._getPersonInfoByUpn(upn, signal).pipe(
                filter(isApiPerson('v2')),
                switchMap(({ azureUniqueId: azureId }) => {
                    return this._getPersonByAzureId(azureId, signal);
                }),
            ),
        ).pipe(
            /** */
            filter(isApiPerson('v4')),
            takeUntil(abort$),
        );
    }

    public _getPersonByAzureId(azureId: string, signal?: AbortSignal): Observable<GetPersonResult> {
        return this.#personQuery.query({ azureId }, { signal }).pipe(queryValue);
    }

    protected _getPersonInfoById(
        azureId: string,
        signal?: AbortSignal,
    ): Observable<ApiPerson<'v2'>> {
        const abort$ = signal ? fromEvent(signal, 'abort') : EMPTY;
        return concat(
            this._personCache$({ azureId }),
            this._queryCache$({ azureId }),
            this._getPersonByAzureId(azureId, signal),
        ).pipe(
            /** */
            filter(isApiPerson('v2')),
            takeUntil(abort$),
        );
    }

    protected _getPersonInfoByUpn(upn: string, signal?: AbortSignal): Observable<ApiPerson<'v2'>> {
        const matcher = personMatcher({ upn });
        const abort$ = signal ? fromEvent(signal, 'abort') : EMPTY;
        return concat(
            this._cache$({ upn }),
            concat(
                this._queryCache$({ upn }),
                this.#personSearchQuery.query({ search: upn }, {signal}).pipe(
                    /** extract first match, should only be 0 or 1 */
                    map((x) => x.value.find(matcher)),
                    /** type cast and end stream */
                    find(isApiPerson('v2')),
                ),
            ),
        ).pipe(
            /** */
            filter(isApiPerson('v2')),
            takeUntil(abort$),
        );
    }

    protected _getPersonPhotoByAzureId(azureId: string, signal?: AbortSignal): Observable<string> {
        return this.#personPhotoQuery.query({ azureId }, {signal}).pipe(
            /** */
            map((result) => URL.createObjectURL(result.value)),
        );
    }

    protected _getPersonPhotoByUpn(upn: string, signal?: AbortSignal) {
        const matcher = personMatcher({ upn });
        return concat(
            /** */
            this._cache$({ upn }).pipe(
                find(matcher),
                filter((x) => !!x),
            ),
            this.getPersonInfo({ upn }),
        ).pipe(
            /** */
            filter((x): x is ApiPerson<'v2'> => {
                return !!x;
            }),
            switchMap((x) => this._getPersonPhotoByAzureId(x.azureUniqueId, signal)),
        );
    }

    protected _cache$(args: MatcherArgs): Observable<GetPersonResult | ApiPerson<'v2'>> {
        return this._personCache$(args).pipe(
            /** */
            raceWith(this._queryCache$(args)),
        );
    }

    protected _personCache$(args: MatcherArgs): Observable<GetPersonResult> {
        const mather = personMatcher(args);
        return this.#personQuery.cache.state$.pipe(
            /** make subscription cold */
            take(1),
            /** map out cached ApiPerson_v2 which matches upn  */
            map((x) => Object.values(x).find((x) => mather(x.value))?.value),
            filter(isApiPerson('v4')),
        );
    }

    protected _queryCache$(args: MatcherArgs): Observable<ApiPerson<'v2'>> {
        const mather = personMatcher(args);
        return this.#personSearchQuery.cache.state$.pipe(
            /** make subscription cold */
            take(1),
            switchMap((entry) =>
                /** expand cache records */
                from(Object.values(entry)).pipe(
                    /** find matching cache record item */
                    map((x) => x.value.find((x) => mather(x))),
                    /** type cast and end stream */
                    find(isApiPerson('v2')),
                ),
            ),
            filter(isApiPerson('v2')),
        );
    }
}
