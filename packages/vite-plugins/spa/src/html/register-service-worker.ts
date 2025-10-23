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

  /**
   * Helper function to send configuration to the service worker
   */
  const sendConfigToServiceWorker = (worker: ServiceWorker) => {
    worker.postMessage({
      type: 'INIT_CONFIG',
      config: resourceConfigs,
    });
  };

  try {
    // allow the service worker to start receiving messages early
    navigator.serviceWorker.startMessages();

    // listen for messages from the service worker (set up before registration)
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
          const token = await framework.auth.acquireToken({ request: { scopes } });

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

    // register the service worker with telemetry
    // updateViaCache: 'none' ensures the service worker script is always fetched fresh
    // This is important during development to pick up code changes
    using measurement = telemetry.measure({
      name: 'registerServiceWorker',
      level: TelemetryLevel.Information,
    });
    const registration = await measurement.clone().resolve(
      navigator.serviceWorker.register('/@fusion-spa-sw.js', {
        type: 'module',
        scope: '/',
        updateViaCache: 'none',
      }),
      {
        data: {
          name: 'registerServiceWorker.register',
          level: TelemetryLevel.Debug,
        },
      },
    );

    // Handle service worker updates/installations
    // If there's a service worker waiting or installing, send config when it activates
    if (registration.waiting) {
      sendConfigToServiceWorker(registration.waiting);
    }
    if (registration.installing) {
      registration.installing.addEventListener('statechange', (event) => {
        const worker = event.target as ServiceWorker;
        if (worker.state === 'activated') {
          sendConfigToServiceWorker(worker);
        }
      });
    }

    // Listen for controller changes (happens during hard refresh or updates)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (navigator.serviceWorker.controller) {
        sendConfigToServiceWorker(navigator.serviceWorker.controller);
      }
    });

    // wait for the service worker to be ready
    const readyRegistration = await measurement.clone().resolve(navigator.serviceWorker.ready, {
      data: {
        name: 'registerServiceWorker.ready',
        level: TelemetryLevel.Debug,
      },
    });

    // ensure we have an active service worker before sending config
    const activeWorker = readyRegistration.active;
    if (!activeWorker) {
      console.error('[Service Worker Registration] Service worker is not active after ready state');
      return;
    }

    // CRITICAL: Wait for the service worker to become the controller
    // This ensures the service worker can intercept fetch requests
    if (!navigator.serviceWorker.controller) {
      await measurement.clone().resolve(
        new Promise<void>((resolve) => {
          let checkInterval: NodeJS.Timeout;

          const finish = () => {
            clearInterval(checkInterval);
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
            resolve();
          };

          const onControllerChange = () => finish();

          // If controllerchange fires, the service worker has taken control
          navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

          // Polling fallback and timeout to prevent infinite waiting
          checkInterval = setInterval(() => {
            if (navigator.serviceWorker.controller) finish();
          }, 200);

          setTimeout(finish, 5000);
        }),
        {
          data: {
            name: 'registerServiceWorker.controllerWait',
            level: TelemetryLevel.Debug,
          },
        },
      );
    }

    // send the config to the active service worker
    sendConfigToServiceWorker(activeWorker);

    // Also send to the controller if it exists and is different from active
    if (navigator.serviceWorker.controller && navigator.serviceWorker.controller !== activeWorker) {
      sendConfigToServiceWorker(navigator.serviceWorker.controller);
    }
  } catch (error) {
    telemetry.trackException({
      name: `registerServiceWorker.${(error as Error).name}`,
      exception: error as Error,
    });
  }
}
