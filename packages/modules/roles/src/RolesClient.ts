import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { Query } from '@equinor/fusion-query';
import {
  activateClaimableRoleAssignment,
  deactivateClaimableRoleAssignment,
  listAccessRoles,
  listAccountActiveAccessRoleAssignments,
  listAccountClaimableRoleAssignments,
  listAccountConsolidatedClaimableRoleAssignments,
  listAccountConsolidatedRoleAssignments,
  type ApiAccountActiveAccessRoleAssignmentV1,
  type ApiClaimableRoleAssignmentActivationV1,
  type ApiConsolidatedClaimableRoleAssignmentV1,
  type ApiConsolidatedRoleAssignmentV1,
  type ApiExtendedAccessRoleV1,
  type ListAccessRolesArg,
  type ListAccessRolesResponse,
} from '@equinor/fusion-services/roles';
import {
  concatMap,
  defer,
  EMPTY,
  expand,
  filter,
  forkJoin,
  from,
  last,
  map,
  type Observable,
  of,
  reduce,
  switchMap,
  tap,
} from 'rxjs';

import { RolesError } from './errors/RolesError.js';
import type {
  RequiredAccessRoleClaimableAssignment,
  RequiredAccessRoleStatus,
} from './RequiredAccessRoleStatus.js';

const ROLES_CACHE_EXPIRY_MS = 60_000;

/**
 * Input required to activate a claimable role assignment.
 */
export interface ActivateClaimableRoleAssignmentInput {
  /** Claimable role assignment identifier. */
  assignmentId: string;
  /** Reason recorded for activating the claimable role assignment. */
  reason?: string;
  /** Requested activation duration in hours. */
  hours?: number | string;
}

/**
 * Input required to deactivate an active claimable role assignment.
 */
export interface DeactivateClaimableRoleAssignmentInput {
  /** Claimable assignment identifier whose current activation should end. */
  assignmentId: string;
}

/**
 * Controls whether a Roles V2 collection read may use its cached value.
 */
export interface RolesReadOptions {
  /** Invalidates the collection cache before reading when true. */
  refresh?: boolean;
}

/**
 * Resolves the account selected by the current authentication state.
 */
export type RolesAccountResolver = () => string | Promise<string>;

/**
 * Runtime dependencies supplied when a Roles client is initialized.
 */
export interface RolesClientInitializeOptions {
  /**
   * Resolves the account selected by the current authentication state.
   *
   * @returns The current Fusion account identifier.
   */
  resolveCurrentAccountIdentifier: RolesAccountResolver;
}

interface ClaimableRoleAssignmentForAccessRoleQueryArgs {
  accountIdentifier: string;
  accessRoleName: string;
}

/**
 * Typed client contract for executing functions from `@equinor/fusion-services/roles`.
 *
 * Operations return cold, single-result observables that complete or error.
 * Access-role reads emit one service page; the provider owns async iteration over pages.
 */
export interface IRolesClient {
  /**
   * Initializes account resolution before role operations are used.
   *
   * @param options - Runtime dependencies used by account-scoped operations.
   */
  initialize(options: RolesClientInitializeOptions): void | Promise<void>;

  /**
   * Gets the account's currently active, deduplicated access-role assignments.
   *
   * `/active-access-role-assignments` drops provenance: an assignment cannot be attributed to a
   * standing grant or an activated claim from this collection alone.
   *
   * @returns Active access-role assignments for the scoped account.
   */
  getActiveAccessRoleAssignments(
    options?: RolesReadOptions,
  ): Observable<ApiAccountActiveAccessRoleAssignmentV1[]>;

  /**
   * Gets the roles the account is eligible to claim, consolidated across contributing sources.
   *
   * @returns Consolidated claimable-role assignments for the scoped account.
   */
  getConsolidatedClaimableRoleAssignments(
    options?: RolesReadOptions,
  ): Observable<ApiConsolidatedClaimableRoleAssignmentV1[]>;

