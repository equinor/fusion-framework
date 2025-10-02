import {
  type AnyModule,
  ModulesConfigurator,
  type ModuleEvent,
} from '@equinor/fusion-framework-module';

import event from '@equinor/fusion-framework-module-event';

import http, {
  configureHttpClient,
  configureHttp,
  type HttpClientOptions,
} from '@equinor/fusion-framework-module-http';
import type { HttpClientMsal } from '@equinor/fusion-framework-module-http/client';

import auth, { type AuthConfigFn } from '@equinor/fusion-framework-module-msal';

import context from '@equinor/fusion-framework-module-context';

import disco from '@equinor/fusion-framework-module-service-discovery';
import services from '@equinor/fusion-framework-module-services';
import telemetry, { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';

import type { FusionModules } from './types.js';
import type { AuthClientConfig } from '@equinor/fusion-framework-module-msal/v2';
import { version } from './version.js';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

/**
 * Module configurator for Framework modules
 * @template TModules - Addition modules
 * @template TRef - usually undefined, optional references
 */
export class FrameworkConfigurator<
  TModules extends Array<AnyModule> = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TRef = any,
> extends ModulesConfigurator<FusionModules<TModules>, TRef> {
  constructor() {
    super([event, auth, http, disco, services, context, telemetry]);

    // default configuration
    enableTelemetry(this, {
      configure: (builder) => {
        builder.setMetadata({
          fusion: {
            type: 'framework-telemetry',
            framework: {
              version,
            },
          },
        });
        builder.setDefaultScope(['framework']);
      },
    });
  }

  public configureHttp(...args: Parameters<typeof configureHttp>) {
    this.addConfig(configureHttp(...args));
  }

  public configureHttpClient(...args: Parameters<typeof configureHttpClient>) {
    this.addConfig(configureHttpClient(...args));
  }

  public configureMsal(cb_or_config: AuthConfigFn | AuthClientConfig, requiresAuth = true) {
    this.addConfig({
      module: auth,
      configure: (builder) => {
        if (requiresAuth !== undefined) {
          builder.setRequiresAuth(!!requiresAuth);
        }
        if (typeof cb_or_config === 'function') {
          cb_or_config(builder);
        }
        if (typeof cb_or_config === 'object') {
          builder.setClientConfig(cb_or_config);
        }
      },
    });
  }

  public configureServiceDiscovery(args: { client: HttpClientOptions<HttpClientMsal> }) {
    this.configureHttpClient('service_discovery', args.client);
  }

  public configureTelemetry(cb: Parameters<typeof enableTelemetry>[1]): void {
    enableTelemetry(this, cb);
  }
}

export default FrameworkConfigurator;
