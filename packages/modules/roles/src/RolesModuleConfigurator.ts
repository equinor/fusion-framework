import {
  BaseConfigBuilder,
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import { from, lastValueFrom, type ObservableInput } from 'rxjs';

import type { IRolesClient } from './RolesClient.js';
import type { RolesModuleConfig } from './types.js';

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
        throw new Error('Required roles builder must return an array of role names.');
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
        throw new Error('Required role names must be non-empty strings.');
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
   * @returns Finalized Roles module configuration.
   * @throws {Error} When deferred client or required role configuration could not be resolved.
   */
  protected _processConfig(
    config: Partial<RolesModuleConfig>,
    args: ConfigBuilderCallbackArgs,
  ): ObservableInput<RolesModuleConfig> {
    // The base builder omits values from failed callbacks, which must not trigger another client path.
    if (this.clientConfigured && config.client === undefined) {
      throw new Error('Failed to resolve configured Roles client.');
    }
    // Required roles always have a default builder, so an omitted value means that builder failed.
    if (config.requiredRoles === undefined) {
      throw new Error('Failed to resolve required role configuration.');
    }
    return super._processConfig(config, args);
  }
}
