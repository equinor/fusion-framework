import type { IRolesClient } from './RolesClient.js';

/**
 * Resolved configuration used to initialize the roles provider.
 */
export interface RolesModuleConfig {
  /** Optional client resolved during configuration for custom transports and tests. */
  client?: IRolesClient;
  /** Access-role names that must be active before the module can bootstrap. */
  requiredRoles: readonly string[];
}
