import { Observable, concat, from } from 'rxjs';
import { filter, find, map, raceWith, switchMap, take } from 'rxjs/operators';

import type { ApiPerson, PeopleApiClient } from '@equinor/fusion-framework-module-services/people';
import type { ApiResponse as GetPersonApiResponse } from '@equinor/fusion-framework-module-services/people/get';
import type { ApiResponse as QueryPersonApiResponse } from '@equinor/fusion-framework-module-services/people/query';
import Query from '@equinor/fusion-query';

type GetPersonResult = GetPersonApiResponse<
    'v4',
    { azureId: ''; expand: ['positions', 'manager'] }
>;

type PersonSearchResult = QueryPersonApiResponse<'v2'>;

type MatcherArgs = { upn: string; azureId?: string } | { upn?: string; azureId: string };

const personMatcher =
    (args: MatcherArgs) =>
    <T extends { azureUniqueId?: string; upn?: string }>(value: T): value is T => {
        const { azureId, upn } = args;
        if (azureId && upn) {
            return value.upn === upn && value.azureUniqueId === azureId;
        } else if (azureId) {
            return value.azureUniqueId === azureId;
        } else if (upn) {
            return value.upn === upn;
        }
        return false;
    };

export interface IPersonController {
    getPerson(args: MatcherArgs): Observable<GetPersonResult>;
    getPersonInfo(args: MatcherArgs): Observable<ApiPerson<'v2'>>;
    getPhoto(args: MatcherArgs): Observable<string>;
    search(args: { search: string }): Observable<PersonSearchResult>;
}

export class PersonController implements IPersonController {
    #personQuery: Query<GetPersonResult, { azureId: string }>;
    #personSearchQuery: Query<PersonSearchResult, { search: string }>;
    #personPhotoQuery: Query<Blob, { azureId: string }>;

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

    /** TODO why does this need to have data?!? */
    public getPhoto(args: MatcherArgs): Observable<string> {
        const { azureId, upn } = args;

        const resolve = (azureId: string) =>
            this.#personPhotoQuery
                .query({ azureId })
                .pipe(map((blob) => URL.createObjectURL(blob.value)));

        if (azureId) {
            return resolve(azureId);
        }

        if (!azureId && upn) {
            const cache$ = this._personCache$(args).pipe(raceWith(this._queryCache$(args)));
            return concat(
                /** */
                cache$.pipe(find((x) => x?.upn === upn)),
                this.getPersonInfo({ upn }),
            ).pipe(
                /** */
                filter((x): x is ApiPerson<'v2'> => {
                    return !!x;
                }),
                switchMap((x) => resolve(x.azureUniqueId)),
            );
        }
        throw Error('invalid args provided');
    }

    public getPerson(args: MatcherArgs): Observable<GetPersonResult> {
        if (args.azureId) {
            return this._getPersonById(args.azureId);
        } else if (args.upn) {
            return this._getPersonByUpn(args.upn);
        }
        throw Error('invalid args provided');
    }

    public getPersonInfo(args: MatcherArgs): Observable<ApiPerson<'v2'>> {
        if (args.azureId) {
            return this._getPersonInfoById(args.azureId);
        } else if (args.upn) {
            return this._getPersonInfoByUpn(args.upn);
        }
        throw Error('invalid args provided');
    }

    public search(args: { search: string }): Observable<PersonSearchResult> {
        return this.#personSearchQuery.query(args).pipe(
            /** extract value */
            map((x) => x.value),
        );
    }

    protected _getPersonById(azureId: string): Observable<GetPersonResult> {
        return this.#personQuery.query({ azureId }).pipe(map((x) => x.value));
    }

    protected _getPersonInfoById(azureId: string): Observable<ApiPerson<'v2'>> {
        return concat(
            this._personCache$({ azureId }).pipe(filter((x): x is GetPersonResult => !!x)),
            concat(
                this._queryCache$({ azureId }),
                this.#personQuery.query({ azureId }).pipe(
                    // TODO add mapper from v4 -> v2
                    map((x) => x.value as ApiPerson<'v2'>),
                ),
            ).pipe(filter((x): x is ApiPerson<'v2'> => !!x)),
        ).pipe(
            map((x) => {
                if (!x) {
                    throw Error(`upn [${azureId}] not found`);
                }
                return x as ApiPerson<'v2'>;
            }),
        );
    }

    protected _getPersonByUpn(upn: string): Observable<GetPersonResult> {
        return concat(
            this._personCache$({ upn }),
            this._getPersonInfoByUpn(upn).pipe(
                filter((x): x is ApiPerson<'v2'> => !!x),
                switchMap((x) =>
                    this.#personQuery.query({ azureId: x!.azureUniqueId }).pipe(
                        /** extract value */
                        map((x) => x.value),
                    ),
                ),
            ),
        ).pipe(
            map((x) => {
                if (!x) {
                    throw Error(`upn [${upn}] not found`);
                }
                return x;
            }),
        );
    }

    protected _getPersonInfoByUpn(upn: string): Observable<ApiPerson<'v2'>> {
        return concat(
            this._personCache$({ upn }),
            concat(
                this._queryCache$({ upn }),
                this.#personSearchQuery.query({ search: upn }).pipe(
                    /** extract first match, should only be 0 or 1 */
                    map((x) => x.value.find((x) => x.upn === upn)),
                    /** type cast and end stream */
                    find((x): x is ApiPerson<'v2'> => !!x),
                ),
            ).pipe(filter((x): x is ApiPerson<'v2'> => !!x)),
        ).pipe(
            map((x) => {
                if (!x) {
                    throw Error(`upn [${upn}] not found`);
                }
                return x as ApiPerson<'v2'>;
            }),
        );
    }

    protected _personCache$(args: MatcherArgs): Observable<GetPersonResult | undefined> {
        const mather = personMatcher(args);
        return this.#personQuery.cache.state$.pipe(
            /** make subscription cold */
            take(1),
            /** map out cached ApiPerson_v2 which matches upn  */
            map((x) => Object.values(x).find((x) => mather(x.value))?.value),
        );
    }

    protected _queryCache$(args: MatcherArgs) {
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
                    find((x): x is ApiPerson<'v2'> => !!x),
                ),
            ),
        );
    }
}
