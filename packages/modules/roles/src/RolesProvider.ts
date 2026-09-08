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
  ApiConsolidatedRoleAssignmentV1,
  ApiExtendedAccessRoleV1,
} from '@equinor/fusion-services/roles';

import { ActivateClaimableRoleAssignmentError } from './errors/ActivateClaimableRoleAssignmentError.js';
import { DeactivateClaimableRoleAssignmentError } from './errors/DeactivateClaimableRoleAssignmentError.js';
import { RequiredAccessRolesError } from './errors/RequiredAccessRolesError.js';
import type {
  ActivateClaimableRoleAssignmentInput,
  DeactivateClaimableRoleAssignmentInput,
  IRolesClient,
  RolesReadOptions,
} from './RolesClient.js';
import type { RequiredAccessRoleStatus } from './RequiredAccessRoleStatus.js';
import { ClaimableRoleAssignmentActivationEvent } from './ClaimableRoleAssignmentActivationEvent.js';
import { RolesError } from './errors/RolesError.js';
import { version } from './version.js';
import { defer, fromEvent, lastValueFrom, takeUntil } from 'rxjs';

/**
 * Stable Roles V2 provider operation names used for telemetry grouping.
 */
type RolesProviderOperation =
  | 'getActiveAccessRoleAssignments'
  | 'getConsolidatedClaimableRoleAssignments'
  | 'getConsolidatedRoleAssignments'
  | 'activateClaimableRoleAssignment'
  | 'deactivateClaimableRoleAssignment'
  | 'hasClaimableRoleAssignmentForAccessRole'
  | 'getRequiredAccessRoleStatuses'
  | 'getAccessRoles';

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
   * Dispatches a claimable-role-assignment activation lifecycle event.
   *
   * @param event - Pre-activation event to dispatch.
   * @returns The dispatched event after listeners complete.
   */
  dispatchEvent(
    event: ClaimableRoleAssignmentActivationEvent,
  ): Promise<ClaimableRoleAssignmentActivationEvent>;
}

/**
 * Optional framework modules used for Roles provider observability.
 */
interface RolesProviderDependencies {
  event?: RolesEventDispatcher;
  telemetry?: Pick<ITelemetryProvider, 'trackEvent' | 'trackException'>;
}

/**
 * Controls how {@link IRolesProvider.hasAccessRole} evaluates requested access roles.
 */
export interface HasAccessRoleOptions {
  /** Throws {@link RequiredAccessRolesError} instead of returning `false` when the check fails. */
  assert?: boolean;
  /** Requires every requested role when true; otherwise any requested role satisfies the check. */
  required?: boolean;
}

