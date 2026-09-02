import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { ClaimRoleInput } from './RolesClient.js';
import type { IRolesProvider } from './RolesProvider.js';

/**
 * Internal complete event shape used to enforce cancelability.
 */
type RoleClaimFrameworkEventInit = FrameworkEventInit<ClaimRoleInput, IRolesProvider>;

/**
 * Initialization data for a role claim request before Roles V2 activation.
 */
export type RoleClaimEventInit = Omit<RoleClaimFrameworkEventInit, 'cancelable'>;

/**
 * Cancelable event dispatched before the Roles V2 service activates a claimable role.
 */
export class RoleClaimEvent extends FrameworkEvent<RoleClaimFrameworkEventInit> {
  /** Registered framework event name. */
  static readonly Type = 'onRoles.claim' as const;

  /**
   * Creates a cancelable role-claim event.
   *
   * @param args - Claim input and provider requesting activation.
   */
  constructor(args: RoleClaimEventInit) {
    super(RoleClaimEvent.Type, { ...args, cancelable: true });
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onRoles.claim': RoleClaimEvent;
  }
}
