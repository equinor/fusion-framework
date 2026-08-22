import type {
  ConfigBuilderCallback,
  ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import type { IMsalClient } from '../MsalClient.interface';
import type { IMsalProvider } from '../MsalProvider.interface';
import type { MsalClientConfig } from '../MsalClient';
import { MsalConfigurator, type MsalConfig } from '../MsalConfigurator';

import { MsalMockClient, type MsalMockUser } from './MsalMockClient';
import { createMockUserFromToken } from './create-mock-user-from-token';

/**
 * Declares the mock's own branch of the MSAL configuration.
 *
 * @remarks
 * Merging into `MsalConfigExtension` is what lets `setAccount` record the
 * user through the ordinary builder — `_set` derives its target from
 * {@link MsalConfig}, so a key the type does not know about could only be set by
 * casting past it.
 *
 * The schema strips `mock` when it validates, so a declaration made here travels
 * the builder and stops there: it is readable from the raw configuration and
 * absent from the one `MsalProvider` receives.
 */
declare module '../msal-config-schema' {
  interface MsalConfigExtension {
    mock?: {
      /**
       * The user to sign in, resolved if it was declared as a callback, or
       * `null` when nobody is signed in.
       */
      account?: MsalMockUser | null;
      /**
       * The token to return verbatim instead of one generated from the
       * signed-in user's fields.
       */
      token?: string;
    };
  }
}

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
 * A user named `Test User` is signed in by default, so an application boots
 * without declaring anything.
 *
 * @example Name the signed-in user
 * ```typescript
 * enableMsalMock(configurator, (builder) => {
 *   builder.setAccount({ name: 'Ada Lovelace', username: 'ada@equinor.com' });
 * });
 * ```
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
  /**
   * Declares the user to sign in.
   *
   * @remarks
   * Who is signed in is session state, not client configuration — which is what
   * lets {@link MsalMockClient} take the same argument the real client takes: a
   * client is configured with *what it talks to*, never with *who is signed in*.
   *
   * The user is therefore recorded on the configuration as `mock.account`, not
   * on this builder, and is signed in on whichever client the module ends up
   * authenticating through — wherever that client was built:
   *
   * - The client this builder builds, normally. The user is in place before
   *   `MsalProvider.initialize` runs, which is what makes the provider's own
   *   start-up path observable: with `signedOut` and `setRequiresAuth(true)`, a
   *   test sees the real automatic login run.
   * - The **host's** client when the module is hoisted onto a host
   *   application's provider, because none is built here. An application inside
   *   a portal shares the portal's session, so this changes who the host sees
   *   signed in too, as it would in production.
   * - A client supplied through {@link MsalConfigurator.setClient | setClient},
   *   when that client is a {@link MsalMockClient}.
   *
   * Throws when that client cannot represent a declared user, rather than
   * failing quietly — a silent no-op is the whole failure mode this exists to
   * prevent.
   *
   * Pass `null` when nobody is signed in, or `{ signedOut: true }` to keep an
   * identity without a session — a later login then resolves as that user.
   *
   * @param account - The user, or an ordinary config-builder callback resolving it.
   * @returns The builder, for chaining.
   *
   * @example Derive the user from the modules in scope
   * ```typescript
   * builder.setAccount(async ({ hasModule }) => ({
   *   name: hasModule('app') ? 'App User' : 'Portal User',
   * }));
   * ```
   */
  public setAccount(
    account: MsalMockUser | null | ConfigBuilderCallback<MsalMockUser | null>,
  ): this {
    this._set('mock.account', account);
    return this;
  }

  /**
   * Declares the token to return, independent of who is signed in.
   *
   * @remarks
   * Use this when a backend mock validates its own tokens (specific claims, an
   * audience, or a signature) — the client then returns this token verbatim
   * instead of fabricating one from the signed-in user's fields.
   *
   * @param token - A JWT (e.g. from `createMockToken`, or issued by an external mock).
   * @param skipResolve - When `true`, override only the token and leave an account
   * declared through {@link setAccount} untouched. Defaults to `false`, which also signs
   * in the user described by the token's claims, via {@link createMockUserFromToken}.
   * @returns The builder, for chaining.
   *
   * @example Sign in as whoever the token names
   * ```typescript
   * builder.setToken(token);
   * ```
   *
   * @example Keep a separately declared account, but return this exact token
   * ```typescript
   * builder.setAccount({ name: 'Ada Lovelace' }).setToken(token, true);
   * ```
   */
  public setToken(token: string, skipResolve = false): this {
    this._set('mock.token', token);
    // skipResolve defaults to false - most callers want the token's claims to name who is signed in
    if (!skipResolve) {
      this.setAccount(createMockUserFromToken(token));
    }
    return this;
  }

  /**
   * Resolves the client the module authenticates through, wherever it was built.
   *
   * @remarks
   * Shared by {@link setAccount} and {@link setToken} application: neither can
   * assume the scope declaring mock state is the scope that built the client,
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
  #getClient(config: MsalConfig, init: ConfigBuilderCallbackArgs | undefined, action: string): MsalMockClient {
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
   * Signs the declared user in on the client the module authenticates through.
   *
   * @param account - The user to sign in, or `null` when nobody is.
   * @param config - The validated configuration, carrying the client when one was built.
   * @param init - The builder arguments, carrying the host reference when hoisted.
   * @throws When the resolved client is not a {@link MsalMockClient}.
   */
  #signIn(
    account: MsalMockUser | null,
    config: MsalConfig,
    init?: ConfigBuilderCallbackArgs,
  ): void {
    this.#getClient(config, init, 'sign a user in').setUser(account);
  }

  /**
   * Assembles the configuration, then signs the declared user in.
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
   * The user is read from `rawConfig`, because the schema strips `mock` when it
   * validates — the key exists to carry a test's declaration through the
   * builder, never to reach the provider.
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

    // `null` is a declaration in its own right — nobody is signed in — so only
    // an absent one means the test said nothing about the user
    const account = rawConfig.mock?.account;
    // Apply even null because null explicitly requests a signed-out mock state.
    if (account !== undefined) {
      this.#signIn(account, config, init);
    }

    // Applied after the account so a token declared alongside `skipResolve: true`
    // overrides whatever `setUser` above just fabricated.
    const token = rawConfig.mock?.token;
    // absent means the test declared no token override; leave the client generating its own
    if (token !== undefined) {
      this.#getClient(config, init, 'set a token').setToken(token);
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
   * Knows nothing about who is signed in: a client is built from what it talks
   * to, and the declared user is applied to it afterwards.
   *
   * @param config - The validated configuration the client is built from.
   * @returns A client resolving tokens in-process.
   */
  protected override async _createClient(config: MsalConfig): Promise<IMsalClient> {
    return new MsalMockClient(this._createClientConfig(config) ?? defaultMockClientConfig);
  }
}
