import type { FusionModulesInstance } from '@equinor/fusion-framework';

import type {
  AnyModule,
  IModuleConfigurator,
  ModuleConfigType,
} from '@equinor/fusion-framework-module';

import http, { type IHttpClientConfigurator } from '@equinor/fusion-framework-module-http';
import {
  msalMockModule,
  type MsalMockConfigurator,
} from '@equinor/fusion-framework-module-msal/mock';

import { AppConfigurator } from '../AppConfigurator.js';
import type { AppEnv } from '../types.js';

/**
 * The real `AppConfigurator`, with the `msal` module it registers backed by
 * the same test double `FrameworkMockConfigurator` uses. `http` is the real
 * module — fake a response by registering a short-circuiting middleware
 * through `.http.addMiddleware(...)` instead of swapping the module out.
 *
 * @remarks
 * Nothing else changes: the same module set (`event`, `http`, `msal`), the same
 * configuration pipeline and the same lifecycle are used. `configureHttpClient`,
 * `useFrameworkServiceClient` and any callback written for a real
 * `AppConfigurator` work against this unchanged.
 *
 * `http` and `msal` are pinned early — mirroring `FrameworkMockConfigurator`,
 * one level down — so `.http` and `.msal` are reachable synchronously, before
 * `useFrameworkServiceClient` or a `configureModules` callback ever runs.
 * `event` is deliberately not pinned, for the same reason it isn't in
 * `FrameworkMockConfigurator`: its `configure` factory reads `ref` to wire
 * bubbling to a parent event provider, and pinning would freeze that decision
 * before a `ref` could ever be known.
 *
 * @typeParam TModules - Module descriptors beyond the default set. Supply this
 *   when a test registers application modules, so they are typed on the result.
 * @typeParam TRef - The resolved Fusion modules instance used as a reference during initialization.
 * @typeParam TEnv - The application environment descriptor.
 *
 * @example
 * ```typescript
 * const manifest = { appKey: 'my-app', displayName: 'My App', description: 'My app', type: 'standalone' } as const;
 * const configurator = new AppMockConfigurator({ manifest });
 *
 * configurator.configureHttpClient('catalog', { baseUri: 'https://api.example.com' });
 * configurator.http.addMiddleware(async (uri, init, next) =>
 *   uri === 'https://api.example.com/items' ? Response.json([{ id: 1 }]) : next(uri, init),
 * );
 * ```
 */
export class AppMockConfigurator<
  TModules extends Array<AnyModule> | unknown = unknown,
  TRef extends FusionModulesInstance = FusionModulesInstance,
  TEnv extends AppEnv = AppEnv,
