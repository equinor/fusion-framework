import type { AnyModule } from '@equinor/fusion-framework-module';

import {
  contextMockModule,
  type ContextMockConfigurator,
} from '@equinor/fusion-framework-module-context/mock';
import {
  module as httpModule,
  type IHttpClientConfigurator,
} from '@equinor/fusion-framework-module-http';
import {
  msalMockModule,
  type MsalMockConfigurator,
} from '@equinor/fusion-framework-module-msal/mock';
import {
  serviceDiscoveryMockModule,
  type ServiceDiscoveryMockConfigurator,
} from '@equinor/fusion-framework-module-service-discovery/mock';
import servicesModule, { type IApiConfigurator } from '@equinor/fusion-framework-module-services';
import {
  telemetryMockModule,
  type TelemetryMockConfigurator,
} from '@equinor/fusion-framework-module-telemetry/mock';

import { FrameworkConfigurator } from '../FrameworkConfigurator.js';

/**
 * The real framework configurator, with every built-in module that reaches
 * outside the process backed by a test double, and every other built-in
 * module reachable the same way.
 *
 * @remarks
 * Nothing else changes: the same module set, the same configuration pipeline and
 * the same lifecycle are used. Only the boundaries that would need credentials or
 * network access are substituted, so a test still exercises module wiring,
 * configuration validation and lifecycle hooks.
 *
 * Every built-in module exposes its own configurator as a property, so a test
 * reaches it directly instead of registering a callback to receive it. `http`
 * is the real configurator — fake a response by registering a
 * short-circuiting middleware through `.http.addMiddleware(...)` instead of
 * swapping the module out; see `@equinor/fusion-framework-module-http/mock`'s
 * `createOpenApiMockMiddleware` for faking a whole `@equinor/fusion-openapi-mock`
 * document that way. `services` is not backed by a test double yet either, so
 * calls through its configurator still reach the network — but
 * the configurator itself is reachable the same way `.msal` is, since its
 * `configure` factory takes no `ref` and so loses nothing by being pinned early.
 *
 * `event` is deliberately not pinned: its `configure` factory reads `ref` to
 * wire bubbling to a parent event provider when this configurator is hoisted
 * inside a host framework, and pinning would freeze that decision before a
 * `ref` could ever be known.
 *
 * Because this *is* a `FrameworkConfigurator`, every `enableX` helper an
 * application already uses accepts it unchanged — including the ones an
 * application team writes for their own modules.
 *
 * @typeParam TModules - Module descriptors beyond the built-in set. Supply this
 *   when a test registers application modules, so they are typed on the resulting
 *   instance.
 *
 * @example
 * ```typescript
 * const configurator = new FrameworkMockConfigurator();
 *
 * configurator.msal.setAccount({ name: 'Ada Lovelace' });
 * configurator.serviceDiscovery.setBaseUri('http://localhost:6669');
 *
 * const fusion = await init(configurator);
 * ```
 */
export class FrameworkMockConfigurator<
  TModules extends Array<AnyModule> = [],
