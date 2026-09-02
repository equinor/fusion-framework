import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import {
  TelemetryLevel,
  TelemetryScope,
  type ITelemetryProvider,
} from '@equinor/fusion-framework-module-telemetry';
import type {
  ApiAccountActiveAccessRoleAssignmentV1,
  ApiClaimableRoleAssignmentActivationV1,
  ApiConsolidatedClaimableRoleAssignmentV1,
} from '@equinor/fusion-services/roles';

import type { ClaimRoleInput, IRolesClient } from './RolesClient.js';
import { RoleClaimEvent } from './RoleClaimEvent.js';
import type { RolesModuleConfig } from './types.js';
import { version } from './version.js';

/**
 * Stable Roles V2 provider operation names used for telemetry grouping.
 */
type RolesProviderOperation =
  | 'getActiveRoles'
  | 'getClaimableRoles'
  | 'claimRole'
  | 'canClaimAccessRole';

/**
 * Final provider configuration containing the client resolved during module setup.
 */
interface RolesProviderConfig extends RolesModuleConfig {
  client: IRolesClient;
}

/**
 * Event dispatch surface required by the Roles provider.
 */
interface RolesEventDispatcher {
  /**
   * Dispatches a role claim lifecycle event.
   *
   * @param event - Pre-claim event to dispatch.
   * @returns The dispatched event after listeners complete.
   */
  dispatchEvent(event: RoleClaimEvent): Promise<RoleClaimEvent>;
}

/**
 * Optional framework modules used for Roles provider observability.
 */
interface RolesProviderDependencies {
  event?: RolesEventDispatcher;
  telemetry?: Pick<ITelemetryProvider, 'trackEvent' | 'trackException'>;
}

/**
 * Consumer-facing API for reading and claiming Roles V2 assignments.
 *
 * The framework exposes this provider as `framework.modules.roles`. Account identifiers are
 * resolved by the module from authentication and are never supplied to provider operations.
 *
 * @remarks
 * Role names are exact, case-sensitive Roles V2 access-role names. This provider supports
 * role-aware user interfaces; trusted backends must still enforce authorization.
 */
export interface IRolesProvider {
  /**
   * Gets the authenticated account's currently active access roles.
   *
   * Use this operation to render active assignments or inspect assignment metadata. Use
   * {@link IRolesProvider.hasRole | hasRole} when only a boolean access-role check is needed.
   *
   * @returns Active access-role assignments for the account resolved by authentication.
   * @throws Roles V2 request and response-validation errors.
   */
  getActiveRoles(): Promise<ApiAccountActiveAccessRoleAssignmentV1[]>;

  /**
   * Gets the roles the authenticated account is eligible to claim.
   *
   * @returns Consolidated claimable-role assignments for rendering claimable-role choices.
   * @throws Roles V2 request and response-validation errors.
   */
  getClaimableRoles(): Promise<ApiConsolidatedClaimableRoleAssignmentV1[]>;

  /**
   * Claims a role for the authenticated account.
   *
   * When the event module is enabled, a cancelable `onRoles.claim` event is dispatched before
   * the activation request. A listener can call `preventDefault()` to deny the claim.
   *
   * @param input - Claimable assignment identifier, reason, and requested duration.
   * @returns Activation metadata returned by Roles V2.
   * @throws {Error} When a listener cancels the pre-claim event.
   * @throws Roles V2 request and response-validation errors.
   */
  claimRole(input: ClaimRoleInput): Promise<ApiClaimableRoleAssignmentActivationV1>;

  /**
   * Checks whether an access role is active for the authenticated account.
   *
   * Empty names return `false` without a request. Matching is exact and case-sensitive.
   *
   * @param role - Exact Roles V2 access-role name to match.
   * @returns True when the active account has an assignment with the requested role name.
   * @throws Roles V2 request and response-validation errors.
   */
  hasRole(role: string): Promise<boolean>;

  /**
   * Checks whether the authenticated account can claim a role that grants an access role.
   *
   * The check follows expanded `accessRoleMappings`; the input identifies an access role, not a
   * claimable-role assignment. Empty names return `false` without a request.
   *
   * @param accessRoleName - Exact Roles V2 access-role name to match in claimable mappings.
   * @returns True when a claimable role grants the requested access role.
   * @throws Roles V2 request and response-validation errors, including incomplete mapping results.
   */
  canClaimAccessRole(accessRoleName: string): Promise<boolean>;

  /**
   * Disposes provider and internal client cache resources.
   *
   * Framework lifecycle management calls this automatically; consumers normally do not call it.
   */
  dispose(): void;
}

