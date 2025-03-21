import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import type { PortalFramework } from './types';

const executeSignIn = (client: IHttpClient) =>
  client.fetch('api-signin', { method: 'POST', credentials: 'include' });

export const legacySignIn = async (framework: PortalFramework) =>
  Promise.all([
    framework.modules.serviceDiscovery.createClient('people').then(executeSignIn),
    framework.modules.serviceDiscovery.createClient('data-proxy').then(executeSignIn),
  ]);

export default legacySignIn;
