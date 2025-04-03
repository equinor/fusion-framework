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

  try {
    // register the service worker
    const registration = await navigator.serviceWorker.register('/@fusion-spa-sw.js', {
      type: 'module',
      scope: '/',
    });

    // wait for the service worker to be ready
    await navigator.serviceWorker.ready;

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
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}
