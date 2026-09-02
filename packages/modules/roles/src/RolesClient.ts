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
 * Typed client contract for executing functions from `@equinor/fusion-services/roles`.
 */
export interface IRolesClient {
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
 * Executes typed Roles V2 endpoint functions through one authenticated framework HTTP client.
 */
export class RolesClient implements IRolesClient {
  private readonly activeRolesQuery: Query<ApiAccountActiveAccessRoleAssignmentV1[], void>;
  private readonly claimableRolesQuery: Query<ApiConsolidatedClaimableRoleAssignmentV1[], void>;
  private readonly claimableAccessRoleQuery: Query<boolean, string>;

  /**
   * Creates an account-scoped Roles V2 client.
   *
   * @param httpClient - Service-discovery-backed framework HTTP client.
   * @param accountIdentifier - Fusion account identifier used by all client operations.
   */
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly accountIdentifier: string,
  ) {
    this.activeRolesQuery = new Query({
      client: {
        fn: () =>
          listAccountActiveAccessRoleAssignments(
            'v1',
            this.httpClient,
          )({
            accountIdentifier: this.accountIdentifier,
          }),
      },
      key: () => 'active-roles',
      expire: ROLES_CACHE_EXPIRY_MS,
    });
    this.claimableRolesQuery = new Query({
      client: {
        fn: () =>
          listAccountConsolidatedClaimableRoleAssignments(
            'v1',
            this.httpClient,
          )({
            accountIdentifier: this.accountIdentifier,
          }),
      },
      key: () => 'claimable-roles',
      expire: ROLES_CACHE_EXPIRY_MS,
    });
    this.claimableAccessRoleQuery = new Query({
      client: {
        fn: (accessRoleName) => this.fetchCanClaimAccessRole(accessRoleName),
      },
      key: (accessRoleName) => accessRoleName,
      expire: ROLES_CACHE_EXPIRY_MS,
    });
  }

  /** {@inheritDoc IRolesClient.getActiveRoles} */
  public getActiveRoles(): Promise<ApiAccountActiveAccessRoleAssignmentV1[]> {
    return lastValueFrom(Query.extractQueryValue(this.activeRolesQuery.query()));
  }

  /** {@inheritDoc IRolesClient.getClaimableRoles} */
  public getClaimableRoles(): Promise<ApiConsolidatedClaimableRoleAssignmentV1[]> {
    return lastValueFrom(Query.extractQueryValue(this.claimableRolesQuery.query()));
  }

  /** {@inheritDoc IRolesClient.claimRole} */
  public async claimRole(input: ClaimRoleInput): Promise<ApiClaimableRoleAssignmentActivationV1> {
    const activation = await activateClaimableRoleAssignment(
      'v1',
      this.httpClient,
    )({
      accountIdentifier: this.accountIdentifier,
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
  public canClaimAccessRole(accessRoleName: string): Promise<boolean> {
    return lastValueFrom(
      Query.extractQueryValue(this.claimableAccessRoleQuery.query(accessRoleName)),
    );
  }

  /** {@inheritDoc IRolesClient.dispose} */
  public dispose(): void {
    this.activeRolesQuery.complete();
    this.claimableRolesQuery.complete();
    this.claimableAccessRoleQuery.complete();
  }

  /**
   * Loads expanded claimable-role mappings to evaluate one access role.
   *
   * @param accessRoleName - Exact access-role name to find in expanded mappings.
   * @returns True when the account can claim a role that grants the access role.
   * @throws {Error} When the service returns an unfollowable continuation.
   */
  private async fetchCanClaimAccessRole(accessRoleName: string): Promise<boolean> {
    const assignments = await listAccountClaimableRoleAssignments(
      'v1',
      this.httpClient,
    )({
      accountIdentifier: this.accountIdentifier,
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
      throw new Error(
        'Roles V2 returned incomplete claimable role assignments while checking claim eligibility.',
      );
    }
    return false;
  }
}
