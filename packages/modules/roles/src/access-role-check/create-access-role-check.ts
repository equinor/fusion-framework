import type { HasAccessRoleOptions, IRolesProvider } from '../RolesProvider.js';
import type { AccessRoleCheck } from './access-role-check.js';
import { AccessRoleCheckController } from './AccessRoleCheckController.js';

/**
 * Creates observable state for one immutable active access-role predicate.
 *
 * The resource invokes only {@link IRolesProvider.hasAccessRole}. Call {@link AccessRoleCheck.load}
 * after subscribing, use {@link AccessRoleCheck.refresh} for a cache-bypassing recheck, and call
 * {@link AccessRoleCheck.dispose} when the resource is no longer needed.
 *
 * @param provider - Roles provider used for active access checks.
 * @param accessRoleNames - Exact, case-sensitive Roles V2 access-role names.
 * @param options - Selects all-role or any-role matching.
 * @returns Module-owned observable access state with load and refresh actions.
 */
export const createAccessRoleCheck = (
  provider: Pick<IRolesProvider, 'hasAccessRole'>,
  accessRoleNames: readonly string[],
  options: Pick<HasAccessRoleOptions, 'required'> = {},
): AccessRoleCheck =>
  new AccessRoleCheckController(provider, accessRoleNames, options.required === true);
