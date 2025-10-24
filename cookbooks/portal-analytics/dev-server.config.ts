import { defineDevServerConfig, processServices } from '@equinor/fusion-framework-cli/dev-server';
import { appendFileContents, readBody, readFileContents } from './middleware/logs';

const LOG_FILE = './otel-logs/log.txt';

export default defineDevServerConfig(() => {
  return {
    api: {
      processServices: (data, args) => {
        const existingServices = processServices(data, args);

        const routes = existingServices.routes || [];
        routes.push(
          {
            match: '/logs',
            middleware: async (_req, res) => {
              res.setHeader('Content-Type', 'text/plain');
              res.end(await readFileContents(LOG_FILE));
            },
          },
          {
            match: '/api/logs',
            middleware: async (req, res) => {
              const body = await readBody(req);
              try {
                appendFileContents(LOG_FILE, body);
              } catch (err) {
                res.statusCode = 500;
                res.end(err);
              }
              res.end(JSON.stringify({ partialSuccess: {} }));
            },
          },
        );

        existingServices.routes = routes;

        return existingServices;
      },
    },
  };
});