> extends FrameworkConfigurator<TModules> {
  static override readonly className: string = 'FrameworkMockConfigurator';

  // Keyed by module name, so `_getConfig` can look a pinned configurator up
  // without needing the module descriptor again.
  #configurators = new Map<string, unknown>();

  /**
   * Creates a framework configurator backed by the built-in mock modules.
   */
  constructor() {
    super();

    // Pinning up front — rather than waiting for an accessor to be read — is
    // what replaces the modules `FrameworkConfigurator`'s own constructor
    // already registered, whether or not a test ever touches the accessor.
    this._pin(msalMockModule);
    this._pin(serviceDiscoveryMockModule);
    this._pin(httpModule);
    this._pin(servicesModule);
    this._pin(contextMockModule);
    this._pin(telemetryMockModule);
  }

  /**
   * Pins a module to a single configurator instance for the lifetime of this
   * configurator, so it can be reached by name through {@link _getConfig}.
   *
   * @remarks
   * The module system otherwise builds a fresh configurator from its own
   * `configure` factory during the configure phase — too late for a test to
   * reach, and a new instance on every call besides. This replaces that
   * factory with one that always returns the same instance, and registers the
   * result under the module's own name.
   *
   * A subclass registering a module supplied through {@link TModules} uses
   * this the same way `.msal` and `.serviceDiscovery` do, to expose its own
   * named accessor:
   *
   * ```typescript
   * class MyMockConfigurator extends FrameworkMockConfigurator<[InvoiceModule]> {
   *   constructor() {
   *     super();
   *     this._pin(invoiceMockModule);
   *   }
   *
   *   public get invoices(): InvoiceMockConfigurator {
   *     return this._getConfig('invoices');
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
    this.addConfig({ module: { ...module, configure: () => instance } as TModule });
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
   * Configures the user the framework signs in.
   *
   * @remarks
   * The same {@link MsalMockConfigurator} the auth module is configured from, so
   * a change made here is what the module sees.
   *
   * @returns The MSAL mock configurator.
   */
  public get msal(): MsalMockConfigurator {
    return this._getConfig<MsalMockConfigurator>(msalMockModule.name);
  }

  /**
   * Configures the registry services are resolved from.
   *
   * @remarks
   * The same {@link ServiceDiscoveryMockConfigurator} the service discovery
   * module is configured from, so a change made here is what the module sees.
   *
   * @returns The service discovery mock configurator.
   */
  public get serviceDiscovery(): ServiceDiscoveryMockConfigurator {
    return this._getConfig<ServiceDiscoveryMockConfigurator>(serviceDiscoveryMockModule.name);
  }

  /**
   * Configures the HTTP module's named clients.
   *
   * @remarks
   * The same {@link IHttpClientConfigurator} the HTTP module is configured
   * from — the real one, not a test double. Register a short-circuiting
   * {@link HttpMiddleware} through `addMiddleware` to answer from that
   * instead of the network.
   *
   * @returns The real HTTP configurator.
   */
  public get http(): IHttpClientConfigurator {
    return this._getConfig<IHttpClientConfigurator>(httpModule.name);
  }

  /**
   * Configures the typed API clients the `services` module builds.
   *
   * @remarks
   * The real configurator — `services` has no test double yet.
   *
   * @returns The real API configurator.
   */
  public get services(): IApiConfigurator {
    return this._getConfig<IApiConfigurator>(servicesModule.name);
  }

  /**
   * Configures context resolution.
   *
   * @remarks
   * The same {@link ContextMockConfigurator} the context module is configured
   * from, so seeding an item here is what `fusion.modules.context` resolves.
   *
   * @returns The context mock configurator.
   */
  public get context(): ContextMockConfigurator {
    return this._getConfig<ContextMockConfigurator>(contextMockModule.name);
  }

  /**
   * Configures telemetry.
   *
   * @remarks
   * The same {@link TelemetryMockConfigurator} the telemetry module is
   * configured from, so a tracked event or measurement can be read back from
   * its adapter instead of reaching Application Insights.
   *
   * @returns The telemetry mock configurator.
   */
  public get telemetry(): TelemetryMockConfigurator {
    return this._getConfig<TelemetryMockConfigurator>(telemetryMockModule.name);
  }

  /**
   * Registers a module through its own enabler.
   *
   * @remarks
   * Sugar for calling the enabler directly — `enableMyModuleMock(configurator)`
   * works just as well, because this class *is* a `FrameworkConfigurator`. Use
   * whichever reads better at the call site.
   *
   * @param configure - Callback receiving this configurator.
   * @returns This configurator, for chaining.
   *
   * @example
   * ```typescript
   * configurator.addModule((c) => enableMyModuleMock(c, { total: 42 }));
   * ```
   */
  public addModule(configure: (configurator: this) => void): this {
    configure(this);
    return this;
  }
}

export default FrameworkMockConfigurator;
