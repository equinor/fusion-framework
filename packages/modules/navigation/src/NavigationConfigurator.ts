import { z } from 'zod';
import { of, from, type ObservableInput } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  BaseConfigBuilder,
  type ModulesInstance,
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import type { INavigationConfigurator } from './NavigationConfigurator.interface.js';

import type { History, NavigationUpdate, To } from './lib/types.js';
import { createHistory } from './lib/create-history.js';
import { ProxyHistory } from './lib/ProxyHistory.js';
import { normalizeBasename, resolvePath } from './lib/utils/index.js';
import { Action } from './lib/types.js';
import { assertNavigationInitiator } from './assert-navigation-initiator.js';
import type { NavigationInitiator } from './NavigationInitiator.js';
import { NavigationInitiatorConflictError } from './NavigationInitiatorConflictError.js';
import type { NavigationModule } from './module.js';

/**
 * Zod schema for navigation module configuration validation.
 *
 * @internal
 */
const navigationConfigSchema = z
  .object({
    basename: z
      .string()
      .optional()
      .describe(
        'Base pathname for the application (e.g., "/app"). Must match the URL path prefix where your app is served. The router requires the pathname to start with this basename.',
      ),
    history: z
      .custom<History>()
      .describe(
        'Custom history instance implementing the History interface. Defaults to browser history if not provided. Use createHistory("browser"|"hash"|"memory") to create instances.',
      ),
    telemetry: z
      .custom<ITelemetryProvider>()
      .optional()
      .describe(
        'Telemetry provider for tracking navigation events. Used to log navigation actions, location changes, and errors for monitoring and debugging.',
      ),
    eventProvider: z
      .custom<IEventModuleProvider>()
      .optional()
      .describe(
        'Event provider for dispatching navigation events (NavigateEvent, NavigatedEvent). Allows other modules to listen for navigation changes and block navigation attempts.',
      ),
  })
  .describe(
    'Validates navigation module configuration settings for routing and navigation capabilities.',
  );

/**
 * Parses and validates a navigation configuration object.
 *
 * @param config - The configuration object to parse
 * @returns Validated navigation configuration
 * @throws {z.ZodError} If the configuration is invalid
 */
const parseNavigationConfig = (config: unknown): INavigationConfigurator => {
  return navigationConfigSchema.parse(config);
};

/**
 * Creates the initial memory history entry, scoped to the basename.
 *
 * @param basename - Final (explicit or initiator) basename
 * @param initialLocation - App-relative location; defaults to the app root
 * @returns The initial navigation update for a memory history
 */
const createInitialUpdate = (
  basename: string | undefined,
  initialLocation: To = '/',
): NavigationUpdate => {
  const base = basename ? normalizeBasename(basename) : '';
  const path = resolvePath(initialLocation);
  // A location already inside the basename is used as given; otherwise it is scoped to the basename.
  const isScoped = base !== '' && (path.pathname === base || path.pathname.startsWith(`${base}/`));
  const pathname = isScoped
    ? path.pathname
    : `${base}${path.pathname === '/' ? '' : path.pathname}` || '/';
  return {
    action: Action.Pop,
    delta: 0,
    location: { ...path, pathname, state: null, key: 'initial', unstable_mask: undefined },
  };
};

/**
 * Configurator class for navigation module settings.
 * Extends BaseConfigBuilder to provide fluent configuration API with Zod validation.
 */
export class NavigationConfigurator extends BaseConfigBuilder<INavigationConfigurator> {
  /** Strategy supplied by the app/widget initiator. */
  #initiator?: NavigationInitiator;
  /** Whether the app configured the basename explicitly. */
  #explicitBasename = false;
  /** Whether the app configured the history explicitly, and the raw history it supplied. */
  #explicitHistory = false;
  #explicitHistoryValue?: History;

