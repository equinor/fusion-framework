import {
  BaseConfigBuilder,
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import type { IServiceDiscoveryProvider } from '@equinor/fusion-framework-module-service-discovery';
import { from, lastValueFrom } from 'rxjs';

import { type IRolesClient, type RolesAccountResolver, RolesClient } from './RolesClient.js';
import { RequiredRolesError } from './errors/RequiredRolesError.js';
import { RolesError } from './errors/RolesError.js';
import type { RolesModuleConfig } from './types.js';

const ROLES_SERVICE_KEY = 'rolesv2';

interface ActiveAccountProvider {
  account: {
    localAccountId: string;
  } | null;
}

/**
 * Determines whether authentication exposes the active Fusion account needed for role checks.
 *
 * @param value - Authentication provider resolved from the module registry.
 * @returns True when the provider exposes an active-account property.
 */
const isActiveAccountProvider = (value: unknown): value is ActiveAccountProvider => {
  return !!value && typeof value === 'object' && 'account' in value;
};

/**
 * Determines whether a value can create service-discovery-backed HTTP clients.
 *
 * @param value - Local or parent module instance to inspect.
 * @returns True when the value implements the required service discovery operation.
 */
const isServiceDiscoveryProvider = (value: unknown): value is IServiceDiscoveryProvider => {
  return (
    !!value &&
    typeof value === 'object' &&
    'createClient' in value &&
    typeof value.createClient === 'function'
  );
};

/**
 * Resolves an inherited service discovery provider from a parent module registry.
 *
 * @param value - Parent module registry supplied during child configuration.
 * @returns Parent service discovery provider when available.
 */
const getParentServiceDiscovery = (value: unknown): IServiceDiscoveryProvider | undefined => {
  // Parent registries are unknown at the generic builder boundary and must be narrowed structurally.
  if (!value || typeof value !== 'object' || !('serviceDiscovery' in value)) {
    return undefined;
  }
  return isServiceDiscoveryProvider(value.serviceDiscovery) ? value.serviceDiscovery : undefined;
};

/**
 * Configurator contract for the Fusion Framework Roles V2 module.
 */
export interface IRolesModuleConfigurator {
  /**
   * Replaces service discovery with a client or configuration builder callback.
   *
   * @param clientOrBuilderFn - Client instance or callback that resolves one during configuration.
   */
  setClient(clientOrBuilderFn: IRolesClient | ConfigBuilderCallback<IRolesClient>): void;

  /**
   * Requires every named access role to be active for the signed-in account at bootstrap.
   *
   * @param rolesOrBuilderFn - Access-role names or callback that resolves them during configuration.
   * @throws {Error} When a directly supplied role name is empty.
   */
  requireRoles(
    rolesOrBuilderFn: readonly string[] | ConfigBuilderCallback<readonly string[]>,
  ): void;
}

/**
 * Builds validated configuration for the Fusion Framework Roles V2 module.
 */
export class RolesModuleConfigurator
  extends BaseConfigBuilder<RolesModuleConfig>
  implements IRolesModuleConfigurator
{
  private clientConfigured = false;
  private readonly requiredRoleSources: Array<
    readonly string[] | ConfigBuilderCallback<readonly string[]>
  > = [];

  /**
   * Creates a Roles V2 configuration builder with empty role requirements.
   */
  constructor() {
    super();
    this._set('requiredRoles', (args) => this.resolveRequiredRoles(args));
  }

  /** {@inheritDoc IRolesModuleConfigurator.setClient} */
  public setClient(clientOrBuilderFn: IRolesClient | ConfigBuilderCallback<IRolesClient>): void {
    this.clientConfigured = true;
    // Builder callbacks resolve against module initialization context; direct clients remain unchanged.
    if (typeof clientOrBuilderFn === 'function') {
      this._set('client', clientOrBuilderFn);
    } else {
      this._set('client', async () => clientOrBuilderFn);
    }
  }

  /** {@inheritDoc IRolesModuleConfigurator.requireRoles} */
  public requireRoles(
    rolesOrBuilderFn: readonly string[] | ConfigBuilderCallback<readonly string[]>,
  ): void {
    // Validate direct values immediately while deferring builder callbacks until configuration.
    if (typeof rolesOrBuilderFn === 'function') {
      this.requiredRoleSources.push(rolesOrBuilderFn);
    } else {
      this.requiredRoleSources.push(this.normalizeRoles(rolesOrBuilderFn));
    }
  }

  /**
   * Resolves every configured requirement source into one deduplicated role list.
   *
   * @param args - Module initialization context supplied to builder callbacks.
   * @returns Normalized access-role names required at bootstrap.
   * @throws {Error} When a builder returns no role array or contains an empty role name.
   */
  private async resolveRequiredRoles(args: ConfigBuilderCallbackArgs): Promise<readonly string[]> {
    const requiredRoles = new Set<string>();
    // Preserve accumulation across direct values and builder callbacks.
    for (const source of this.requiredRoleSources) {
      const resolved =
        typeof source === 'function' ? await lastValueFrom(from(source(args))) : source;
      // A builder must provide role names so bootstrap cannot silently lose configured requirements.
      if (!resolved) {
        throw new RequiredRolesError('Required roles builder must return an array of role names.');
      }
      // Merge each normalized source while retaining first-seen ordering.
      for (const role of this.normalizeRoles(resolved)) {
        requiredRoles.add(role);
      }
    }
    return [...requiredRoles];
  }

  /**
   * Normalizes and validates configured access-role names.
   *
   * @param roles - Access-role names to normalize.
   * @returns Trimmed access-role names.
   * @throws {Error} When a role name is empty.
   */
  private normalizeRoles(roles: readonly string[]): readonly string[] {
    const normalizedRoles: string[] = [];
    // Normalize once so bootstrap comparisons are deterministic and empty role names fail early.
    for (const role of roles) {
      const normalized = role.trim();
      // An empty role can never match a Roles V2 access-role assignment.
      if (!normalized) {
        throw new RequiredRolesError('Required role names must be non-empty strings.');
      }
      normalizedRoles.push(normalized);
    }
    return normalizedRoles;
  }

  /**
   * Rejects configuration when a deferred role builder failed before producing requirements.
   *
   * @param config - Partial configuration assembled by the base builder.
   * @param args - Module initialization context supplied to configuration callbacks.
   * @returns Finalized Roles module configuration with a client ready for module initialization.
   * @throws {Error} When deferred client or required role configuration could not be resolved.
   */
  protected async _processConfig(
    config: Partial<RolesModuleConfig>,
    args: ConfigBuilderCallbackArgs,
  ): Promise<RolesModuleConfig> {
    // The base builder omits values from failed callbacks, which must not trigger another client path.
    if (this.clientConfigured && config.client === undefined) {
      throw new RolesError('Failed to resolve configured Roles client.');
    }
    // Required roles always have a default builder, so an omitted value means that builder failed.
    if (config.requiredRoles === undefined) {
      throw new RequiredRolesError('Failed to resolve required role configuration.');
    }
    const accountResolver = await this._createAccountIdentifierResolver(args);
    const client = config.client ?? (await this._createDefaultClient(args, accountResolver));
    return { requiredRoles: config.requiredRoles, accountResolver, client };
  }

  /**
   * Creates the built-in Roles client when configuration did not supply one.
   *
   * @param args - Module initialization context used to resolve service discovery.
   * @param accountResolver - Resolves the current account for client operations.
   * @returns Service-discovery-backed Roles client.
   * @throws {Error} When service discovery is not available.
   */
  protected async _createDefaultClient(
    args: ConfigBuilderCallbackArgs,
    accountResolver: RolesAccountResolver,
  ): Promise<IRolesClient> {
    const serviceDiscovery = await this._resolveServiceDiscovery(args);
    const httpClient = await serviceDiscovery.createClient(ROLES_SERVICE_KEY);
    return new RolesClient(httpClient, accountResolver);
  }

  /**
   * Resolves service discovery from the local module scope or its parent framework.
   *
   * @param args - Module context containing local and parent module providers.
   * @returns Service discovery provider used to create the default Roles client.
   * @throws {Error} When neither scope exposes service discovery.
   */
  protected async _resolveServiceDiscovery(
    args: ConfigBuilderCallbackArgs,
  ): Promise<IServiceDiscoveryProvider> {
    // An explicitly configured app provider takes precedence over inherited host discovery.
    if (args.hasModule('serviceDiscovery')) {
      return args.requireInstance('serviceDiscovery');
    }
    const parentServiceDiscovery = getParentServiceDiscovery(args.ref);
    // Most apps inherit service discovery from the parent framework instead of configuring it.
    if (parentServiceDiscovery) {
      return parentServiceDiscovery;
    }
    throw new RolesError(
      'Roles module requires the serviceDiscovery module or a configured client.',
    );
  }

  /**
   * Resolves authentication during configuration while deferring account selection to each operation.
   *
   * @param args - Module context used to resolve the authentication provider.
   * @returns Current-account resolver retaining the initialized authentication provider.
   * @throws {Error} When authentication initialization fails during configuration.
   * @throws {RequiredRolesError} When the returned resolver cannot resolve an active account.
   */
  protected async _createAccountIdentifierResolver(
    args: ConfigBuilderCallbackArgs,
  ): Promise<RolesAccountResolver> {
    // Await here so auth failures reject configuration, not an unobserved background promise.
    // Retain the provider for recovery even if another app module later fails initialization.
    const auth = args.hasModule('auth') ? await args.requireInstance('auth') : undefined;
    return async () => {
      // Read account state per operation so switching accounts does not require rebuilding the module.
      if (!isActiveAccountProvider(auth) || !auth.account?.localAccountId) {
        throw new RequiredRolesError(
          'Roles module requires an active authenticated account to resolve Roles V2 data.',
        );
      }
      return auth.account.localAccountId;
    };
  }
}
