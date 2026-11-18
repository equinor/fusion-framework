import { readFile } from 'node:fs/promises';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const bootstrapEnv = {
  FUSION_SPA_SERVICE_DISCOVERY_URL: '/__bootstrap-test/discovery',
  FUSION_SPA_MSAL_MOCK: true,
  FUSION_SPA_SERVICE_WORKER_RESOURCES: [],
  FUSION_SPA_PORTAL_ID: 'test',
};

export default defineConfig({
  plugins: [
    {
      name: 'bootstrap-test-responses',
      configureServer(server) {
        // Serve the emitted modules without Vitest rewriting imports in the test iframe.
        server.middlewares.use('/__bootstrap-dist', async (request, response, next) => {
          const path = request.url?.split('?')[0];
          // Keep the test route constrained to emitted JavaScript modules.
          if (!path || !/^\/(?:html\/)?[\w-]+\.js$/.test(path)) {
            response.writeHead(404).end();
            return;
          }
          try {
            const source = await readFile(new URL(`./dist${path}`, import.meta.url), 'utf8');
            response.setHeader('content-type', 'text/javascript');
            // Apply the environment values normally supplied by Vite without touching syntax or imports.
            response.end(
              `import.meta.env = ${JSON.stringify(bootstrapEnv)};\n${source.replaceAll(
                'process.env.NODE_ENV',
                '"production"',
              )}`,
            );
          } catch (error) {
            next(error);
          }
        });
        server.middlewares.use('/__bootstrap-test', (request, response) => {
          const routes = {
            '/discovery/': [
              {
                key: 'portal-config',
                uri: `http://${request.headers.host}/__bootstrap-test/portal-config`,
              },
            ],
            '/portal-config/portals/test@latest': {
              build: { config: {}, templateEntry: '/__bootstrap-test/portal.js' },
            },
            '/portal-config/portals/test@latest/config': {},
          };
          // Give each test an isolated document and module registry.
          if (request.url === '/frame') {
            response.setHeader('content-type', 'text/html');
            response.end('<!doctype html><title>Bootstrap test</title><body></body>');
            return;
          }
          // The manifest points to a separately loaded portal module.
          if (request.url === '/portal.js') {
            response.setHeader('content-type', 'text/javascript');
            response.end(
              'export function render(root) { root.textContent = "Test portal rendered"; }',
            );
            return;
          }
          // Serve only the explicit mock API routes used by bootstrap.
          if (request.url && Object.hasOwn(routes, request.url)) {
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify(routes[request.url as keyof typeof routes]));
            return;
          }
          response.writeHead(404).end();
        });
      },
    },
  ],
  test: {
    include: ['tests/browser/**/*.browser.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }, { browser: 'webkit' }],
    },
  },
});
