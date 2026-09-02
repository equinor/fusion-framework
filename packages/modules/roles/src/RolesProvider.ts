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

import { ClaimRoleError } from './errors/ClaimRoleError.js';
import { RequiredRolesError } from './errors/RequiredRolesError.js';
import type { ClaimRoleInput, IRolesClient } from './RolesClient.js';
import { RoleClaimEvent } from './RoleClaimEvent.js';
import { RolesError } from './errors/RolesError.js';
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
interface RolesProviderConfig {
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
 * Controls how {@link IRolesProvider.hasRole} evaluates requested access roles.
 */
export interface HasRoleOptions {
  /** Throws {@link RequiredRolesError} instead of returning `false` when the check fails. */
  assert?: boolean;
  /** Requires every requested role when true; otherwise any requested role satisfies the check. */
  required?: boolean;
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
   * @throws {RolesError} When the Roles V2 request or response validation fails.
   */
  getActiveRoles(): Promise<ApiAccountActiveAccessRoleAssignmentV1[]>;

  /**
   * Gets the roles the authenticated account is eligible to claim.
   *
   * @returns Consolidated claimable-role assignments for rendering claimable-role choices.
   * @throws {RolesError} When the Roles V2 request or response validation fails.
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
   * @throws {ClaimRoleError} When cancellation, event dispatch, or activation fails.
   */
  claimRole(input: ClaimRoleInput): Promise<ApiClaimableRoleAssignmentActivationV1>;

  /**
   * Checks whether requested access roles are active for the authenticated account.
   *
   * Matching is exact and case-sensitive. Empty arrays return the all-role identity when
   * `required` is true and `false` otherwise, without making a request.
   *
   * @param roles - Exact Roles V2 access-role names to match.
   * @param options - Whether to assert the result and require all requested roles.
   * @returns True when the configured any-role or all-role condition is satisfied.
   * @throws {RequiredRolesError} When assertion is enabled and the role condition is not satisfied.
   * @throws {RolesError} When the Roles V2 request or response validation fails.
   */
  hasRole(roles: readonly string[], options: HasRoleOptions): Promise<boolean>;

  /**
   * Checks whether the authenticated account can claim a role that grants an access role.
   *
   * The check follows expanded `accessRoleMappings`; the input identifies an access role, not a
   * claimable-role assignment. Empty names return `false` without a request.
   *
   * @param accessRoleName - Exact Roles V2 access-role name to match in claimable mappings.
   * @returns True when a claimable role grants the requested access role.
   * @throws {RolesError} When request, validation, or claim-eligibility evaluation fails.
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
 * delegates transport work to an initialized client that resolves the current account while handling claim
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
 * if (await roles.hasRole(['Reports.Read'], { required: true })) {
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
export class RolesProvider
  extends BaseModuleProvider<RolesProviderConfig>
  implements IRolesProvider
{
  private readonly client: IRolesClient;
  private readonly dependencies: RolesProviderDependencies;

  /**
   * Creates a Roles provider around a client initialized during module initialization.
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
      try {
        const claimEvent = await this.dependencies.event?.dispatchEvent(
          new RoleClaimEvent({
            source: this,
            detail: input,
          }),
        );
        // Cancellation prevents the irreversible activation request from reaching Roles V2.
        if (claimEvent?.canceled) {
          throw new ClaimRoleError('Role claim was canceled by an event listener.');
        }
        return await this.client.claimRole(input);
      } catch (error) {
        // Preserve an intentional cancellation while classifying all other claim failures.
        if (error instanceof ClaimRoleError) {
          throw error;
        }
        throw new ClaimRoleError('Failed to claim role.', { cause: error });
      }
    });
  }

  /** {@inheritDoc IRolesProvider.hasRole} */
  public async hasRole(roles: readonly string[], options: HasRoleOptions): Promise<boolean> {
    const normalizedRoles = new Set<string>();
    // Normalize and deduplicate once so matching and assertion details use stable identifiers.
    for (const role of roles) {
      const normalizedRole = role.trim();
      // Empty names cannot identify an access role.
      if (normalizedRole) {
        normalizedRoles.add(normalizedRole);
      }
    }
    // Preserve expected any/all identities without loading account state for an empty request.
    if (normalizedRoles.size === 0) {
      const hasRole = options.required === true;
      // An asserted any-role check cannot be satisfied without at least one role name.
      if (!hasRole && options.assert) {
        throw new RequiredRolesError('Roles module bootstrap denied. No roles were provided.', []);
      }
      return hasRole;
    }
    const activeRoles = await this.getActiveRoles();
    const activeRoleNames = new Set<string>();
    // Only explicit access-role names can satisfy a requested role.
    for (const assignment of activeRoles) {
      // Incomplete service records cannot satisfy exact role-name checks.
      if (assignment.accessRoleName) {
        activeRoleNames.add(assignment.accessRoleName);
      }
    }
    const missingRoles: string[] = [];
    // Collect every missing role so assertion failures report the complete unmet condition.
    for (const role of normalizedRoles) {
      // Exact, case-sensitive identifiers are intentionally not normalized beyond whitespace.
      if (!activeRoleNames.has(role)) {
        missingRoles.push(role);
      }
    }
    // Roles V2 access-role names are identifiers, so matching remains exact and case-sensitive.
    const hasRole = options.required
      ? missingRoles.length === 0
      : missingRoles.length < normalizedRoles.size;
    // Assertion mode converts a failed predicate into the domain error used during bootstrap.
    if (!hasRole && options.assert) {
      throw new RequiredRolesError(
        `Roles module bootstrap denied. Missing required roles: ${missingRoles.join(', ')}.`,
        missingRoles,
      );
    }
    return hasRole;
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
   * @throws {RolesError} The classified operation error after recording failure telemetry.
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
      const exception = RolesError.is(error)
        ? error
        : new RolesError(`Roles operation '${operation}' failed.`, { cause: error });
      this.dependencies.telemetry?.trackException({
        name: `RolesProvider.${operation}`,
        exception,
        level: TelemetryLevel.Error,
        scope: ['roles', TelemetryScope.Framework],
        properties: { outcome: 'failure' },
      });
      throw exception;
    }
  }
}