> extends AppConfigurator<TModules, TRef, TEnv> {
  static override readonly className: string = 'AppMockConfigurator';

  // Keyed by module name, so `_getConfig` can look a pinned configurator up
  // without needing the module descriptor again.
  #configurators = new Map<string, unknown>();

  // Keyed by module name, so `addConfig` can redirect a registration at the
  // pinned descriptor instead of the unpinned one it was given.
  #pinnedModules = new Map<string, AnyModule>();

  /**
   * Creates an app configurator backed by the built-in mock modules.
   *
   * @param env - The application environment containing manifest, config, and optional basename.
   */
  constructor(env: TEnv) {
    super(env);

    // Pinning up front replaces the modules AppConfigurator's own constructor
    // already registered, whether or not a test ever touches the accessor.
    this._pin(http);
    this._pin(msalMockModule);

    // deferred from AppConfigurator's own constructor (see the override below) until
    // after pinning, so endpoint-derived clients register against the pinned http module
    super._configureHttpClientsFromAppConfig();
  }

  /**
   * No-ops the base constructor's own call to this, since it would otherwise run
   * before {@link _pin} has anything to redirect `addConfig` at; this class calls
   * {@link AppConfigurator._configureHttpClientsFromAppConfig} itself once pinned.
   */
  protected override _configureHttpClientsFromAppConfig(): void {}

  /**
   * Registers a module configurator, redirecting registrations for a pinned module
   * at its pinned descriptor.
   *
   * @remarks
   * `configureHttpClient`, `useFrameworkServiceClient` and similar helpers always
   * pass the real, unpinned module descriptor — the base `addConfig` replaces a
   * module's descriptor whenever it doesn't recognize the object it's given, even
   * under the same name, which would otherwise silently un-pin it.
   *
   * @param config - The module configurator descriptor to register.
   * @template T - The module type being configured.
   * @template TConfig - The resolved configuration type for the module.
   */
  public override addConfig<T extends AnyModule, TConfig = ModuleConfigType<T>>(
    config: IModuleConfigurator<T, TRef, TConfig>,
  ): void {
    const pinnedModule = this.#pinnedModules.get(config.module.name) as T | undefined;
    super.addConfig(pinnedModule ? { ...config, module: pinnedModule } : config);
  }

  /**
   * Pins a module to a single configurator instance for the lifetime of this
   * configurator, so it can be reached by name through {@link _getConfig}.
   *
   * @remarks
   * The module system otherwise builds a fresh configurator from its own
   * `configure` factory during the configure phase — too late for a test to
   * reach, and a new instance on every call besides. This replaces that factory
   * with one that always returns the same instance, and registers the result
   * under the module's own name.
   *
   * An application module supplied through {@link TModules} uses this the same
   * way `.http` and `.msal` do, to expose its own named accessor:
   *
   * ```typescript
   * class MyAppMockConfigurator extends AppMockConfigurator<[WidgetsModule]> {
   *   constructor(env: AppEnv) {
   *     super(env);
   *     this._pin(widgetsMockModule);
   *   }
   *
   *   public get widgets(): WidgetsMockConfigurator {
   *     return this._getConfig('widgets');
   *   }
   * }
   * ```
   *
   * @param module - The module descriptor to pin a configurator for.
   * @template TModule - The specific module descriptor type being pinned.
   * @throws {Error} If the module declares no `configure` factory to pin, or
   *   the factory returns a promise instead of a configurator — pinning is
   *   synchronous, so a test can reach the accessor immediately.
   */
  protected _pin<TModule extends AnyModule>(module: TModule): void {
    // A module without a configure factory has nothing this method could pin
    if (!module.configure) {
      throw new Error(`Cannot pin "${module.name}": it declares no configure factory.`);
    }
    const instance = module.configure();
    // Async factories would make the pinned instance unavailable until the module system
    // resolves it later, defeating the point of pinning it for immediate synchronous access
    if (instance instanceof Promise) {
      throw new Error(
        `Cannot pin "${module.name}": its configure factory returns a promise, so it cannot be resolved synchronously.`,
      );
    }
    this.#configurators.set(module.name, instance);
    const pinnedModule = { ...module, configure: () => instance } as TModule;
    this.#pinnedModules.set(module.name, pinnedModule);
    this.addConfig({ module: pinnedModule });
  }

  /**
   * Returns the configurator pinned for a module by name.
   *
   * @param name - The module's name, as passed to {@link _pin}.
   * @template TConfig - The specific configurator type expected for this module.
   * @returns The configurator pinned under `name`.
   * @throws {Error} If no configurator has been pinned for that name.
   */
  protected _getConfig<TConfig>(name: string): TConfig {
    const config = this.#configurators.get(name);
    // A missing entry means _pin was never called for this module name
    if (config === undefined) {
      throw new Error(
        `No configurator is pinned for module "${name}" — call this._pin(module) before this._getConfig("${name}").`,
      );
    }
    return config as TConfig;
  }

  /**
   * Configures the app's named HTTP clients.
   *
   * @remarks
   * The same {@link IHttpClientConfigurator} the `http` module is configured
   * from — the real one, not a test double. Every client it builds —
   * including ones registered through
   * {@link AppConfigurator.configureHttpClient} or
   * {@link AppConfigurator.useFrameworkServiceClient} — is reachable here to
   * register a short-circuiting {@link HttpMiddleware} through
   * `addMiddleware`, so it answers from that instead of the network.
   *
   * @returns The real HTTP configurator.
   */
  public get http(): IHttpClientConfigurator {
    return this._getConfig<IHttpClientConfigurator>(http.name);
  }

  /**
   * Configures the user the app's `msal` module signs in.
   *
   * @remarks
   * The same {@link MsalMockConfigurator} the `msal` module is configured from,
   * so a change made here is what the module sees.
   *
   * @returns The MSAL mock configurator.
   */
  public get msal(): MsalMockConfigurator {
    return this._getConfig<MsalMockConfigurator>(msalMockModule.name);
  }
}

export default AppMockConfigurator;
