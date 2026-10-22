import type { AnyModule, ModulesConfigurator } from '@equinor/fusion-framework-module';
import type { IHttpClientConfigurator } from '@equinor/fusion-framework-module-http';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import { createHttpTelemetry } from '@equinor/fusion-framework-module-telemetry/integrations';

/**
 * Instruments every HTTP client the host's HTTP module builds with transport-attempt telemetry.
 *
 * The middleware is appended after all configuration callbacks have run, so it is the
 * innermost configurator-level middleware: retry or caching middleware registered by
 * applications wraps it, and each actual fetch attempt produces one
 * `fusion.http.request.duration` record. Clients configured with their own
 * `middlewareHandler` replace the configurator middleware and are not instrumented.
 *
 * Telemetry is resolved after initialization through a plugin, so HTTP never waits for
 * telemetry and requests issued while modules initialize are not recorded. The plugin
 * teardown detaches instrumentation before modules dispose, without aborting requests.
 *
 * @param configurator - Host configurator owning the HTTP and telemetry modules.
 * @template TModules - Modules registered on the host configurator.
 * @template TRef - Reference type forwarded to module initialization.
 */
export function connectHttpTelemetry<TModules extends Array<AnyModule>, TRef>(
  configurator: ModulesConfigurator<TModules, TRef>,
): void {
  let telemetry: ITelemetryProvider | undefined;
  const diagnostics = createHttpTelemetry(() => telemetry);
  configurator.onConfigured((config) => {
    const http = (config as { http?: IHttpClientConfigurator }).http;
    // A host without an HTTP module has no transport to observe.
    http?.addMiddleware(diagnostics.middleware);
  });
  configurator.registerPlugin(({ modules }) => {
    telemetry = (modules as { telemetry?: ITelemetryProvider }).telemetry;
    return () => {
      diagnostics.dispose();
      telemetry = undefined;
    };
  });
}

export default connectHttpTelemetry;