  /**
   * Gets the account's consolidated, standing role assignments from `/consolidated-role-assignments`.
   *
   * These assignments are not claimable, but Roles V2 never calls them permanent: they may still be
   * validity-bounded. `assignmentType` reported on
   * {@link IRolesClient.getActiveAccessRoleAssignments | active} assignments cannot reliably
   * distinguish this standing grant from an activated claim, so consumers must read this collection
   * instead of inferring provenance from active assignments.
   *
   * @returns Consolidated role assignments for the scoped account.
   */
  getConsolidatedRoleAssignments(
    options?: RolesReadOptions,
  ): Observable<ApiConsolidatedRoleAssignmentV1[]>;

  /**
   * Activates a claimable role assignment for the scoped account.
   *
   * @param input - Claimable role assignment identifier, reason, and requested duration.
   * @returns Activation metadata returned by Roles V2.
   */
  activateClaimableRoleAssignment(
    input: ActivateClaimableRoleAssignmentInput,
  ): Observable<ApiClaimableRoleAssignmentActivationV1>;

  /**
   * Ends the current activation for a claimable role assignment.
   *
   * @param input - Claimable role assignment identifier to deactivate.
   * @returns Updated activation metadata returned by Roles V2.
   */
  deactivateClaimableRoleAssignment(
    input: DeactivateClaimableRoleAssignmentInput,
  ): Observable<ApiClaimableRoleAssignmentActivationV1>;

  /**
   * Checks whether any claimable role assignment grants an access role when activated.
   *
   * @param accessRoleName - Exact access-role name to find in expanded mappings.
   * @returns True when the account holds a claimable role assignment granting the access role.
   */
  hasClaimableRoleAssignmentForAccessRole(accessRoleName: string): Observable<boolean>;

  /**
   * Resolves whether required access roles exist and which claimable role assignments grant them.
   *
   * @param accessRoleNames - Exact access-role names required by an application.
   * @returns Statuses in the same order as the unique requested access-role names.
   */
  getRequiredAccessRoleStatuses(
    accessRoleNames: readonly string[],
  ): Observable<RequiredAccessRoleStatus[]>;

  /**
   * Fetches one access-role page without following its continuation.
   *
   * @param options - Service page size and offset; defaults to the first 100 roles.
   * @param signal - Optional cancellation signal for in-flight page requests.
   * @returns A cold observable emitting one page with its continuation metadata.
   * @throws {Error} Through the observable error channel when the request fails.
   */
  getAccessRoles(
    options?: Pick<ListAccessRolesArg<'v1'>, 'top' | 'skip'>,
    signal?: AbortSignal,
  ): Observable<ListAccessRolesResponse<'v1'>>;

  /**
   * Completes internal cache resources when the owning provider is disposed.
   */
  dispose?(): void;
}

/**
 * Executes typed Roles V2 endpoint functions for the account resolved by each operation.
 *
 * Transport, account resolution, query resources, and request helpers are protected so test and
 * custom clients can extend the built-in behavior without duplicating its lifecycle.
 *
 * @remarks
 * Each operation is cold and emits one result before completing. Account resolution is a
 * one-shot read per subscription, not an account-change stream; `switchMap` connects that read
 * to its request and propagates teardown. Query owns read caching; mutations are not shared
 * or retried, so subscribing twice can execute a mutation twice.
 *
 * Required-access-role lookup joins two finite pipelines: a bounded registry scan and an ordered
 * claimable-assignment index. Both must emit even for empty data so `forkJoin` can emit a
 * complete result.
 * Service errors remain errors, never empty success values. The provider alone converts
 * observables into Promises or consumer-driven async iteration.
 */
