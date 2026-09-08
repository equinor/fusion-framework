import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { ActivateClaimableRoleAssignmentInput } from './RolesClient.js';
import type { IRolesProvider } from './RolesProvider.js';

/**
 * Internal complete event shape used to enforce cancelability.
 */
type ClaimableRoleAssignmentActivationFrameworkEventInit = FrameworkEventInit<
  ActivateClaimableRoleAssignmentInput,
  IRolesProvider
>;

/**
 * Initialization data for a claimable-role-assignment activation request before Roles V2 activates it.
 */
export type ClaimableRoleAssignmentActivationEventInit = Omit<
  ClaimableRoleAssignmentActivationFrameworkEventInit,
  'cancelable'
>;

/**
 * Cancelable event dispatched before the Roles V2 service activates a claimable role assignment.
 */
export class ClaimableRoleAssignmentActivationEvent extends FrameworkEvent<ClaimableRoleAssignmentActivationFrameworkEventInit> {
  /** Registered framework event name. */
  static readonly Type = 'onRoles.activateClaimableRoleAssignment' as const;

  /**
   * Creates a cancelable claimable-role-assignment activation event.
   *
   * @param args - Activation input and provider requesting the activation.
   */
  constructor(args: ClaimableRoleAssignmentActivationEventInit) {
    super(ClaimableRoleAssignmentActivationEvent.Type, { ...args, cancelable: true });
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onRoles.activateClaimableRoleAssignment': ClaimableRoleAssignmentActivationEvent;
  }
}
