import type {
  ApiAccountActiveAccessRoleAssignmentV1,
  ApiClaimableRoleAssignmentActivationV1,
  ApiConsolidatedClaimableRoleAssignmentV1,
  ApiConsolidatedRoleAssignmentV1,
} from '@equinor/fusion-services/roles';
import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { defer, type Observable, of } from 'rxjs';

import type {
  ActivateClaimableRoleAssignmentInput,
  DeactivateClaimableRoleAssignmentInput,
  IRolesClient,
  RolesAccountResolver,
} from '../RolesClient.js';
import { RolesModuleConfigurator } from '../RolesModuleConfigurator.js';

/**
 * Static data returned by the default client installed by {@link RolesMockConfigurator}.
 */
export interface RolesMockData {
  /** Active access-role assignments returned by the provider. */
  activeAccessRoleAssignments?: readonly ApiAccountActiveAccessRoleAssignmentV1[];
  /** Consolidated claimable-role assignments returned by the provider. */
  consolidatedClaimableRoleAssignments?: readonly ApiConsolidatedClaimableRoleAssignmentV1[];
  /** Consolidated role assignments returned by the provider. */
  consolidatedRoleAssignments?: readonly ApiConsolidatedRoleAssignmentV1[];
}

/**
 * Roles configurator backed by static role-assignment data for framework and application tests.
 *
 * @remarks
 * The mock changes only the module's client dependency. Tests still receive and interact with the
 * production `RolesProvider`, where Vitest or Jest spies can override individual provider methods.
 * Use the inherited `setClient` when a test needs complete client lifecycle or transport control.
 */
export class RolesMockConfigurator extends RolesModuleConfigurator {
  private data: RolesMockData = {};

  /**
   * Replaces active access-role assignments while preserving other configured data.
   *
   * @param activeAccessRoleAssignments - Active access-role assignments exposed through the provider.
   * @returns This configurator for chaining.
   */
  public setActiveAccessRoleAssignments(
    activeAccessRoleAssignments: readonly ApiAccountActiveAccessRoleAssignmentV1[],
  ): this {
    this.data = { ...this.data, activeAccessRoleAssignments };
    return this;
  }

  /**
   * Replaces consolidated claimable-role assignments while preserving other configured data.
   *
   * @param consolidatedClaimableRoleAssignments - Consolidated claimable-role assignments exposed
   * through the provider.
   * @returns This configurator for chaining.
   */
  public setConsolidatedClaimableRoleAssignments(
    consolidatedClaimableRoleAssignments: readonly ApiConsolidatedClaimableRoleAssignmentV1[],
  ): this {
    this.data = { ...this.data, consolidatedClaimableRoleAssignments };
    return this;
  }

  /**
   * Replaces consolidated role assignments while preserving other configured data.
   *
   * @param consolidatedRoleAssignments - Consolidated role assignments exposed through the provider.
   * @returns This configurator for chaining.
   */
  public setConsolidatedRoleAssignments(
    consolidatedRoleAssignments: readonly ApiConsolidatedRoleAssignmentV1[],
  ): this {
    this.data = { ...this.data, consolidatedRoleAssignments };
    return this;
  }

  /**
   * Replaces the static data returned by the mock's default client.
   *
   * @param data - Active-access, consolidated-claimable, and consolidated role assignments exposed
   * through the provider.
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
    const activeAccessRoleAssignments = [...(this.data.activeAccessRoleAssignments ?? [])];
    const consolidatedClaimableRoleAssignments = [
      ...(this.data.consolidatedClaimableRoleAssignments ?? []),
    ];
    const consolidatedRoleAssignments = [...(this.data.consolidatedRoleAssignments ?? [])];
    return {
      initialize: () => undefined,
      getActiveAccessRoleAssignments: () => defer(() => of([...activeAccessRoleAssignments])),
      getConsolidatedClaimableRoleAssignments: () =>
        defer(() => of([...consolidatedClaimableRoleAssignments])),
      getConsolidatedRoleAssignments: () => defer(() => of([...consolidatedRoleAssignments])),
      activateClaimableRoleAssignment: (
        input: ActivateClaimableRoleAssignmentInput,
      ): Observable<ApiClaimableRoleAssignmentActivationV1> =>
        defer(() => of({ id: input.assignmentId, reason: input.reason })),
      deactivateClaimableRoleAssignment: (
        input: DeactivateClaimableRoleAssignmentInput,
      ): Observable<ApiClaimableRoleAssignmentActivationV1> =>
        defer(() => of({ id: input.assignmentId, activeToDate: new Date().toISOString() })),
      hasClaimableRoleAssignmentForAccessRole: () => of(false),
      // Static mocks have no registry, so emit one final service page.
      getAccessRoles: () => of({ totalCount: 0, value: [] }),
      getRequiredAccessRoleStatuses: (accessRoleNames) =>
        // Static mock data has no global access-role registry, so required access roles are unregistered.
        of(accessRoleNames.map((name) => ({ name, exists: false, claimableAssignments: [] }))),
    };
  }
}
