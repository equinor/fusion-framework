import dotenv from 'dotenv';
import { createDevServer, processServices } from '@equinor/fusion-framework-dev-server';

import { name } from './package.json' assert { type: 'json' };

dotenv.config();

console.log(process.env);

const clientId = process.env.FUSION_MSAL_CLIENT_ID;
const tenantId = process.env.FUSION_MSAL_TENANT_ID;
const serviceDiscoveryUrl = process.env.FUSION_SERVICE_DISCOVERY_URL;
const serviceScopes = JSON.parse(process.env.FUSION_SERVICE_SCOPE || '[]') as string[];

if (!clientId) {
  throw new Error('FUSION_MSAL_CLIENT_ID is not set');
}
if (!tenantId) {
  throw new Error('FUSION_MSAL_TENANT_ID is not set');
}
if (!serviceDiscoveryUrl) {
  throw new Error('SERVICE_DISCOVERY_URL is not set');
}
if (serviceScopes.length === 0) {
  throw new Error('SERVICE_SCOPES is not set');
}

(async () => {
  const devServer = await createDevServer({
    spa: {
      templateEnv: {
        portal: {
          id: name,
        },
        title: 'Fusion SPA',
        serviceDiscovery: {
          url: '/@fusion-services',
          scopes: serviceScopes,
        },
        msal: {
          clientId,
          tenantId,
          redirectUri: '/authentication/login-callback',
          requiresAuth: 'true',
        },
        serviceWorker: {
          resources: [
            {
              url: '/apps-proxy',
              rewrite: '/@fusion-api/apps',
              scopes: serviceScopes,
            },
            {
              url: '/help-proxy',
              rewrite: '/@fusion-api/help',
              scopes: serviceScopes,
            },
          ],
        },
      },
    },
    api: {
      serviceDiscoveryUrl,
      processServices: (dataResponse, route) => {
        const { data, routes } = processServices(dataResponse, route);
        return {
          data: data.concat({
            key: 'portals',
            name: 'Portal Service - MOCK',
            uri: '/@fusion-api/portals',
          }),
          routes,
        };
      },
      routes: [
        {
          match: `/portals/portals/${name}{@:tag}`,
          middleware: async (req, res) => {
            const url = new URL('/src/main.tsx', req.headers.referer);
            res.writeHead(200, {
              'content-type': 'application/json',
            });
            res.end(
              JSON.stringify({
                build: {
                  config: {},
                  entrypoint: url,
                },
              }),
            );
          },
        },
      ],
    },
  });
  await devServer.listen();
  devServer.printUrls();
})();
