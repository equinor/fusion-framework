import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { Query } from '@equinor/fusion-query';
import {
  activateClaimableRoleAssignment,
  deactivateClaimableRoleAssignment,
  listAccessRoles,
  listAccountActiveAccessRoleAssignments,
  listAccountClaimableRoleAssignments,
  listAccountConsolidatedClaimableRoleAssignments,
  type ApiAccountActiveAccessRoleAssignmentV1,
  type ApiClaimableRoleAssignmentActivationV1,
  type ApiConsolidatedClaimableRoleAssignmentV1,
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
import type { RequiredRoleClaim, RequiredRoleStatus } from './RequiredRoleStatus.js';

const ROLES_CACHE_EXPIRY_MS = 60_000;

/**
 * Input required to claim a claimable role assignment.
 */
export interface ClaimRoleInput {
  /** Claimable role assignment identifier. */
  roleId: string;
  /** Reason recorded for claiming the role. */
  reason?: string;
  /** Requested activation duration in hours. */
  hours?: number | string;
}

/**
 * Input required to deactivate an active claimable role assignment.
 */
export interface DeactivateRoleInput {
  /** Claimable assignment identifier whose current activation should end. */
  roleId: string;
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

interface ClaimableAccessRoleQueryArgs {
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
   * Gets the account's currently active access roles.
   *
   * @returns Active access-role assignments for the scoped account.
   */
  getActiveRoles(options?: RolesReadOptions): Observable<ApiAccountActiveAccessRoleAssignmentV1[]>;

  /**
   * Gets the roles the account is eligible to claim.
   *
   * @returns Consolidated claimable-role assignments for the scoped account.
   */
  getClaimableRoles(
    options?: RolesReadOptions,
  ): Observable<ApiConsolidatedClaimableRoleAssignmentV1[]>;

  /**
   * Claims a role for the scoped account.
   *
   * @param input - Claimable assignment identifier, reason, and requested duration.
   * @returns Activation metadata returned by Roles V2.
   */
  claimRole(input: ClaimRoleInput): Observable<ApiClaimableRoleAssignmentActivationV1>;

  /**
   * Ends the current activation for a claimable role assignment.
   *
   * @param input - Claimable assignment identifier to deactivate.
   * @returns Updated activation metadata returned by Roles V2.
   */
  deactivateRole(input: DeactivateRoleInput): Observable<ApiClaimableRoleAssignmentActivationV1>;

  /**
   * Checks whether any claimable role grants an access role when activated.
   *
   * @param accessRoleName - Exact access-role name to find in expanded mappings.
   * @returns True when the account can claim a role that grants the access role.
   */
  canClaimAccessRole(accessRoleName: string): Observable<boolean>;

  /**
   * Resolves whether required access roles exist and whether the account can claim them.
   *
   * @param roleNames - Exact access-role names required by an application.
   * @returns Statuses in the same order as the unique requested role names.
   */
  getRequiredRoleStatuses(roleNames: readonly string[]): Observable<RequiredRoleStatus[]>;

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
 * Required-role lookup joins two finite pipelines: a bounded registry scan and an ordered
 * claim index. Both must emit even for empty data so `forkJoin` can emit a complete result.
 * Service errors remain errors, never empty success values. The provider alone converts
 * observables into Promises or consumer-driven async iteration.
 */
export class RolesClient implements IRolesClient {
  /** Account-isolated cache for active access-role assignments. */
  protected readonly activeRolesQuery: Query<ApiAccountActiveAccessRoleAssignmentV1[], string>;
  /** Account-isolated cache for consolidated claimable-role assignments. */
  protected readonly claimableRolesQuery: Query<ApiConsolidatedClaimableRoleAssignmentV1[], string>;
  /** Account and access-role isolated cache for claim eligibility. */
  protected readonly claimableAccessRoleQuery: Query<boolean, ClaimableAccessRoleQueryArgs>;

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
    this.activeRolesQuery = new Query({
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
    this.claimableRolesQuery = new Query({
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
      // Account-scoped keys preserve independent claimable-role caches across account changes.
      key: (accountIdentifier) => accountIdentifier,
      expire: ROLES_CACHE_EXPIRY_MS,
    });
    this.claimableAccessRoleQuery = new Query({
      client: {
        fn: (args) => this._fetchCanClaimAccessRole(args),
      },
      // Both values define claim eligibility and must participate in cache identity.
      key: ({ accountIdentifier, accessRoleName }) =>
        JSON.stringify([accountIdentifier, accessRoleName]),
      expire: ROLES_CACHE_EXPIRY_MS,
    });
  }

  /** {@inheritDoc IRolesClient.initialize} */
  public initialize(options: RolesClientInitializeOptions): void {
    this.accountResolver = options.resolveCurrentAccountIdentifier;
  }

  /** {@inheritDoc IRolesClient.getActiveRoles} */
  public getActiveRoles(
    options: RolesReadOptions = {},
  ): Observable<ApiAccountActiveAccessRoleAssignmentV1[]> {
    // Resolve the selected account and invalidate caches only when the read is subscribed.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      // The resolver emits once; switchMap transfers subscription ownership to the cached read.
      switchMap((accountIdentifier) => {
        // User-visible refreshes must bypass the minute-long query cache.
        if (options.refresh) {
          this.activeRolesQuery.invalidate();
        }
        // Unwrap Query's result envelope without introducing a second cache or subscription.
        return Query.extractQueryValue(this.activeRolesQuery.query(accountIdentifier));
      }),
    );
  }

  /** {@inheritDoc IRolesClient.getClaimableRoles} */
  public getClaimableRoles(
    options: RolesReadOptions = {},
  ): Observable<ApiConsolidatedClaimableRoleAssignmentV1[]> {
    // Resolve the selected account and invalidate caches only when the read is subscribed.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      // One account resolution selects one account-isolated collection read.
      switchMap((accountIdentifier) => {
        // User-visible refreshes must bypass the minute-long query cache.
        if (options.refresh) {
          this.claimableRolesQuery.invalidate();
        }
        // Keep cache lifecycle and concurrent-read coordination inside Query.
        return Query.extractQueryValue(this.claimableRolesQuery.query(accountIdentifier));
      }),
    );
  }

  /** {@inheritDoc IRolesClient.claimRole} */
  public claimRole(input: ClaimRoleInput): Observable<ApiClaimableRoleAssignmentActivationV1> {
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
          claimableRoleAssignmentId: input.roleId,
          reason: input.reason,
          hours: input.hours,
        }),
      ),
      // Invalidate before forwarding the successful activation; error emissions never enter tap.
      tap(() => this._invalidateReadCaches()),
    );
  }

  /** {@inheritDoc IRolesClient.deactivateRole} */
  public deactivateRole(
    input: DeactivateRoleInput,
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
          claimableRoleAssignmentId: input.roleId,
        }),
      ),
      // Preserve the response unchanged while making subsequent reads observe the mutation.
      tap(() => this._invalidateReadCaches()),
    );
  }

  /** {@inheritDoc IRolesClient.canClaimAccessRole} */
  public canClaimAccessRole(accessRoleName: string): Observable<boolean> {
    // Each subscription uses the current account's isolated eligibility cache.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      // The account/name cache key prevents eligibility results leaking between requests.
      switchMap((accountIdentifier) =>
        Query.extractQueryValue(
          this.claimableAccessRoleQuery.query({ accountIdentifier, accessRoleName }),
        ),
      ),
    );
  }

  /** {@inheritDoc IRolesClient.getRequiredRoleStatuses} */
  public getRequiredRoleStatuses(roleNames: readonly string[]): Observable<RequiredRoleStatus[]> {
    const uniqueRoleNames = [...new Set(roleNames)];
    // No collections are needed when no access roles are required.
    if (uniqueRoleNames.length === 0) {
      return of([]);
    }
    // Resolve the account lazily, then subscribe to both finite lookups under one error boundary.
    return defer(() => this._getCurrentAccountIdentifier()).pipe(
      switchMap((accountIdentifier) =>
        // Both branches must emit once and complete; an error unsubscribes the sibling immediately.
        forkJoin({
          registeredRolesByName: this._fetchRegisteredRoles(uniqueRoleNames),
          claimsByAccessRole: this._fetchRequiredRoleClaims(
            accountIdentifier,
            new Set(uniqueRoleNames),
          ),
        }),
      ),
      // Combine only complete indexes: partial registry/claim results cannot describe recovery safely.
      map(({ registeredRolesByName, claimsByAccessRole }) => {
        // Preserve configuration order so recovery UI matches the application requirement.
        return uniqueRoleNames.map((name) => ({
          name,
          description: registeredRolesByName.get(name)?.description,
          exists: registeredRolesByName.has(name),
          claims: claimsByAccessRole.get(name) ?? [],
        }));
      }),
    );
  }

  /**
   * Resolves claimable assignments into a bounded index of claims for the requested access roles.
   *
   * @param accountIdentifier - Authenticated account whose assignments are inspected.
   * @param roleNames - Required access-role names to retain.
   * @returns One claim index per subscription, preserving assignment and mapping order.
   * @throws {RolesError} When the service returns an unfollowable continuation.
   *
   * @remarks
   * Page -> assignments -> mappings -> named claims -> one index. `concatMap` preserves API
   * order while flattening finite arrays. The seeded `reduce` emits an empty map when every
   * record is filtered out; returning `EMPTY` instead would prevent the outer `forkJoin`
   * from producing statuses. All mutable accumulation is allocated inside `defer`.
   */
  protected _fetchRequiredRoleClaims(
    accountIdentifier: string,
    roleNames: ReadonlySet<string>,
  ): Observable<Map<string, RequiredRoleClaim[]>> {
    // Defer the reducer seed so repeated subscriptions never share mutable claim state.
    return defer(() =>
      // Flatten assignments and mappings before indexing only activatable, requested claims.
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
        // Narrow the identifier as well as filtering: claims without IDs cannot be activated.
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
              role: assignment.claimableRole,
              accessRoleName: mapping.accessRole?.name,
            })),
          ),
        ),
        // Bound retained data to requested names; unrelated mappings must not grow the index.
        filter(
          (mapping): mapping is typeof mapping & { accessRoleName: string } =>
            typeof mapping.accessRoleName === 'string' && roleNames.has(mapping.accessRoleName),
        ),
        // Apply display fallbacks once, after both the assignment ID and access-role name are valid.
        map(({ assignmentId, role, accessRoleName }) => ({
          accessRoleName,
          claim: {
            assignmentId,
            name: role?.name ?? role?.displayName ?? accessRoleName,
            displayName: role?.displayName ?? role?.name ?? accessRoleName,
            description: role?.description,
          },
        })),
        // Emit only the final index, including an empty map when there are no usable claims.
        reduce((claimsByRole, { accessRoleName, claim }) => {
          const claims = claimsByRole.get(accessRoleName) ?? [];
          claims.push(claim);
          claimsByRole.set(accessRoleName, claims);
          return claimsByRole;
        }, new Map<string, RequiredRoleClaim[]>()),
      ),
    );
  }

  /**
   * Pages the access-role registry until all requested names are found or the collection ends.
   *
   * @param roleNames - Unique access-role names to retain.
   * @returns A single map of registered roles, with pagination state isolated per subscription.
   * @throws {RolesError} When a continuation cannot advance through the collection.
   *
   * @remarks
   * `expand` requests the next page only after the current response establishes its offset.
   * Returning `EMPTY` ends expansion, not the whole result: `last` still observes the final
   * page and emits the completed index. Only explicitly requested roles are retained.
   * Unlike the provider's public registry iterator, this lookup intentionally scans until
   * it can answer a finite set of requirements. Unsubscription stops further expansion.
   */
  protected _fetchRegisteredRoles(
    roleNames: readonly string[],
  ): Observable<Map<string, ApiExtendedAccessRoleV1>> {
    // Offsets and retained records belong to one subscription, never to the reusable observable.
    return defer(() => {
      const registeredRoles = new Map<string, ApiExtendedAccessRoleV1>();
      let skip = 0;
      // Only this bounded lookup follows pages automatically; registry listing remains pull-based.
      return this.getAccessRoles({ top: 100, skip }).pipe(
        // Each response determines whether another page is necessary; no separate subscriptions.
        expand((page) => {
          const roles = page.value ?? [];
          // Retain only requested roles while preserving their API descriptions.
          for (const role of roles) {
            // Records without names cannot satisfy an exact application requirement.
            if (role.name && roleNames.includes(role.name)) {
              registeredRoles.set(role.name, role);
            }
          }
          // An empty continuation would request the same offset indefinitely.
          if (page.nextPage && roles.length === 0) {
            throw new RolesError(
              'Roles V2 returned an invalid continuation while resolving required access roles.',
            );
          }
          // Stop once the requested names are resolved, without collecting the full registry.
          if (!page.nextPage || registeredRoles.size === roleNames.length) {
            return EMPTY;
          }
          skip += roles.length;
          return this.getAccessRoles({ top: 100, skip });
        }),
        // Do not expose intermediate indexes while later pages could still satisfy requirements.
        last(),
        // The last response is only a completion barrier; callers need the bounded role index.
        map(() => registeredRoles),
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

  /** Invalidates all account-scoped reads after a successful role mutation. */
  protected _invalidateReadCaches(): void {
    this.activeRolesQuery.invalidate();
    this.claimableRolesQuery.invalidate();
    this.claimableAccessRoleQuery.invalidate();
  }

  /** {@inheritDoc IRolesClient.dispose} */
  public dispose(): void {
    this.activeRolesQuery.complete();
    this.claimableRolesQuery.complete();
    this.claimableAccessRoleQuery.complete();
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
   * @returns True when the account can claim a role that grants the access role.
   * @throws {Error} When the service returns an unfollowable continuation.
   */
  protected _fetchCanClaimAccessRole({
    accountIdentifier,
    accessRoleName,
  }: ClaimableAccessRoleQueryArgs): Observable<boolean> {
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
        // Stop after the first claimable role that can grant the requested access role.
        const canClaim = (assignments.value ?? []).some((assignment) =>
          // Expanded mappings are the authoritative relationship between these roles.
          assignment.claimableRole?.accessRoleMappings?.some(
            (mapping) => mapping.accessRole?.name === accessRoleName,
          ),
        );
        // A positive match is conclusive even when the service advertises another page.
        if (canClaim) {
          return true;
        }
        // The endpoint exposes no skip/top inputs, so a continuation cannot be followed safely.
        if (assignments.nextPage) {
          throw new RolesError(
            'Roles V2 returned incomplete claimable role assignments while checking claim eligibility.',
          );
        }
        return false;
      }),
    );
  }
}