export class RolesClient implements IRolesClient {
  /** Account-isolated cache for active access-role assignments. */
  protected readonly activeAccessRoleAssignmentsQuery: Query<
    ApiAccountActiveAccessRoleAssignmentV1[],
    string
  >;
  /** Account-isolated cache for consolidated claimable-role assignments. */
  protected readonly consolidatedClaimableRoleAssignmentsQuery: Query<
    ApiConsolidatedClaimableRoleAssignmentV1[],
    string
  >;
  /** Account-isolated cache for consolidated role assignments. */
  protected readonly consolidatedRoleAssignmentsQuery: Query<
    ApiConsolidatedRoleAssignmentV1[],
    string
  >;
  /** Account and access-role isolated cache for claimable-role-assignment eligibility. */
  protected readonly claimableRoleAssignmentForAccessRoleQuery: Query<
    boolean,
    ClaimableRoleAssignmentForAccessRoleQueryArgs
  >;

  /**
   * Creates a Roles V2 client with an account resolver for direct and configured usage.
   *
   * @param httpClient - Service-discovery-backed framework HTTP client.
   * @param accountResolver - Resolves the account selected when each operation executes.
   */
  constructor(
    /** HTTP transport used by Roles V2 request functions. */
    protected readonly httpClient: IHttpClient,
    /** Resolver called before every account-scoped operation. */
    protected accountResolver: RolesAccountResolver,
  ) {
    this.activeAccessRoleAssignmentsQuery = new Query({
      client: {
        fn: (accountIdentifier) =>
          listAccountActiveAccessRoleAssignments(
            'v1',
            this.httpClient,
            'json$',
          )({
            accountIdentifier,
          }),
      },
      // Account-scoped keys prevent a signed-in account change from reusing another account's data.
      key: (accountIdentifier) => accountIdentifier,
      expire: ROLES_CACHE_EXPIRY_MS,
    });
    this.consolidatedClaimableRoleAssignmentsQuery = new Query({
      client: {
        fn: (accountIdentifier) =>
          listAccountConsolidatedClaimableRoleAssignments(
            'v1',
            this.httpClient,
            'json$',
          )({
            accountIdentifier,
          }),
      },
      // Account-scoped keys preserve independent claimable-role-assignment caches across account changes.
      key: (accountIdentifier) => accountIdentifier,
      expire: ROLES_CACHE_EXPIRY_MS,
    });
    this.consolidatedRoleAssignmentsQuery = new Query({
      client: {
        fn: (accountIdentifier) =>
          listAccountConsolidatedRoleAssignments(
            'v1',
            this.httpClient,
            'json$',
          )({
            accountIdentifier,
          }),
      },
      // Account-scoped keys preserve independent consolidated-role-assignment caches across account changes.
      key: (accountIdentifier) => accountIdentifier,
      expire: ROLES_CACHE_EXPIRY_MS,
    });
    this.claimableRoleAssignmentForAccessRoleQuery = new Query({
      client: {
        fn: (args) => this._fetchHasClaimableRoleAssignmentForAccessRole(args),
      },
      // Both values define eligibility and must participate in cache identity.
      key: ({ accountIdentifier, accessRoleName }) =>
        JSON.stringify([accountIdentifier, accessRoleName]),
      expire: ROLES_CACHE_EXPIRY_MS,
    });
  }

  /** {@inheritDoc IRolesClient.initialize} */
  public initialize(options: RolesClientInitializeOptions): void {
    this.accountResolver = options.resolveCurrentAccountIdentifier;
  }

