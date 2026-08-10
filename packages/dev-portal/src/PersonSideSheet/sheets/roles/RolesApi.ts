/** Role metadata returned by the Roles V2 consolidated assignment endpoints. */
export interface RoleDefinition {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
}

/** Scope metadata attached to a permanent role assignment. */
export interface RoleScope {
  readonly isGlobal: boolean;
  readonly value: string | null;
}

/** Claimable role assignment state used by the activation controls. */
export interface ClaimableRoleAssignment {
  readonly id: string;
  readonly claimableRole: RoleDefinition;
  readonly isActive: boolean;
  readonly activeTo: string | null;
  readonly validFrom?: string | null;
  readonly validTo?: string | null;
}

/** Permanent role assignment displayed as a read-only entitlement. */
export interface PermanentRoleAssignment {
  readonly id: string;
  readonly role: RoleDefinition;
  readonly scope?: RoleScope | null;
  readonly validFrom?: string | null;
  readonly validTo?: string | null;
}

/** Minimal HTTP client contract required by the Roles V2 API. */
export interface RolesClient {
  json(path: string, init?: RequestInit): Promise<unknown>;
}

interface ActivationResult {
  readonly activeToDate: string;
}

/**
 * Provides the Roles V2 requests used by the dev portal person side sheet.
 *
 * @example
 * ```ts
 * const api = new RolesApi(await serviceDiscovery.createClient('rolesv2'), accountId);
 * const roles = await api.getClaimableRoles();
 * ```
 */
export class RolesApi {
  #client: RolesClient;
  #accountId: string;

  /**
   * Creates a Roles V2 API client scoped to one Fusion account.
   * @param client - Service discovery HTTP client for the `rolesv2` service.
   * @param accountId - Local Fusion account identifier for the signed-in user.
   */
  constructor(client: RolesClient, accountId: string) {
    this.#client = client;
    this.#accountId = accountId;
  }

  /**
   * Fetches consolidated claimable role assignments.
   * @returns Claimable assignments for the scoped Fusion account.
   */
  async getClaimableRoles(): Promise<ClaimableRoleAssignment[]> {
    return (await this.#client.json(
      `/accounts/${this.#accountId}/consolidated-claimable-role-assignments`,
    )) as ClaimableRoleAssignment[];
  }

  /**
   * Fetches consolidated permanent role assignments.
   * @returns Permanent assignments for the scoped Fusion account.
   */
  async getPermanentRoles(): Promise<PermanentRoleAssignment[]> {
    return (await this.#client.json(
      `/accounts/${this.#accountId}/consolidated-role-assignments`,
    )) as PermanentRoleAssignment[];
  }

  /**
   * Activates a claimable role for a bounded duration.
   * @param roleId - Claimable assignment identifier.
   * @param reason - User-provided reason for privilege elevation.
   * @param hours - Requested activation duration in hours.
   * @returns Activation metadata containing the server-calculated expiry.
   */
  async activateRole(roleId: string, reason: string, hours: number): Promise<ActivationResult> {
    return (await this.#client.json(
      `/accounts/${this.#accountId}/claimable-role-assignments/${roleId}/activate`,
      {
        method: 'POST',
        body: JSON.stringify({ reason, hours }),
      },
    )) as ActivationResult;
  }

  /**
   * Deactivates an active claimable role.
   * @param roleId - Claimable assignment identifier.
   */
  async deactivateRole(roleId: string): Promise<void> {
    await this.#client.json(
      `/accounts/${this.#accountId}/claimable-role-assignments/${roleId}/deactivate`,
      { method: 'POST' },
    );
  }
}
