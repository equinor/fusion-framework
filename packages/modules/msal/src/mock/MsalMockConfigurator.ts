import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';

import type { IMsalClient } from '../MsalClient.interface';
import type { IMsalProvider } from '../MsalProvider.interface';
import type { MsalClientConfig } from '../MsalClient';
import { MsalConfigurator, type MsalConfig } from '../MsalConfigurator';

import { MsalMockClient } from './MsalMockClient';
import { mockClientOperations } from './mock-client-operations';
import type { MsalMockTokenAcquirer } from './types';

/**
 * The client configuration used when a test declares none.
 *
 * @remarks
 * `MsalClientConfig.auth.clientId` is required, so a mock still needs a client
 * configuration to exist. Supplying a default is what lets an application boot
 * under test without declaring credentials it does not have.
 */
const defaultMockClientConfig: MsalClientConfig = {
  auth: {
    clientId: 'fusion-mock-client',
    tenantId: 'fusion-mock-tenant',
  },
};

/**
 * The real MSAL configurator, backed by an in-process client.
 *
 * @remarks
 * Nothing else changes: the same builder API, the same validation and the same
 * `MsalProvider` are used. Only the boundary that would contact Entra ID is
 * substituted, through the same
 * {@link MsalConfigurator._createClient | _createClient} seam the real
 * configurator builds its own client from — and from the same
 * {@link MsalConfigurator._createClientConfig | _createClientConfig}, so
 * `setClientConfig` means exactly what it means in production.
 *
 * A user named `Test User` is signed in by default. Custom identities come only
 * from tokens returned by {@link setAcquireToken}.
 *
 * @example Configure the client exactly as in production
 * ```typescript
 * enableMsalMock(configurator, (builder) => {
 *   builder.setClientConfig({ auth: { clientId: 'my-app', tenantId: 'my-tenant' } });
 * });
 * ```
 *
 * @example Take full control of authentication
 * ```typescript
 * enableMsalMock(configurator, (builder) => {
 *   builder.setClient(new MyOwnMsalClient());
 * });
 * ```
 */
export class MsalMockConfigurator extends MsalConfigurator {
  #acquireToken?: MsalMockTokenAcquirer;

  /**
   * Injects token acquisition for the active test runtime.
   *
   * @param acquireToken - Function that obtains a token for requested scopes.
   * @returns The builder, for chaining.
   */
  public setAcquireToken(acquireToken: MsalMockTokenAcquirer): this {
    this.#acquireToken = acquireToken;
    return this;
  }

  /**
   * Resolves the client the module authenticates through, wherever it was built.
   *
   * @remarks
   * Account application cannot assume the scope declaring mock state is the
   * scope that built the client,
   * which is exactly what is not true when an application is tested inside a
   * portal. The host built that client, in a scope this builder never sees, so
   * the client has to be located rather than assumed.
   *
   * @param config - The validated configuration, carrying the client when one was built.
   * @param init - The builder arguments, carrying the host reference when hoisted.
   * @param action - Describes what could not be applied, for the thrown error.
   * @returns The resolved mock client.
   * @throws When the resolved client is not a {@link MsalMockClient}.
   */
  #getClient(
    config: MsalConfig,
    init: ConfigBuilderCallbackArgs | undefined,
    action: string,
  ): MsalMockClient {
    const host = (init?.ref as { auth?: IMsalProvider } | undefined)?.auth;
    const client = config.client ?? host?.client;

    // Reject a real client because mock state cannot be applied to it.
    if (!(client instanceof MsalMockClient)) {
      throw new Error(
        `MsalMockConfigurator: cannot ${action}, because this module does not authenticate through a mock client. Declare it where that client is configured instead.`,
      );
    }

    return client;
  }

  /**
   * Assembles the configuration, then installs custom token acquisition.
   *
   * @remarks
   * Stands a client configuration in first when this builder is the one that
   * will build a client: `MsalClientConfig.auth.clientId` is required to build
   * any client at all and a test has no real credentials to declare. It then
   * flows through the very same
   * {@link MsalConfigurator._createClientConfig | _createClientConfig}
   * enrichment the real client is built from, and anything declared through
   * {@link MsalConfigurator.setClientConfig | setClientConfig} wins — exactly as
   * in production.
   *
   * Doing that here rather than in the constructor is deliberate: a hoisted
   * module authenticates through the host and builds no client, so it must not
   * look configured either.
   *
   * @param rawConfig - The raw configuration to process.
   * @param init - The builder arguments, carrying the host reference when hoisted.
   * @returns The processed and validated configuration.
   */
  override async _processConfig(
    rawConfig: MsalConfig,
    init?: ConfigBuilderCallbackArgs,
  ): Promise<MsalConfig> {
    // Supply mock credentials only when this builder owns client construction.
    if (!this._isHoisted(init) && !this.getClientConfig()) {
      this.setClientConfig(defaultMockClientConfig);
    }

    const config = await super._processConfig(rawConfig, init);

    // Apply after client construction so acquisition owns all non-default identity state.
    if (this.#acquireToken) {
      mockClientOperations.configure(
        this.#getClient(config, init, 'configure token acquisition'),
        this.#acquireToken,
      );
    }

    return config;
  }

  /**
   * Builds an in-process client.
   *
   * @remarks
   * Called only when no client was set, so
   * {@link MsalConfigurator.setClient | setClient} still replaces authentication
   * outright.
   *
   * Deliberately does not delegate to `super`, which would build a real
   * `MsalClient` and contact Entra ID. It is never reached when the module is
   * hoisted onto a host application's provider, because the base configurator
   * gates client creation on {@link MsalConfigurator._isHoisted | _isHoisted} —
   * a mock client built there would shadow the host's client, the exact scenario
   * an application-inside-a-portal test exists to cover.
   *
   * Knows nothing about who is signed in: acquired token claims determine
   * non-default identity state.
   *
   * @param config - The validated configuration the client is built from.
   * @returns A client resolving tokens in-process.
   */
  protected override async _createClient(config: MsalConfig): Promise<IMsalClient> {
    return new MsalMockClient(this._createClientConfig(config) ?? defaultMockClientConfig);
  }
}
