import { EMPTY, type Observable, concat, from, fromEvent, of } from 'rxjs';
import { catchError, filter, find, map, switchMap, take, takeUntil } from 'rxjs/operators';

import type { ApiPerson, PeopleApiClient } from '@equinor/fusion-framework-module-services/people';
import { isApiPerson } from '@equinor/fusion-framework-module-services/people/utils';
import type { ApiResponse as GetPersonApiResponse } from '@equinor/fusion-framework-module-services/people/get';
import type { ApiResponse as QueryPersonApiResponse } from '@equinor/fusion-framework-module-services/people/query';
import type { ApiResponse as SuggestPersonApiResponse } from '@equinor/fusion-framework-module-services/people/suggest';
import type { ApiResponse as ResolvePersonApiResponse } from '@equinor/fusion-framework-module-services/people/resolve';
import { Query } from '@equinor/fusion-query';
import { queryValue } from '@equinor/fusion-query/operators';

import type { ApiProviderError } from '@equinor/fusion-framework-module-services/provider';

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
    // Both identifiers must match when both are supplied to avoid a false-positive match
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
  suggest(
    args: ResolverArgs<{ search: string; systemAccounts: boolean }>,
  ): Observable<SuggestPersonApiResponse>;
  resolve(args: ResolverArgs<{ resolveIds: string[] }>): Observable<ResolvePersonApiResponse>;
}

export type PersonControllerOptions = {
  fallbackImage?: Blob;
};

/**
 * Default implementation of {@link IPersonController}, backed by a {@link PeopleApiClient} and
 * a set of {@link Query} caches for people, searches, photos, suggestions, and resolves.
 */
export class PersonController implements IPersonController {
  #personQuery: Query<GetPersonResult, ResolverArgs<{ azureId: string }>>;
  #personSearchQuery: Query<PersonSearchResult, ResolverArgs<{ search: string }>>;
  #personPhotoQuery: Query<Blob, ResolverArgs<{ azureId: string }>>;
  #personSuggestQuery: Query<
    SuggestPersonApiResponse,
    ResolverArgs<{ search: string; systemAccounts: boolean }>
  >;
  #personResolveQuery: Query<ResolvePersonApiResponse, ResolverArgs<{ resolveIds: string[] }>>;

