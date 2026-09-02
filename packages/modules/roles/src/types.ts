import type { IRolesClient, RolesAccountResolver } from './RolesClient.js';

/**
 * Resolved configuration used to initialize the roles provider.
 */
export interface RolesModuleConfig {
  /** Client created or resolved during configuration and initialized by the module. */
  client: IRolesClient;
  /** Resolves the account selected when each client operation executes. */
  accountResolver: RolesAccountResolver;
  /** Access-role names that must be active before the module can bootstrap. */
  requiredRoles: readonly string[];
}
