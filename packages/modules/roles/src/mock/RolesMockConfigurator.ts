import type {
  ApiAccountActiveAccessRoleAssignmentV1,
  ApiClaimableRoleAssignmentActivationV1,
  ApiConsolidatedClaimableRoleAssignmentV1,
} from '@equinor/fusion-services/roles';
import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { defer, type Observable, of } from 'rxjs';

import type {
  ClaimRoleInput,
  DeactivateRoleInput,
  IRolesClient,
  RolesAccountResolver,
} from '../RolesClient.js';
import { RolesModuleConfigurator } from '../RolesModuleConfigurator.js';

/**
 * Static data returned by the default client installed by {@link RolesMockConfigurator}.
 */
export interface RolesMockData {
  /** Active access-role assignments returned by the provider. */
  activeRoles?: readonly ApiAccountActiveAccessRoleAssignmentV1[];
  /** Consolidated claimable-role assignments returned by the provider. */
  claimableRoles?: readonly ApiConsolidatedClaimableRoleAssignmentV1[];
}

/**
 * Roles configurator backed by static role data for framework and application tests.
 *
 * @remarks
 * The mock changes only the module's client dependency. Tests still receive and interact with the
 * production `RolesProvider`, where Vitest or Jest spies can override individual provider methods.
 * Use the inherited `setClient` when a test needs complete client lifecycle or transport control.
 */
export class RolesMockConfigurator extends RolesModuleConfigurator {
  private data: RolesMockData = {};

  /**
   * Replaces active roles while preserving configured claimable roles.
   *
   * @param activeRoles - Active access-role assignments exposed through the provider.
   * @returns This configurator for chaining.
   */
  public setActiveRoles(activeRoles: readonly ApiAccountActiveAccessRoleAssignmentV1[]): this {
    this.data = { ...this.data, activeRoles };
    return this;
  }

  /**
   * Replaces claimable roles while preserving configured active roles.
   *
   * @param claimableRoles - Consolidated claimable-role assignments exposed through the provider.
   * @returns This configurator for chaining.
   */
  public setClaimableRoles(
    claimableRoles: readonly ApiConsolidatedClaimableRoleAssignmentV1[],
  ): this {
    this.data = { ...this.data, claimableRoles };
    return this;
  }

  /**
   * Replaces the static data returned by the mock's default client.
   *
   * @param data - Active and claimable role assignments exposed through the provider.
   * @returns This configurator for chaining.
   */
  public setData(data: RolesMockData): this {
    this.data = data;
    return this;
  }

  /**
   * Creates a static client instead of resolving the production client through service discovery.
   *
   * @param _args - Unused module context retained for the production extension contract.
   * @param _accountResolver - Unused account resolver because static data is account-independent.
   * @returns A client requiring no service discovery or authenticated account.
   */
  protected override async _createDefaultClient(
    _args: ConfigBuilderCallbackArgs,
    _accountResolver: RolesAccountResolver,
  ): Promise<IRolesClient> {
    const activeRoles = [...(this.data.activeRoles ?? [])];
    const claimableRoles = [...(this.data.claimableRoles ?? [])];
    return {
      initialize: () => undefined,
      getActiveRoles: () => defer(() => of([...activeRoles])),
      getClaimableRoles: () => defer(() => of([...claimableRoles])),
      claimRole: (input: ClaimRoleInput): Observable<ApiClaimableRoleAssignmentActivationV1> =>
        defer(() => of({ id: input.roleId, reason: input.reason })),
      deactivateRole: (
        input: DeactivateRoleInput,
      ): Observable<ApiClaimableRoleAssignmentActivationV1> =>
        defer(() => of({ id: input.roleId, activeToDate: new Date().toISOString() })),
      canClaimAccessRole: () => of(false),
      // Static mocks have no registry, so emit one final service page.
      getAccessRoles: () => of({ totalCount: 0, value: [] }),
      getRequiredRoleStatuses: (roleNames) =>
        // Static mock data has no global access-role registry, so missing roles are unregistered.
        of(roleNames.map((name) => ({ name, exists: false, claims: [] }))),
    };
  }
}