  /**
   * @param client - The people API client used to fetch person data, photos, and search results
   * @param options - Optional controller options, such as a fallback image for missing photos
   * @throws Error if the photo request fails for a reason other than a fallback-eligible 404
   */
  constructor(client: PeopleApiClient, options?: PersonControllerOptions) {
    const expire = 3 * 60 * 1000;
    this.#personQuery = new Query({
      expire,
      queueOperator: 'merge',
      key: ({ azureId }) => azureId,
      client: {
        fn: ({ azureId }, signal): Observable<GetPersonResult> => {
          // Filter out expired positions from the fetched person's result before returning it
          return client
            .get('v4', 'json$', { azureId, expand: ['manager', 'positions'] }, { signal })
            .pipe(
              map((result) => {
                const { positions = [] } = result;
                // Drop positions that have already expired so stale data isn't shown
                const activePositions = positions.filter((x) => new Date(x.appliesTo) > new Date());
                return {
                  ...result,
                  positions: activePositions,
                };
              }),
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
        fn: ({ azureId }, signal): Observable<Blob> => {
          // Extract the blob from the response, falling back to a placeholder image on 404
          return client.photo('v2', 'blob$', { azureId }, { signal }).pipe(
            map((result) => {
              return result.blob;
            }),
            catchError((err) => {
              // Fall back to a placeholder image when the person genuinely has no photo
              if (
                (err as Error).name === 'ApiProviderError' &&
                (err as ApiProviderError).response?.status === 404 &&
                options?.fallbackImage
              ) {
                return of(options?.fallbackImage);
              }
              throw err;
            }),
          );
        },
      },
    });
    this.#personSuggestQuery = new Query({
      expire,
      queueOperator: 'merge',
      key: ({ search, systemAccounts }) => `${search}-${systemAccounts}`,
      client: {
        fn: ({ search, systemAccounts }, signal) => {
          const types = ['Person'];
          // System accounts are opt-in since they're excluded from suggestions by default
          if (systemAccounts) {
            types.push('SystemAccount');
          }
          return client.suggest('json$', {
            method: 'POST',
            body: JSON.stringify({ queryString: search, types }),
            signal,
          });
        },
      },
    });
    this.#personResolveQuery = new Query({
      expire,
      queueOperator: 'merge',
      key: ({ resolveIds }) => JSON.stringify([...resolveIds].sort()),
      client: {
        fn: ({ resolveIds }, signal) => {
          return client.resolve('json$', {
            method: 'POST',
            body: JSON.stringify({ identifiers: resolveIds }),
            signal,
          });
        },
      },
    });
  }

  /**
   * Suggest persons matching the given search string.
   * Search string can be a part of display name, mail, upn or the full azureId.
   * If systemAccounts is true, it will also include system accounts in the result.
   *
   * @param args - The search string, whether to include system accounts, and an optional abort signal
   * @returns An observable emitting the matching suggestions
   */
  public suggest(
    args: ResolverArgs<{ search: string; systemAccounts: boolean }>,
  ): Observable<SuggestPersonApiResponse> {
    const { search, systemAccounts, signal } = args;
    // Unwrap the query result to just its value
    return this.#personSuggestQuery.query({ search, systemAccounts }, { signal }).pipe(queryValue);
  }

  /**
   * Resolve person details for given identifiers, which can be a mix of azureIds and upns.
   *
   * @param args - The identifiers to resolve and an optional abort signal
   * @returns An observable emitting the resolved person details
   */
  public resolve(
    args: ResolverArgs<{ resolveIds: string[] }>,
  ): Observable<ResolvePersonApiResponse> {
    const { resolveIds, signal } = args;
    // Unwrap the query result to just its value
    return this.#personResolveQuery.query({ resolveIds }, { signal }).pipe(queryValue);
  }

  /**
   * Search for persons matching the given search string.
   *
   * @param args - The search string and an optional abort signal
   * @returns An observable emitting the search results
   */
  public search(args: { search: string; signal?: AbortSignal }): Observable<PersonSearchResult> {
    const { search, signal } = args;
    // Unwrap the query result to just its value
    return this.#personSearchQuery.query({ search }, { signal }).pipe(queryValue);
  }

  /**
   * Fetch the photo of a person, resolving by azureId when available, falling back to upn.
   *
   * TODO(#5088): why does this need to have data?!?
   *
   * @param args - A matcher (azureId and/or upn) plus an optional abort signal
   * @returns An observable emitting the object URL of the person's photo
   * @throws Error if neither azureId nor upn is provided
   */
  public getPhoto(args: ResolverArgs<MatcherArgs>): Observable<string> {
    const { azureId, upn, signal } = args;

    // Prefer resolving by azureId when available, falling back to upn
    if (azureId) {
      return this._getPersonPhotoByAzureId(azureId, signal);
    } else if (upn) {
      return this._getPersonPhotoByUpn(upn, signal);
    }
    throw Error('invalid args provided');
  }

  /**
   * Fetch full person details, resolving by azureId when available, falling back to upn.
   *
   * @param args - A matcher (azureId and/or upn) plus an optional abort signal
   * @returns An observable emitting the person details
   * @throws Error if neither azureId nor upn is provided
   */
  public getPerson(args: ResolverArgs<MatcherArgs>): Observable<GetPersonResult> {
    const { azureId, upn, signal } = args;
    // Prefer resolving by azureId when available, falling back to upn
    if (azureId) {
      return this._getPersonByAzureId(azureId, signal);
    } else if (upn) {
      return this._getPersonByUpn(upn, signal);
    }
    throw Error('invalid args provided');
  }

  /**
   * Fetch v2 person info, resolving by azureId when available, falling back to upn.
   *
   * @param args - A matcher (azureId and/or upn) plus an optional abort signal
   * @returns An observable emitting the v2 person info
   * @throws Error if neither azureId nor upn is provided
   */
  public getPersonInfo(args: ResolverArgs<MatcherArgs>): Observable<ApiPerson<'v2'>> {
    const { azureId, upn, signal } = args;
    // Prefer resolving by azureId when available, falling back to upn
    if (azureId) {
      return this._getPersonInfoById(azureId, signal);
    } else if (upn) {
      return this._getPersonInfoByUpn(upn, signal);
    }
    throw Error('invalid args provided');
  }

  /**
   * Resolve a full v4 person by upn, via cache and live lookup.
   *
   * @param upn - The person's upn
   * @param signal - Optional abort signal
   * @returns An observable emitting the resolved v4 person
   */
  protected _getPersonByUpn(upn: string, signal?: AbortSignal): Observable<GetPersonResult> {
    const abort$ = signal ? fromEvent(signal, 'abort') : EMPTY;
    // Resolve the v2 person info by upn, then use its azureId to fetch the full v4 person
    const personByAzureId$ = this._getPersonInfoByUpn(upn, signal).pipe(
      filter(isApiPerson('v2')),
      switchMap(({ azureUniqueId: azureId }) => {
        return this._getPersonByAzureId(azureId, signal);
      }),
    );
    // Emit from cache first, then fall back to the live lookup, stopping once a v4 person arrives
    return concat(this._personCache$({ upn }), personByAzureId$).pipe(
      filter(isApiPerson('v4')),
      takeUntil(abort$),
    );
  }

  /**
   * Fetch a full v4 person by azureId.
   *
   * @param azureId - The person's azureId
   * @param signal - Optional abort signal
   * @returns An observable emitting the fetched v4 person
   */
  public _getPersonByAzureId(azureId: string, signal?: AbortSignal): Observable<GetPersonResult> {
    // Unwrap the query result to just its value
    return this.#personQuery.query({ azureId }, { signal }).pipe(queryValue);
  }

  /**
   * Resolve v2 person info by azureId, via cache and live lookup.
   *
   * @param azureId - The person's azureId
   * @param signal - Optional abort signal
   * @returns An observable emitting the resolved v2 person info
   */
  protected _getPersonInfoById(azureId: string, signal?: AbortSignal): Observable<ApiPerson<'v2'>> {
    const abort$ = signal ? fromEvent(signal, 'abort') : EMPTY;
    // Emit from caches first, then fall back to a live lookup, keeping only v2 persons
    return concat(
      this._personCache$({ azureId }),
      this._queryCache$({ azureId }),
      this._getPersonByAzureId(azureId, signal),
    ).pipe(filter(isApiPerson('v2')), takeUntil(abort$));
  }

  /**
   * Resolve v2 person info by upn, via cache and search-based lookup.
   *
   * @param upn - The person's upn
   * @param signal - Optional abort signal
   * @returns An observable emitting the resolved v2 person info
   */
  protected _getPersonInfoByUpn(upn: string, signal?: AbortSignal): Observable<ApiPerson<'v2'>> {
    const matcher = personMatcher({ upn });
    const abort$ = signal ? fromEvent(signal, 'abort') : EMPTY;
    // Search by upn, then narrow the results down to the single matching entry, if any
    const searchMatch$ = this.#personSearchQuery.query({ search: upn }, { signal }).pipe(
      map((x) => {
        // Narrow the search results down to the one entry matching this upn/azureId
        const match = x.value.find(matcher);
        return match;
      }),
      find(isApiPerson('v2')),
    );
    // Emit from caches first, then fall back to the search-based lookup, keeping only v2 persons
    return concat(this._personCache$({ upn }), this._queryCache$({ upn }), searchMatch$).pipe(
      find(isApiPerson('v2')),
      filter(isApiPerson('v2')),
      takeUntil(abort$),
    );
  }

  /**
   * Fetch a person's photo by azureId as an object URL.
   *
   * @param azureId - The person's azureId
   * @param signal - Optional abort signal
   * @returns An observable emitting the photo's object URL
   */
  protected _getPersonPhotoByAzureId(azureId: string, signal?: AbortSignal): Observable<string> {
    // Take just the first emission and convert the blob result to an object URL
    return this.#personPhotoQuery.query({ azureId }, { signal }).pipe(
      take(1),
      map((result) => URL.createObjectURL(result.value)),
    );
  }

  /**
   * Fetch a person's photo by upn, resolving their azureId first.
   *
   * @param upn - The person's upn
   * @param signal - Optional abort signal
   * @returns An observable emitting the photo's object URL
   */
  protected _getPersonPhotoByUpn(upn: string, signal?: AbortSignal) {
    // Take just the first emission, then fetch the photo using its resolved azureId
    return this._getPersonInfoByUpn(upn, signal).pipe(
      take(1),
      switchMap((x) => this._getPersonPhotoByAzureId(x.azureUniqueId, signal)),
    );
  }

  /**
   * Search the person-query cache for a matching v4 person.
   *
   * @param args - A matcher (azureId and/or upn) used to find the cached entry
   * @returns An observable emitting the matching cached v4 person, if any
   */
  protected _personCache$(args: MatcherArgs): Observable<GetPersonResult> {
    const mather = personMatcher(args);
    // Search the person-query cache for the first matching v4 entry
    return this.#personQuery.cache.state$.pipe(
      take(1),
      map((x) => {
        // Search each cached query result entry for the one matching this person
        const match = Object.values(x).find((x) => mather(x.value));
        return match?.value;
      }),
      find(isApiPerson('v4')),
      filter(isApiPerson('v4')),
    );
  }

  /**
   * Search the search-query cache for a matching v2 person.
   *
   * @param args - A matcher (azureId and/or upn) used to find the cached entry
   * @returns An observable emitting the matching cached v2 person, if any
   */
  protected _queryCache$(args: MatcherArgs): Observable<ApiPerson<'v2'>> {
    const mather = personMatcher(args);
    // Search the search-query cache for the first matching v2 entry
    return this.#personSearchQuery.cache.state$.pipe(
      take(1),
      switchMap((entry) => {
        // Expand the cache entry's records and find the one matching this person
        return from(Object.values(entry)).pipe(
          map((x) => {
            // Search each cached entry's results for the one matching this person
            const match = x.value.find((x) => mather(x));
            return match;
          }),
          find(isApiPerson('v2')),
        );
      }),
      find(isApiPerson('v2')),
      filter(isApiPerson('v2')),
    );
  }
}