  /** {@inheritDoc IRolesClient.getActiveAccessRoleAssignments} */
  public getActiveAccessRoleAssignments(
    options: RolesReadOptions = {},
  ): Observable<ApiAccountActiveAccessRoleAssignmentV1[]> {
    // Resolve the selected account and invalidate caches only when the read is subscribed.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      // The resolver emits once; switchMap transfers subscription ownership to the cached read.
      switchMap((accountIdentifier) => {
        // User-visible refreshes must bypass the minute-long query cache.
        if (options.refresh) {
          this.activeAccessRoleAssignmentsQuery.invalidate();
        }
        // Unwrap Query's result envelope without introducing a second cache or subscription.
        return Query.extractQueryValue(
          this.activeAccessRoleAssignmentsQuery.query(accountIdentifier),
        );
      }),
    );
  }

  /** {@inheritDoc IRolesClient.getConsolidatedClaimableRoleAssignments} */
  public getConsolidatedClaimableRoleAssignments(
    options: RolesReadOptions = {},
  ): Observable<ApiConsolidatedClaimableRoleAssignmentV1[]> {
    // Resolve the selected account and invalidate caches only when the read is subscribed.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      // One account resolution selects one account-isolated collection read.
      switchMap((accountIdentifier) => {
        // User-visible refreshes must bypass the minute-long query cache.
        if (options.refresh) {
          this.consolidatedClaimableRoleAssignmentsQuery.invalidate();
        }
        // Keep cache lifecycle and concurrent-read coordination inside Query.
        return Query.extractQueryValue(
          this.consolidatedClaimableRoleAssignmentsQuery.query(accountIdentifier),
        );
      }),
    );
  }

  /** {@inheritDoc IRolesClient.getConsolidatedRoleAssignments} */
  public getConsolidatedRoleAssignments(
    options: RolesReadOptions = {},
  ): Observable<ApiConsolidatedRoleAssignmentV1[]> {
    // Resolve the selected account and invalidate caches only when the read is subscribed.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      // One account resolution selects one account-isolated collection read.
      switchMap((accountIdentifier) => {
        // User-visible refreshes must bypass the minute-long query cache.
        if (options.refresh) {
          this.consolidatedRoleAssignmentsQuery.invalidate();
        }
        // Keep cache lifecycle and concurrent-read coordination inside Query.
        return Query.extractQueryValue(
          this.consolidatedRoleAssignmentsQuery.query(accountIdentifier),
        );
      }),
    );
  }

  /** {@inheritDoc IRolesClient.activateClaimableRoleAssignment} */
  public activateClaimableRoleAssignment(
    input: ActivateClaimableRoleAssignmentInput,
  ): Observable<ApiClaimableRoleAssignmentActivationV1> {
    // Activation is lazy, and failed requests must leave existing read caches intact.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      // Resolve once before mutating; do not retry or resubscribe to this non-idempotent operation.
      switchMap((accountIdentifier) =>
        activateClaimableRoleAssignment(
          'v1',
          this.httpClient,
          'json$',
        )({
          accountIdentifier,
          claimableRoleAssignmentId: input.assignmentId,
          reason: input.reason,
          hours: input.hours,
        }),
      ),
      // Invalidate before forwarding the successful activation; error emissions never enter tap.
      tap(() => this._invalidateReadCaches()),
    );
  }

  /** {@inheritDoc IRolesClient.deactivateClaimableRoleAssignment} */
  public deactivateClaimableRoleAssignment(
    input: DeactivateClaimableRoleAssignmentInput,
  ): Observable<ApiClaimableRoleAssignmentActivationV1> {
    // Deactivation is lazy, and only a successful mutation invalidates role reads.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      // Bind this single deactivation request to the account selected at subscription time.
      switchMap((accountIdentifier) =>
        deactivateClaimableRoleAssignment(
          'v1',
          this.httpClient,
          'json$',
        )({
          accountIdentifier,
          claimableRoleAssignmentId: input.assignmentId,
        }),
      ),
      // Preserve the response unchanged while making subsequent reads observe the mutation.
      tap(() => this._invalidateReadCaches()),
    );
  }

  /** {@inheritDoc IRolesClient.hasClaimableRoleAssignmentForAccessRole} */
  public hasClaimableRoleAssignmentForAccessRole(accessRoleName: string): Observable<boolean> {
    // Each subscription uses the current account's isolated eligibility cache.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      // The account/name cache key prevents eligibility results leaking between requests.
      switchMap((accountIdentifier) =>
        Query.extractQueryValue(
          this.claimableRoleAssignmentForAccessRoleQuery.query({
            accountIdentifier,
            accessRoleName,
          }),
        ),
      ),
    );
  }

  /** {@inheritDoc IRolesClient.getRequiredAccessRoleStatuses} */
  public getRequiredAccessRoleStatuses(
    accessRoleNames: readonly string[],
  ): Observable<RequiredAccessRoleStatus[]> {
    const uniqueAccessRoleNames = [...new Set(accessRoleNames)];
    // No collections are needed when no access roles are required.
    if (uniqueAccessRoleNames.length === 0) {
      return of([]);
    }
    // Resolve the account lazily, then subscribe to both finite lookups under one error boundary.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      switchMap((accountIdentifier) =>
        // Both branches must emit once and complete; an error unsubscribes the sibling immediately.
        forkJoin({
          registeredAccessRolesByName: this._fetchRegisteredAccessRoles(uniqueAccessRoleNames),
          claimableAssignmentsByAccessRole: this._fetchRequiredAccessRoleClaimableAssignments(
            accountIdentifier,
            new Set(uniqueAccessRoleNames),
          ),
        }),
      ),
      // Combine only complete indexes: partial registry or eligibility results cannot describe recovery safely.
      map(({ registeredAccessRolesByName, claimableAssignmentsByAccessRole }) => {
        // Preserve configuration order so recovery UI matches the application requirement.
        return uniqueAccessRoleNames.map((name) => ({
          name,
          description: registeredAccessRolesByName.get(name)?.description,
          exists: registeredAccessRolesByName.has(name),
          claimableAssignments: claimableAssignmentsByAccessRole.get(name) ?? [],
        }));
      }),
    );
  }

  /**
   * Resolves claimable role assignments into a bounded index keyed by required access-role name.
   *
   * @param accountIdentifier - Authenticated account whose assignments are inspected.
   * @param accessRoleNames - Required access-role names to retain.
   * @returns One claimable-assignment index per subscription, preserving assignment and mapping order.
   * @throws {RolesError} When the service returns an unfollowable continuation.
   *
   * @remarks
   * Page -> assignments -> mappings -> named claimable assignments -> one index. `concatMap`
   * preserves API order while flattening finite arrays. The seeded `reduce` emits an empty map
   * when every record is filtered out; returning `EMPTY` instead would prevent the outer
   * `forkJoin` from producing statuses. All mutable accumulation is allocated inside `defer`.
   */
  protected _fetchRequiredAccessRoleClaimableAssignments(
    accountIdentifier: string,
    accessRoleNames: ReadonlySet<string>,
  ): Observable<Map<string, RequiredAccessRoleClaimableAssignment[]>> {
    // Defer the reducer seed so repeated subscriptions never share mutable index state.
    return defer(() =>
      // Flatten assignments and mappings before indexing only activatable, requested assignments.
      listAccountClaimableRoleAssignments(
        'v1',
        this.httpClient,
        'json$',
      )({
        accountIdentifier,
        expand: 'accessRoleMappings',
      }).pipe(
        // Validate completeness before emitting any assignment into the index.
        tap((page) => {
          // This endpoint has no paging inputs, so incomplete results must fail the whole lookup.
          if (page.nextPage) {
            throw new RolesError(
              'Roles V2 returned incomplete data while resolving required access roles.',
            );
          }
        }),
        // Flatten the response array without changing assignment order.
        concatMap((page) => page.value ?? []),
        // Narrow the identifier as well as filtering: assignments without IDs cannot be activated.
        filter(
          (assignment): assignment is typeof assignment & { id: string } =>
            typeof assignment.id === 'string' && assignment.id.length > 0,
        ),
        // Finish each assignment's mappings before processing the next assignment.
        concatMap((assignment) =>
          // Keep assignment metadata attached while expanding its individual access-role mappings.
          from(assignment.claimableRole?.accessRoleMappings ?? []).pipe(
            map((mapping) => ({
              assignmentId: assignment.id,
              claimableRole: assignment.claimableRole,
              accessRoleName: mapping.accessRole?.name,
            })),
          ),
        ),
        // Bound retained data to requested names; unrelated mappings must not grow the index.
        filter(
          (mapping): mapping is typeof mapping & { accessRoleName: string } =>
            typeof mapping.accessRoleName === 'string' &&
            accessRoleNames.has(mapping.accessRoleName),
        ),
        // Apply display fallbacks once, after both the assignment ID and access-role name are valid.
        map(({ assignmentId, claimableRole, accessRoleName }) => ({
          accessRoleName,
          claimableAssignment: {
            assignmentId,
            name: claimableRole?.name ?? claimableRole?.displayName ?? accessRoleName,
            displayName: claimableRole?.displayName ?? claimableRole?.name ?? accessRoleName,
            description: claimableRole?.description,
          },
        })),
        // Emit only the final index, including an empty map when no usable assignment remains.
        reduce((claimableAssignmentsByAccessRole, { accessRoleName, claimableAssignment }) => {
          const claimableAssignments = claimableAssignmentsByAccessRole.get(accessRoleName) ?? [];
          claimableAssignments.push(claimableAssignment);
          claimableAssignmentsByAccessRole.set(accessRoleName, claimableAssignments);
          return claimableAssignmentsByAccessRole;
        }, new Map<string, RequiredAccessRoleClaimableAssignment[]>()),
      ),
    );
  }

  /**
   * Pages the access-role registry until all requested names are found or the collection ends.
   *
   * @param accessRoleNames - Unique access-role names to retain.
   * @returns A single map of registered access roles, with pagination state isolated per subscription.
   * @throws {RolesError} When a continuation cannot advance through the collection.
   *
   * @remarks
   * `expand` requests the next page only after the current response establishes its offset.
   * Returning `EMPTY` ends expansion, not the whole result: `last` still observes the final
   * page and emits the completed index. Only explicitly requested access roles are retained.
   * Unlike the provider's public registry iterator, this lookup intentionally scans until
   * it can answer a finite set of requirements. Unsubscription stops further expansion.
   */
  protected _fetchRegisteredAccessRoles(
    accessRoleNames: readonly string[],
  ): Observable<Map<string, ApiExtendedAccessRoleV1>> {
    // Offsets and retained records belong to one subscription, never to the reusable observable.
    return defer(() => {
      const registeredAccessRoles = new Map<string, ApiExtendedAccessRoleV1>();
      let skip = 0;
      // Only this bounded lookup follows pages automatically; registry listing remains pull-based.
      return this.getAccessRoles({ top: 100, skip }).pipe(
        // Each response determines whether another page is necessary; no separate subscriptions.
        expand((page) => {
          const accessRoles = page.value ?? [];
          // Retain only requested access roles while preserving their API descriptions.
          for (const accessRole of accessRoles) {
            // Records without names cannot satisfy an exact application requirement.
            if (accessRole.name && accessRoleNames.includes(accessRole.name)) {
              registeredAccessRoles.set(accessRole.name, accessRole);
            }
          }
          // An empty continuation would request the same offset indefinitely.
          if (page.nextPage && accessRoles.length === 0) {
            throw new RolesError(
              'Roles V2 returned an invalid continuation while resolving required access roles.',
            );
          }
          // Stop once the requested names are resolved, without collecting the full registry.
          if (!page.nextPage || registeredAccessRoles.size === accessRoleNames.length) {
            return EMPTY;
          }
          skip += accessRoles.length;
          return this.getAccessRoles({ top: 100, skip });
        }),
        // Do not expose intermediate indexes while later pages could still satisfy requirements.
        last(),
        // The last response is only a completion barrier; callers need the bounded access-role index.
        map(() => registeredAccessRoles),
      );
    });
  }

  /** {@inheritDoc IRolesClient.getAccessRoles} */
  public getAccessRoles(
    options: Pick<ListAccessRolesArg<'v1'>, 'top' | 'skip'> = {},
    signal?: AbortSignal,
  ): Observable<ListAccessRolesResponse<'v1'>> {
    // Bind and validate inside defer so synchronous failures use the observable error channel.
    // Emit one page only: the provider owns pagination demand and Promise conversion.
    return defer(() => {
      signal?.throwIfAborted();
      return listAccessRoles(
        'v1',
        this.httpClient,
        'json$',
      )({ top: options.top ?? 100, skip: options.skip ?? 0 }, { signal });
    });
  }

  /**
   * Invalidates account-scoped reads after a successful claimable-role-assignment mutation.
   *
   * Consolidated role assignments are outside activation and deactivation, so
   * `consolidatedRoleAssignmentsQuery` is deliberately not invalidated here; forcing it would
   * defeat its cache for state those mutations cannot change.
   */
  protected _invalidateReadCaches(): void {
    this.activeAccessRoleAssignmentsQuery.invalidate();
    this.consolidatedClaimableRoleAssignmentsQuery.invalidate();
    this.claimableRoleAssignmentForAccessRoleQuery.invalidate();
  }

  /** {@inheritDoc IRolesClient.dispose} */
  public dispose(): void {
    this.activeAccessRoleAssignmentsQuery.complete();
    this.consolidatedClaimableRoleAssignmentsQuery.complete();
    this.consolidatedRoleAssignmentsQuery.complete();
    this.claimableRoleAssignmentForAccessRoleQuery.complete();
  }

  /**
   * Resolves and validates the account identifier for the current operation.
   *
   * @returns Current non-empty Fusion account identifier.
   * @throws {Error} When the client is not initialized or the resolver returns an empty identifier.
   */
  protected async _getCurrentAccountIdentifier(): Promise<string> {
    const accountIdentifier = await this.accountResolver();
    // Empty identifiers would produce an account collection request instead of an account request.
    if (!accountIdentifier.trim()) {
      throw new RolesError('Roles client account resolver returned an empty account identifier.');
    }
    return accountIdentifier;
  }

  /**
   * Loads expanded claimable-role mappings to evaluate one access role.
   *
   * @param args - Current account identifier and exact access-role name to evaluate.
   * @returns True when a claimable role assignment grants the access role when activated.
   * @throws {Error} When the service returns an unfollowable continuation.
   */
  protected _fetchHasClaimableRoleAssignmentForAccessRole({
    accountIdentifier,
    accessRoleName,
  }: ClaimableRoleAssignmentForAccessRoleQueryArgs): Observable<boolean> {
    // Defer transport so synchronous request validation also reaches the error channel.
    return defer(() =>
      listAccountClaimableRoleAssignments(
        'v1',
        this.httpClient,
        'json$',
      )({
        accountIdentifier,
        expand: 'accessRoleMappings',
      }),
    ).pipe(
      // Produce one definitive boolean, or fail rather than treating incomplete data as denial.
      map((assignments) => {
        // Stop after the first claimable role assignment that can grant the requested access role.
        const hasClaimableRoleAssignment = (assignments.value ?? []).some((assignment) =>
          // Expanded mappings are the authoritative relationship between these roles.
          assignment.claimableRole?.accessRoleMappings?.some(
            (mapping) => mapping.accessRole?.name === accessRoleName,
          ),
        );
        // A positive match is conclusive even when the service advertises another page.
        if (hasClaimableRoleAssignment) {
          return true;
        }
        // The endpoint exposes no skip/top inputs, so a continuation cannot be followed safely.
        if (assignments.nextPage) {
          throw new RolesError(
            'Roles V2 returned incomplete claimable role assignments while checking activation eligibility.',
          );
        }
        return false;
      }),
    );
  }
}
