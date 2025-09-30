import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';

export async function registerServiceWorker(framework: ModulesInstance<[MsalModule]>) {
  if ('serviceWorker' in navigator === false) {
    console.warn('Service workers are not supported in this browser.');
    return;
  }

  const resourceConfigs = import.meta.env.FUSION_SPA_SERVICE_WORKER_RESOURCES;
  if (!resourceConfigs) {
    console.warn('Service worker config is not defined.');
    return;
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
            throw new Error('Invalid scopes provided');
          }

          // request a token from the MSAL module
          const token = await framework.auth.acquireToken({ scopes });

          if (!token) {
            throw new Error('Failed to acquire token');
          }

          // send the token back to the service worker
          event.ports[0].postMessage({
            accessToken: token.accessToken,
            expiresOn: token.expiresOn?.getTime(),
          });
        } catch (error) {
          event.ports[0].postMessage({
            error: (error as Error).message,
          });
        }
      }
    });

    // register the service worker
    // updateViaCache: 'none' ensures the service worker script is always fetched fresh
    // This is important during development to pick up code changes
    const registration = await navigator.serviceWorker.register('/@fusion-spa-sw.js', {
      type: 'module',
      scope: '/',
      updateViaCache: 'none',
    });

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
    const readyRegistration = await navigator.serviceWorker.ready;

    // ensure we have an active service worker before sending config
    const activeWorker = readyRegistration.active;
    if (!activeWorker) {
      console.error('[Service Worker Registration] Service worker is not active after ready state');
      return;
    }

    // CRITICAL: Wait for the service worker to become the controller
    // This ensures the service worker can intercept fetch requests
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        const onControllerChange = () => {
          clearInterval(checkInterval);
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
          resolve();
        };
        // If controllerchange fires, the service worker has taken control
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

        // Polling fallback and timeout to prevent infinite waiting
        const checkInterval = setInterval(() => {
          if (navigator.serviceWorker.controller) {
            clearInterval(checkInterval);
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
            resolve();
          }
        }, 50);

        setTimeout(() => {
          clearInterval(checkInterval);
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
          resolve();
        }, 5000);
      });
    }

    // send the config to the active service worker
    sendConfigToServiceWorker(activeWorker);

    // Also send to the controller if it exists and is different from active
    if (navigator.serviceWorker.controller && navigator.serviceWorker.controller !== activeWorker) {
      sendConfigToServiceWorker(navigator.serviceWorker.controller);
    }
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}