  /** Creates a navigation configurator with default history and event providers. */
  constructor() {
    super();
    this.setEventProvider(async (args) => {
      // Only resolve the optional provider when the event module participates in this framework.
      if (args.hasModule('event')) {
        return await args.requireInstance('event');
      }
    });
    // Lowest-precedence basename: the initiator's. Explicit `setBasename` replaces this callback.
    this._set('basename', async () => this.#initiator?.basename);
    // Lowest-precedence history. Assigned with `_set` so it is not recorded as explicit app configuration.
    this._set('history', async (args) => {
      // Host history stays host-owned: only a disposable proxy is handed to the module.
      if (this.#initiator?.kind === 'host') {
        return new ProxyHistory(this.#initiator.history);
      }
      // Memory history is created in `_processConfig`, once the final basename is known.
      if (this.#initiator?.kind === 'memory') {
        return undefined;
      }
      const history = (args.ref as ModulesInstance<[NavigationModule]>)?.navigation?.history;
      // Wrap supplied history so the module owns only the proxy lifecycle.
      if (history) {
        // Wrap the provided history in a ProxyHistory to ensure the module can manage its own teardowns without affecting the original instance.
        return new ProxyHistory(history);
      }
      // Prefer browser history when a DOM is available, otherwise use memory history for SSR.
      // The default is owned by the module (not proxied), so provider disposal tears it down.
      if (typeof window !== 'undefined') {
        return createHistory('browser');
      }
      return createHistory('memory');
    });
  }

  /**
   * @deprecated Use `setBasename()` method instead
   * @param value - Deprecated basename value to configure.
   */
  public set basename(value: string | undefined) {
    // Warn only during development so deprecated setters remain silent in production.
    if (process.env.NODE_ENV === 'development') {
      console.warn('NavigationConfigurator.basename', 'use setBasename() method instead');
    }
    this.setBasename(value);
  }

  /**
   * @deprecated Use `setHistory()` method instead
   * @param value - Deprecated history value to configure.
   */
  public set history(value: History | undefined) {
    // Warn only during development so deprecated setters remain silent in production.
    if (process.env.NODE_ENV === 'development') {
      console.warn('NavigationConfigurator.history', 'use setHistory() method instead');
    }
    this.setHistory(value);
  }

  /**
   * Sets the basename for the application.
   *
   * @param basenameOrCallback - Basename string or configuration callback
   * @returns The configurator instance for method chaining
   */
  public setBasename(basenameOrCallback?: string | ConfigBuilderCallback<string>): this {
    const fn =
      typeof basenameOrCallback === 'function'
        ? basenameOrCallback
        : async () => basenameOrCallback;
    // Explicit app configuration outranks the initiator; conflicts are checked in `_processConfig`.
    this.#explicitBasename = true;
    this._set('basename', fn);
    return this;
  }

  /**
   * Sets a custom history instance for the navigation module.
   *
   * By default the resolved history is wrapped in a {@link ProxyHistory} so the
   * module gets its own disposable handle without owning (or accidentally
   * disposing) the original instance. Set `proxy` to `false` to use the
   * history as-is.
   *
   * @param historyOrCallback - History instance or configuration callback
   * @param options - Optional settings for history wrapping
   * @param options.proxy - Wrap the history in a {@link ProxyHistory} (default: `true`)
   * @returns The configurator instance for method chaining
   */
  public setHistory(
    historyOrCallback?: History | ConfigBuilderCallback<History>,
    options?: { proxy?: boolean },
  ): this {
    const { proxy = true } = options ?? {};
    const resolveHistory =
      typeof historyOrCallback === 'function'
        ? historyOrCallback
        : // Normalize a direct instance to a callback for consistent handling.
          async () => historyOrCallback;
    // Explicit app configuration outranks the initiator; keep the raw (unproxied) history so a
    // host-history conflict can be detected by identity in `_processConfig`.
    this.#explicitHistory = true;
    const resolve: ConfigBuilderCallback<History> = (args) =>
      // Capture the raw history before proxying so conflicts can be detected by identity
      from(resolveHistory(args) as ObservableInput<History | undefined>).pipe(
        tap((history) => {
          this.#explicitHistoryValue = history;
        }),
      );

    // Proxying isolates teardown ownership when callers provide an existing history instance.
    if (proxy) {
      // Wrap each emitted history in a ProxyHistory so dispose only tears down
      // proxy-owned listeners/blockers, never the underlying history itself.
      this._set('history', (args) =>
        from(resolve(args) as ObservableInput<History | undefined>)
          // Transform each resolved history into an independently disposable proxy.
          .pipe(map((history) => (history ? new ProxyHistory(history) : undefined))),
      );
      // Direct histories are already owned by the navigation module and can be used unchanged.
    } else {
      this._set('history', resolve);
    }
    return this;
  }

  /**
   * Sets the navigation strategy supplied by the initiator of the app or widget.
   *
   * Precedence is explicit app configuration ({@link setBasename}, {@link setHistory}),
   * then the initiator, then standalone browser defaults.
   *
   * - `host`: the app uses the host history (wrapped, never disposed by the module) and
   *   host basename. Explicit settings must be compatible with these; otherwise startup
   *   fails with a {@link NavigationInitiatorConflictError}.
   * - `memory`: a new memory history is created per module instance and disposed with it.
   *   `window.location` is neither read nor modified.
   *
   * @param initiator - Strategy supplied by the initiator, or `undefined` for standalone defaults
   * @returns The configurator instance for method chaining
   * @throws {TypeError} If the initiator is not a valid strategy
   */
  public setInitiator(initiator?: NavigationInitiator): this {
    // Only validate when a strategy is supplied; undefined means standalone defaults
    if (initiator !== undefined) {
      assertNavigationInitiator(initiator);
    }
    this.#initiator = initiator;
    return this;
  }

  /**
   * Sets telemetry configuration for navigation-specific events.
   *
   * @param telemetryOrCallback - Telemetry provider instance or configuration callback
   * @returns The configurator instance for method chaining
   */
  public setTelemetry(
    telemetryOrCallback: ITelemetryProvider | ConfigBuilderCallback<ITelemetryProvider>,
  ): this {
    const fn =
      typeof telemetryOrCallback === 'function'
        ? telemetryOrCallback
        : async () => telemetryOrCallback;
    this._set('telemetry', fn);
    return this;
  }

  /**
   * Sets event provider for dispatching navigation events.
   *
   * @param eventProviderOrCallback - Event provider instance or configuration callback
   * @returns The configurator instance for method chaining
   */
  public setEventProvider(
    eventProviderOrCallback: IEventModuleProvider | ConfigBuilderCallback<IEventModuleProvider>,
  ): this {
    const fn =
      typeof eventProviderOrCallback === 'function'
        ? eventProviderOrCallback
        : async () => eventProviderOrCallback;
    this._set('eventProvider', fn);
    return this;
  }

  /**
   * Processes and validates the configuration using Zod schema.
   *
   * @param config - Raw configuration object from builder
   * @param _init - Configuration builder callback arguments (unused)
   * @returns Observable that emits validated and processed configuration object
   * @throws {z.ZodError} If the configuration is invalid
   *
   * @protected
   */
  protected _processConfig(
    config: Partial<INavigationConfigurator>,
    _init: ConfigBuilderCallbackArgs,
  ): ObservableInput<INavigationConfigurator> {
    const initiator = this.#initiator;
    // An explicit `undefined` basename means "not specified" and must not drop the initiator's.
    const basename = config.basename ?? initiator?.basename;
    let history = config.history;

    // Host strategy constrains the app, so validate explicit settings against it
    if (initiator?.kind === 'host') {
      // The host owns the URL: the app must use the host basename and history.
      // Only an explicitly configured basename can conflict with the host's
      if (this.#explicitBasename && basename !== undefined) {
        // Compare normalized values so trailing/duplicate slashes do not cause false conflicts
        if (normalizeBasename(basename) !== normalizeBasename(initiator.basename)) {
          throw new NavigationInitiatorConflictError({
            setting: 'basename',
            explicit: `basename: '${basename}'`,
            required: `basename: '${initiator.basename}'`,
          });
        }
      }
      // Only an explicitly configured history can conflict with the host's
      if (this.#explicitHistory && this.#explicitHistoryValue) {
        // Identity comparison: any other instance would split history ownership
        if (this.#explicitHistoryValue !== initiator.history) {
          throw new NavigationInitiatorConflictError({
            setting: 'history',
            explicit: 'history: a history instance other than the host history',
            required: 'history: the host history',
          });
        }
      }
      // `setHistory(host, { proxy: false })` is a valid explicit setting, but the provider disposes
      // whatever history it receives; re-wrap so the host history can never be disposed by the app.
      if (history === initiator.history) {
        history = new ProxyHistory(initiator.history);
      }
    } else if (initiator?.kind === 'memory' && !history) {
      // Compose the app-relative initial location with the final basename (explicit or initiator).
      history = createHistory('memory', {
        initialLocation: createInitialUpdate(basename, initiator.initialLocation),
      });
    }

    return of(parseNavigationConfig({ ...config, basename, history }));
  }
}