/**
 * Default {@link IRolesProvider} implementation exposed by the Fusion Framework Roles module.
 *
 * `RolesProvider` is the main API applications consume through `framework.modules.roles`. It
 * delegates transport work to an initialized account-scoped client while handling claim
 * cancellation events, telemetry, and client resource disposal.
 *
 * @remarks
 * The built-in client caches active roles, claimable roles, and claim-eligibility reads for one
 * minute and invalidates them after successful activation. Configured clients control their own
 * caching behavior. When telemetry is enabled, operation outcomes are recorded without account or
 * role identifiers.
 *
 * This client-side provider helps render and gate user-interface behavior. It does not replace
 * authorization checks in trusted backend services.
 *
 * @example
 * ```ts
 * const { roles } = framework.modules;
 *
 * const [activeRoles, claimableRoles] = await Promise.all([
 *   roles.getActiveRoles(),
 *   roles.getClaimableRoles(),
 * ]);
 *
 * if (await roles.hasRole('Reports.Read')) {
 *   renderReports();
 * }
 *
 * if (await roles.canClaimAccessRole('Reports.Export')) {
 *   await roles.claimRole({
 *     roleId: claimableRoleId,
 *     reason: 'Export monthly report',
 *     hours: 2,
 *   });
 * }
 * ```
 */
export class RolesProvider extends BaseModuleProvider<RolesModuleConfig> implements IRolesProvider {
  private readonly client: IRolesClient;
  private readonly dependencies: RolesProviderDependencies;

  /**
   * Creates a Roles provider around a client finalized during configuration or module initialization.
   *
   * @param config - Resolved configuration containing the initialized client.
   * @param dependencies - Optional event and telemetry providers resolved by the module.
   */
  constructor(config: RolesProviderConfig, dependencies: RolesProviderDependencies = {}) {
    super({ version, config });
    this.client = config.client;
    this.dependencies = dependencies;
    this._addTeardown(() => this.client.dispose?.());
  }

  /** {@inheritDoc IRolesProvider.getActiveRoles} */
  public async getActiveRoles(): Promise<ApiAccountActiveAccessRoleAssignmentV1[]> {
    return this.executeOperation('getActiveRoles', () => this.client.getActiveRoles());
  }

  /** {@inheritDoc IRolesProvider.getClaimableRoles} */
  public async getClaimableRoles(): Promise<ApiConsolidatedClaimableRoleAssignmentV1[]> {
    return this.executeOperation('getClaimableRoles', () => this.client.getClaimableRoles());
  }

  /** {@inheritDoc IRolesProvider.claimRole} */
  public async claimRole(input: ClaimRoleInput): Promise<ApiClaimableRoleAssignmentActivationV1> {
    return this.executeOperation('claimRole', async () => {
      const claimEvent = await this.dependencies.event?.dispatchEvent(
        new RoleClaimEvent({
          source: this,
          detail: input,
        }),
      );
      // Cancellation prevents the irreversible activation request from reaching Roles V2.
      if (claimEvent?.canceled) {
        throw new Error('Role claim was canceled by an event listener.');
      }
      return this.client.claimRole(input);
    });
  }

  /** {@inheritDoc IRolesProvider.hasRole} */
  public async hasRole(role: string): Promise<boolean> {
    const normalizedRole = role.trim();
    // Empty role names cannot identify an access role and should not trigger a network request.
    if (!normalizedRole) {
      return false;
    }
    const activeRoles = await this.getActiveRoles();
    // Roles V2 access-role names are identifiers, so matching remains exact and case-sensitive.
    return activeRoles.some((assignment) => assignment.accessRoleName === normalizedRole);
  }

  /** {@inheritDoc IRolesProvider.canClaimAccessRole} */
  public async canClaimAccessRole(accessRoleName: string): Promise<boolean> {
    const normalizedRole = accessRoleName.trim();
    // Empty access-role names cannot match a mapping and should not trigger a request.
    if (!normalizedRole) {
      return false;
    }
    return this.executeOperation('canClaimAccessRole', () =>
      this.client.canClaimAccessRole(normalizedRole),
    );
  }

  /**
   * Executes a provider operation and reports its outcome without account or role identifiers.
   *
   * @template TResult - Operation result returned unchanged to the caller.
   * @param operation - Stable operation name used for telemetry.
   * @param execute - Client request and related event dispatch.
   * @returns The operation result.
   * @throws The original client or event error after recording failure telemetry.
   */
  private async executeOperation<TResult>(
    operation: RolesProviderOperation,
    execute: () => Promise<TResult>,
  ): Promise<TResult> {
    try {
      const result = await execute();
      this.dependencies.telemetry?.trackEvent({
        name: `RolesProvider.${operation}`,
        level: TelemetryLevel.Debug,
        scope: ['roles', TelemetryScope.Framework],
        properties: { outcome: 'success' },
      });
      return result;
    } catch (error) {
      const exception = error instanceof Error ? error : new Error(String(error));
      this.dependencies.telemetry?.trackException({
        name: `RolesProvider.${operation}`,
        exception,
        level: TelemetryLevel.Error,
        scope: ['roles', TelemetryScope.Framework],
        properties: { outcome: 'failure' },
      });
      throw error;
    }
  }
}
