import { defineDevServerConfig } from '@equinor/fusion-framework-cli/dev-server';

/**
 * Provides local diagnostic fixtures, not a production API. Only explicit button clicks use
 * these routes, so ordinary app startup and requests retain their normal behavior.
 */
export default defineDevServerConfig(() => ({
  api: {
    routes: [
      {
        match: '/__telemetry-cookbook/failure',
        middleware: (_request, response) => {
          response.statusCode = 503;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ scenario: 'controlled-failure' }));
        },
      },
      {
        match: '/__telemetry-cookbook/slow',
        middleware: (_request, response) => {
          // Delay the response headers so fetch timing includes the entire fixture delay.
          const timer = setTimeout(() => {
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ scenario: 'controlled-delay' }));
          }, 1_500);
          response.once('close', () => clearTimeout(timer));
        },
      },
    ],
  },
}));