/**
 * Consumer-facing API for reading role assignments and activating or deactivating claimable
 * role assignments in Roles V2.
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
   * Gets the authenticated account's currently active, deduplicated access-role assignments.
   *
   * `/active-access-role-assignments` drops provenance: an assignment cannot be attributed to a
   * standing grant or an activated claim from this operation alone. Use this operation to render
   * active assignments or inspect assignment metadata. Use
   * {@link IRolesProvider.hasAccessRole | hasAccessRole} when only a boolean access-role check is needed.
   *
   * @returns Active access-role assignments for the account resolved by authentication.
   * @throws {RolesError} When the Roles V2 request or response validation fails.
   */
  getActiveAccessRoleAssignments(
    options?: RolesReadOptions,
  ): Promise<ApiAccountActiveAccessRoleAssignmentV1[]>;

  /**
   * Gets the roles the authenticated account is eligible to claim, consolidated across
   * contributing sources.
   *
   * @returns Consolidated claimable-role assignments for rendering claimable-role choices.
   * @throws {RolesError} When the Roles V2 request or response validation fails.
   */
  getConsolidatedClaimableRoleAssignments(
    options?: RolesReadOptions,
  ): Promise<ApiConsolidatedClaimableRoleAssignmentV1[]>;

  /**
   * Gets the authenticated account's consolidated, standing role assignments from
   * `/consolidated-role-assignments`.
   *
   * These assignments are not claimable, but Roles V2 never calls them permanent: they may still
   * be validity-bounded. `assignmentType` reported on
   * {@link IRolesProvider.getActiveAccessRoleAssignments | active} assignments cannot reliably
   * distinguish this standing grant from an activated claim, so consumers must read this
   * operation instead of inferring provenance from active assignments.
   *
   * @returns Consolidated role assignments for the authenticated account.
   * @throws {RolesError} When the Roles V2 request or response validation fails.
   */
  getConsolidatedRoleAssignments(
    options?: RolesReadOptions,
  ): Promise<ApiConsolidatedRoleAssignmentV1[]>;

  /**
   * Activates a claimable role assignment for the authenticated account.
   *
   * When the event module is enabled, a cancelable `onRoles.activateClaimableRoleAssignment` event
   * is dispatched before the activation request. A listener can call `preventDefault()` to deny
   * the activation.
   *
   * @param input - Claimable role assignment identifier, reason, and requested duration.
   * @returns Activation metadata returned by Roles V2.
   * @throws {ActivateClaimableRoleAssignmentError} When cancellation, event dispatch, or activation fails.
   */
  activateClaimableRoleAssignment(
    input: ActivateClaimableRoleAssignmentInput,
  ): Promise<ApiClaimableRoleAssignmentActivationV1>;

  /**
   * Ends the current activation for a claimable role assignment.
   *
   * @param input - Claimable role assignment identifier to deactivate.
   * @returns Updated activation metadata returned by Roles V2.
   * @throws {DeactivateClaimableRoleAssignmentError} When the deactivation request fails.
   */
  deactivateClaimableRoleAssignment(
    input: DeactivateClaimableRoleAssignmentInput,
  ): Promise<ApiClaimableRoleAssignmentActivationV1>;

  /**
   * Checks whether requested access roles are active for the authenticated account.
   *
   * Matching is exact and case-sensitive. Empty arrays return the all-role identity when
   * `required` is true and `false` otherwise, without making a request.
   *
   * @param accessRoleNames - Exact Roles V2 access-role names to match.
   * @param options - Whether to assert the result and require all requested access roles.
   * @returns True when the configured any-role or all-role condition is satisfied.
   * @throws {RequiredAccessRolesError} When assertion is enabled and the access-role condition is not satisfied.
   * @throws {RolesError} When the Roles V2 request or response validation fails.
   */
  hasAccessRole(
    accessRoleNames: readonly string[],
    options: HasAccessRoleOptions,
  ): Promise<boolean>;

  /**
   * Checks whether the authenticated account holds a claimable role assignment that grants an
   * access role when activated.
   *
   * The check follows expanded `accessRoleMappings`; the input identifies an access role, not a
   * claimable role assignment. Empty names return `false` without a request.
   *
   * @param accessRoleName - Exact Roles V2 access-role name to match in claimable mappings.
   * @returns True when a claimable role assignment grants the requested access role.
   * @throws {RolesError} When request, validation, or eligibility evaluation fails.
   */
  hasClaimableRoleAssignmentForAccessRole(accessRoleName: string): Promise<boolean>;

  /**
   * Resolves existence and claimable-assignment availability for access roles blocking
   * application initialization.
   *
   * @param accessRoleNames - Exact required access-role names.
   * @returns Statuses used by a host to explain or recover the failed requirement.
   * @throws {RolesError} When Roles V2 cannot resolve complete status information.
   */
  getRequiredAccessRoleStatuses(
    accessRoleNames: readonly string[],
  ): Promise<RequiredAccessRoleStatus[]>;

  /**
   * Iterates registered access roles one service page at a time.
   *
   * No pages are prefetched or accumulated. Consumers decide how much to process and can
   * stop with `break`; use the signal to cancel an in-flight request.
   *
   * @param signal - Optional cancellation signal for page requests.
   * @returns A lazy async iterator yielding access-role pages in service order.
   * @throws {RolesError} When a page request or continuation validation fails.
   * @example
   * ```ts
   * for await (const page of framework.modules.roles.getAccessRoles()) {
   *   await processPage(page);
   * }
   * ```
   */
  getAccessRoles(signal?: AbortSignal): AsyncGenerator<ApiExtendedAccessRoleV1[], void, unknown>;

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
 * delegates transport work to an initialized client that resolves the current account while
 * handling activation cancellation events, telemetry, and client resource disposal.
 *
 * @remarks
 * The built-in client caches active access-role assignment, consolidated claimable-role-assignment,
 * and consolidated role-assignment reads, plus claimable-assignment eligibility reads, for one
 * minute. A successful activation invalidates the active access-role assignment, consolidated
 * claimable-role-assignment, and eligibility caches. Consolidated role-assignment reads are not
 * invalidated by activation or deactivation, since those assignments are outside those mutations.
 * Configured clients control their own caching behavior. When telemetry is enabled, operation
 * outcomes are recorded without account or access-role identifiers.
 *
 * This client-side provider helps render and gate user-interface behavior. It does not replace
 * authorization checks in trusted backend services.
 *
 * @example
 * ```ts
 * const { roles } = framework.modules;
 *
 * const [activeAccessRoleAssignments, claimableRoleAssignments] = await Promise.all([
 *   roles.getActiveAccessRoleAssignments(),
 *   roles.getConsolidatedClaimableRoleAssignments(),
 * ]);
 *
 * if (await roles.hasAccessRole(['Reports.Read'], { required: true })) {
 *   renderReports();
 * }
 *
 * if (await roles.hasClaimableRoleAssignmentForAccessRole('Reports.Export')) {
 *   await roles.activateClaimableRoleAssignment({
 *     assignmentId: claimableRoleAssignmentId,
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

  /** {@inheritDoc IRolesProvider.getActiveAccessRoleAssignments} */
  public async getActiveAccessRoleAssignments(
    options?: RolesReadOptions,
  ): Promise<ApiAccountActiveAccessRoleAssignmentV1[]> {
    return this.executeOperation('getActiveAccessRoleAssignments', () =>
      lastValueFrom(this.client.getActiveAccessRoleAssignments(options)),
    );
  }

  /** {@inheritDoc IRolesProvider.getConsolidatedClaimableRoleAssignments} */
  public async getConsolidatedClaimableRoleAssignments(
    options?: RolesReadOptions,
  ): Promise<ApiConsolidatedClaimableRoleAssignmentV1[]> {
    return this.executeOperation('getConsolidatedClaimableRoleAssignments', () =>
      lastValueFrom(this.client.getConsolidatedClaimableRoleAssignments(options)),
    );
  }

  /** {@inheritDoc IRolesProvider.getConsolidatedRoleAssignments} */
  public async getConsolidatedRoleAssignments(
    options?: RolesReadOptions,
  ): Promise<ApiConsolidatedRoleAssignmentV1[]> {
    return this.executeOperation('getConsolidatedRoleAssignments', () =>
      lastValueFrom(this.client.getConsolidatedRoleAssignments(options)),
    );
  }

  /** {@inheritDoc IRolesProvider.activateClaimableRoleAssignment} */
  public async activateClaimableRoleAssignment(
    input: ActivateClaimableRoleAssignmentInput,
  ): Promise<ApiClaimableRoleAssignmentActivationV1> {
    return this.executeOperation('activateClaimableRoleAssignment', async () => {
      try {
        const activationEvent = await this.dependencies.event?.dispatchEvent(
          new ClaimableRoleAssignmentActivationEvent({
            source: this,
            detail: input,
          }),
        );
        // Cancellation prevents the irreversible activation request from reaching Roles V2.
        if (activationEvent?.canceled) {
          throw new ActivateClaimableRoleAssignmentError(
            'Claimable role assignment activation was canceled by an event listener.',
          );
        }
        return await lastValueFrom(this.client.activateClaimableRoleAssignment(input));
      } catch (error) {
        // Preserve an intentional cancellation while classifying all other activation failures.
        if (error instanceof ActivateClaimableRoleAssignmentError) {
          throw error;
        }
        throw new ActivateClaimableRoleAssignmentError(
          'Failed to activate claimable role assignment.',
          { cause: error },
        );
      }
    });
  }

  /** {@inheritDoc IRolesProvider.deactivateClaimableRoleAssignment} */
  public async deactivateClaimableRoleAssignment(
    input: DeactivateClaimableRoleAssignmentInput,
  ): Promise<ApiClaimableRoleAssignmentActivationV1> {
    return this.executeOperation('deactivateClaimableRoleAssignment', async () => {
      try {
        return await lastValueFrom(this.client.deactivateClaimableRoleAssignment(input));
      } catch (error) {
        throw new DeactivateClaimableRoleAssignmentError(
          'Failed to deactivate claimable role assignment.',
          { cause: error },
        );
      }
    });
  }

  /** {@inheritDoc IRolesProvider.hasAccessRole} */
  public async hasAccessRole(
    accessRoleNames: readonly string[],
    options: HasAccessRoleOptions,
  ): Promise<boolean> {
    const normalizedAccessRoles = new Set<string>();
    // Normalize and deduplicate once so matching and assertion details use stable identifiers.
    for (const accessRoleName of accessRoleNames) {
      const normalizedAccessRole = accessRoleName.trim();
      // Empty names cannot identify an access role.
      if (normalizedAccessRole) {
        normalizedAccessRoles.add(normalizedAccessRole);
      }
    }
    // Preserve expected any/all identities without loading account state for an empty request.
    if (normalizedAccessRoles.size === 0) {
      const hasAccessRole = options.required === true;
      // An asserted any-role check cannot be satisfied without at least one access-role name.
      if (!hasAccessRole && options.assert) {
        throw new RequiredAccessRolesError(
          'Roles module bootstrap denied. No access roles were provided.',
          [],
          this,
        );
      }
      return hasAccessRole;
    }
    const activeAccessRoleAssignments = await this.getActiveAccessRoleAssignments();
    const activeAccessRoleNames = new Set<string>();
    // Only explicit access-role names can satisfy a requested access role.
    for (const assignment of activeAccessRoleAssignments) {
      // Incomplete service records cannot satisfy exact access-role-name checks.
      if (assignment.accessRoleName) {
        activeAccessRoleNames.add(assignment.accessRoleName);
      }
    }
    const missingAccessRoles: string[] = [];
    // Collect every missing access role so assertion failures report the complete unmet condition.
    for (const accessRoleName of normalizedAccessRoles) {
      // Exact, case-sensitive identifiers are intentionally not normalized beyond whitespace.
      if (!activeAccessRoleNames.has(accessRoleName)) {
        missingAccessRoles.push(accessRoleName);
      }
    }
    // Roles V2 access-role names are identifiers, so matching remains exact and case-sensitive.
    const hasAccessRole = options.required
      ? missingAccessRoles.length === 0
      : missingAccessRoles.length < normalizedAccessRoles.size;
    // Assertion mode converts a failed predicate into the domain error used during bootstrap.
    if (!hasAccessRole && options.assert) {
      throw new RequiredAccessRolesError(
        `Roles module bootstrap denied. Missing required access roles: ${missingAccessRoles.join(', ')}.`,
        missingAccessRoles,
        this,
      );
    }
    return hasAccessRole;
  }

  /** {@inheritDoc IRolesProvider.hasClaimableRoleAssignmentForAccessRole} */
  public async hasClaimableRoleAssignmentForAccessRole(accessRoleName: string): Promise<boolean> {
    const normalizedAccessRole = accessRoleName.trim();
    // Empty access-role names cannot match a mapping and should not trigger a request.
    if (!normalizedAccessRole) {
      return false;
    }
    return this.executeOperation('hasClaimableRoleAssignmentForAccessRole', () =>
      lastValueFrom(this.client.hasClaimableRoleAssignmentForAccessRole(normalizedAccessRole)),
    );
  }

  /** {@inheritDoc IRolesProvider.getRequiredAccessRoleStatuses} */
  public async getRequiredAccessRoleStatuses(
    accessRoleNames: readonly string[],
  ): Promise<RequiredAccessRoleStatus[]> {
    return this.executeOperation('getRequiredAccessRoleStatuses', () =>
      lastValueFrom(this.client.getRequiredAccessRoleStatuses(accessRoleNames)),
    );
  }

  /**
   * {@inheritDoc IRolesProvider.getAccessRoles}
   *
   * @remarks
   * Each generator advance subscribes to exactly one client page observable. `lastValueFrom`
   * waits for that finite response before yielding; never convert a stream that eagerly
   * fetches every page here, because buffering would defeat consumer backpressure.
   * `takeUntil` tears down even custom clients that ignore the AbortSignal. Completion without
   * a page rejects conversion rather than appearing to be a successful end of the registry.
   * A pending `next()` needs the supplied signal to abort; `break` prevents subsequent requests.
   */
  public async *getAccessRoles(
    signal?: AbortSignal,
  ): AsyncGenerator<ApiExtendedAccessRoleV1[], void, unknown> {
    const controller = new AbortController();
    const requestSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
    let skip = 0;
    try {
      // Await consumer demand before fetching each page, preserving backpressure.
      while (true) {
        const page = await this.executeOperation('getAccessRoles', async () => {
          // Enforce cancellation at the provider boundary, including custom client observables.
          // takeUntil releases the subscription without emitting a success-shaped page.
          const result = await lastValueFrom(
            defer(() => {
              requestSignal.throwIfAborted();
              return this.client.getAccessRoles({ top: 100, skip }, requestSignal);
            }).pipe(takeUntil(fromEvent(requestSignal, 'abort'))),
          );
          // Never repeat an offset when a malformed continuation cannot advance.
          if (result.nextPage && !result.value?.length) {
            throw new RolesError('Roles V2 returned an invalid access-role continuation.');
          }
          return result;
        });
        const accessRoles = page.value ?? [];
        yield accessRoles;
        // Resume only on consumer demand; stop without an extra request after the final page.
        if (!page.nextPage) {
          return;
        }
        skip += accessRoles.length;
      }
    } finally {
      // Consumer break/return must release any transport tied to this iteration.
      controller.abort();
    }
  }

  /**
   * Executes a provider operation and reports its outcome without account or access-role identifiers.
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
