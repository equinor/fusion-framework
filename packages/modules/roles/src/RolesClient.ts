import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { Query } from '@equinor/fusion-query';
import {
  activateClaimableRoleAssignment,
  listAccountActiveAccessRoleAssignments,
  listAccountClaimableRoleAssignments,
  listAccountConsolidatedClaimableRoleAssignments,
  type ApiAccountActiveAccessRoleAssignmentV1,
  type ApiClaimableRoleAssignmentActivationV1,
  type ApiConsolidatedClaimableRoleAssignmentV1,
} from '@equinor/fusion-services/roles';
import { lastValueFrom } from 'rxjs';

import { RolesError } from './errors/RolesError.js';

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
  getActiveRoles(): Promise<ApiAccountActiveAccessRoleAssignmentV1[]>;

  /**
   * Gets the roles the account is eligible to claim.
   *
   * @returns Consolidated claimable-role assignments for the scoped account.
   */
  getClaimableRoles(): Promise<ApiConsolidatedClaimableRoleAssignmentV1[]>;

  /**
   * Claims a role for the scoped account.
   *
   * @param input - Claimable assignment identifier, reason, and requested duration.
   * @returns Activation metadata returned by Roles V2.
   */
  claimRole(input: ClaimRoleInput): Promise<ApiClaimableRoleAssignmentActivationV1>;

  /**
   * Checks whether any claimable role grants an access role when activated.
   *
   * @param accessRoleName - Exact access-role name to find in expanded mappings.
   * @returns True when the account can claim a role that grants the access role.
   */
  canClaimAccessRole(accessRoleName: string): Promise<boolean>;

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
  public async getActiveRoles(): Promise<ApiAccountActiveAccessRoleAssignmentV1[]> {
    const accountIdentifier = await this._getCurrentAccountIdentifier();
    return lastValueFrom(Query.extractQueryValue(this.activeRolesQuery.query(accountIdentifier)));
  }

  /** {@inheritDoc IRolesClient.getClaimableRoles} */
  public async getClaimableRoles(): Promise<ApiConsolidatedClaimableRoleAssignmentV1[]> {
    const accountIdentifier = await this._getCurrentAccountIdentifier();
    return lastValueFrom(
      Query.extractQueryValue(this.claimableRolesQuery.query(accountIdentifier)),
    );
  }

  /** {@inheritDoc IRolesClient.claimRole} */
  public async claimRole(input: ClaimRoleInput): Promise<ApiClaimableRoleAssignmentActivationV1> {
    const accountIdentifier = await this._getCurrentAccountIdentifier();
    const activation = await activateClaimableRoleAssignment(
      'v1',
      this.httpClient,
    )({
      accountIdentifier,
      claimableRoleAssignmentId: input.roleId,
      reason: input.reason,
      hours: input.hours,
    });
    this.activeRolesQuery.invalidate();
    this.claimableRolesQuery.invalidate();
    this.claimableAccessRoleQuery.invalidate();
    return activation;
  }

  /** {@inheritDoc IRolesClient.canClaimAccessRole} */
  public async canClaimAccessRole(accessRoleName: string): Promise<boolean> {
    const accountIdentifier = await this._getCurrentAccountIdentifier();
    return lastValueFrom(
      Query.extractQueryValue(
        this.claimableAccessRoleQuery.query({ accountIdentifier, accessRoleName }),
      ),
    );
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
  protected async _fetchCanClaimAccessRole({
    accountIdentifier,
    accessRoleName,
  }: ClaimableAccessRoleQueryArgs): Promise<boolean> {
    const assignments = await listAccountClaimableRoleAssignments(
      'v1',
      this.httpClient,
    )({
      accountIdentifier,
      expand: 'accessRoleMappings',
    });
    // Stop after the first claimable role that can grant the requested access role.
    const canClaim = (assignments.value ?? []).some((assignment) => {
      // Expanded mappings are the authoritative relationship between claimable and access roles.
      return assignment.claimableRole?.accessRoleMappings?.some(
        (mapping) => mapping.accessRole?.name === accessRoleName,
      );
    });
    // A positive match is conclusive even if the service unexpectedly advertises another page.
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
  }
}
