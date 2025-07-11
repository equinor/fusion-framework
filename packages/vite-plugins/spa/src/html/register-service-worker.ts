import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import { TelemetryLevel, type TelemetryModule } from '@equinor/fusion-framework-module-telemetry';

export async function registerServiceWorker(
  framework: ModulesInstance<[MsalModule, TelemetryModule]>,
) {
  const telemetry = framework.telemetry;
  if ('serviceWorker' in navigator === false) {
    const exception = new Error('Service workers are not supported in this browser.');
    exception.name = 'ServiceWorkerNotSupported';
    telemetry.trackException({
      name: `registerServiceWorker.${exception.name}`,
      exception,
    });
    throw exception;
  }

  const resourceConfigs = import.meta.env.FUSION_SPA_SERVICE_WORKER_RESOURCES;
  if (!resourceConfigs) {
    const exception = new Error('Service worker config is not defined.');
    exception.name = 'ServiceWorkerConfigNotDefined';
    telemetry.trackException({
      name: `registerServiceWorker.${exception.name}`,
      exception,
    });
    throw exception;
  }

  try {
    // register the service worker
    using measurement = telemetry.measure({
      name: 'registerServiceWorker',
      level: TelemetryLevel.Information,
    });
    const registration = await measurement.clone().resolve(
      navigator.serviceWorker.register('/@fusion-spa-sw.js', {
        type: 'module',
        scope: '/',
      }),
      {
        data: {
          name: 'registerServiceWorker.register',
          level: TelemetryLevel.Debug,
        },
      },
    );

    // wait for the service worker to be ready
    await measurement.clone().resolve(navigator.serviceWorker.ready, {
      data: {
        name: 'registerServiceWorker.ready',
        level: TelemetryLevel.Debug,
      },
    });

    // allow the service worker to start receiving messages
    navigator.serviceWorker.startMessages();

    // send the config to the service worker
    registration.active?.postMessage({
      type: 'INIT_CONFIG',
      config: resourceConfigs,
    });

    // listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.data.type === 'GET_TOKEN') {
        try {
          // extract scopes from the event data
          const scopes = event.data.scopes as string[];
          if (!scopes || !Array.isArray(scopes)) {
            const error = new Error('Invalid scopes provided');
            error.name = 'InvalidScopesProvided';
            throw error;
          }

          // request a token from the MSAL module
          const token = await framework.auth.acquireToken({ scopes });

          if (!token) {
            const error = new Error('Failed to acquire token');
            error.name = 'FailedToAcquireToken';

            throw error;
          }

          // send the token back to the service worker
          event.ports[0].postMessage({
            accessToken: token.accessToken,
            expiresOn: token.expiresOn?.getTime(),
          });
        } catch (error) {
          const exception = error as Error;
          telemetry.trackException({
            name: `serviceWorker.onMessage.${exception.name}`,
            exception,
          });
          event.ports[0].postMessage({
            error: (error as Error).message,
          });
        }
      }
    });
  } catch (error) {
    telemetry.trackException({
      name: `registerServiceWorker.${(error as Error).name}`,
      exception: error as Error,
    });
  }
}
