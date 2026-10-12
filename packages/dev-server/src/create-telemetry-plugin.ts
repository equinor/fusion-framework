import type { Plugin } from 'vite';
import type { ILogger } from '@equinor/fusion-log';

const telemetryPath = '/@fusion-telemetry';

/**
 * Enables browser OTLP logs and traces only while serving a Fusion application.
 *
 * The endpoint stays in Node; a same-origin route avoids requiring collector CORS.
 *
 * @param logger - Dev-server logger used to report the first delivery failure.
 * @returns A serve-only Vite plugin controlled by `FUSION_DEV_SERVER_OTLP_ENDPOINT`.
 * @throws {Error} During configuration when the endpoint is not a valid HTTP(S) URL.
 * @example
 * ```ts
 * const plugin = createTelemetryPlugin(logger);
 * ```
 */
export function createTelemetryPlugin(logger: ILogger): Plugin {
  let logsEndpoint: URL | undefined;
  let tracesEndpoint: URL | undefined;
  let reportedFailure = false;

  return {
    name: 'fusion-dev-server-telemetry',
    apply: 'serve',
    config() {
      const value = process.env.FUSION_DEV_SERVER_OTLP_ENDPOINT;
      logsEndpoint = undefined;
      tracesEndpoint = undefined;
      // An absent endpoint must leave browser telemetry and routing disabled.
      if (value) {
        const endpoint = new URL(value);
        // Local collector authentication and non-HTTP transports are outside this integration.
        if (
          !['http:', 'https:'].includes(endpoint.protocol) ||
          endpoint.username ||
          endpoint.password
        ) {
          throw new Error(
            'FUSION_DEV_SERVER_OTLP_ENDPOINT must be an HTTP(S) URL without credentials',
          );
        }
        // One collector URL configures both signals; retain the conventional /v1/logs spelling.
        // A bare origin has pathname "/", so trim slashes before appending the signal path.
        const basePath = endpoint.pathname
          .replace(/\/v1\/(?:logs|traces)\/?$/, '')
          .replace(/\/+$/, '');
        logsEndpoint = new URL(`${basePath}/v1/logs${endpoint.search}`, endpoint);
        tracesEndpoint = new URL(`${basePath}/v1/traces${endpoint.search}`, endpoint);
      }
      return {
        define: {
          'import.meta.env.FUSION_SPA_TELEMETRY_OTLP_ENDPOINT': JSON.stringify(
            logsEndpoint ? `${telemetryPath}/v1/logs` : '',
          ),
          'import.meta.env.FUSION_SPA_TELEMETRY_OTLP_TRACES_ENDPOINT': JSON.stringify(
            tracesEndpoint ? `${telemetryPath}/v1/traces` : '',
          ),
        },
      };
    },
    configureServer(server) {
      const logs = logsEndpoint;
      const traces = tracesEndpoint;
      // Do not install a collection route when development export is disabled.
      if (!logs || !traces) {
        return;
      }
      server.middlewares.use(telemetryPath, async (request, response) => {
        const path = new URL(request.url ?? '/', 'http://localhost').pathname;
        const target = path === '/v1/logs' ? logs : path === '/v1/traces' ? traces : undefined;
        // Keep the proxy limited to the two collector signals it owns.
        if (!target) {
          response.statusCode = 404;
          response.end();
          return;
        }
        // OTLP/HTTP signals are POST-only; do not expose collector behavior for other methods.
        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.setHeader('Allow', 'POST');
          response.end();
          return;
        }
        try {
          const chunks: Buffer[] = [];
          let size = 0;
          // Bound memory use independently of the browser's declared content length.
          for await (const chunk of request) {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            size += buffer.length;
            // Reject oversized requests before allocating a combined payload.
            if (size > 1_048_576) {
              response.statusCode = 413;
              response.end();
              return;
            }
            chunks.push(buffer);
          }
          const result = await fetch(target, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: Buffer.concat(chunks).toString('utf8'),
            signal: AbortSignal.timeout(5_000),
            redirect: 'error',
          });
          // HTTP rejections are delivery failures just like connection errors.
          if (!result.ok) {
            await result.body?.cancel();
            throw new Error(`OTLP collector returned HTTP ${result.status}`);
          }
          response.statusCode = result.status;
          response.setHeader('content-type', 'application/json');
          response.end(await result.text());
        } catch (error) {
          // Collector outages must not terminate the server or spam terminal output.
          if (!reportedFailure) {
            reportedFailure = true;
            logger.error(
              'Dev-server OTLP delivery failed; the application will continue running.',
              error,
            );
          }
          response.statusCode = 502;
          response.end();
        }
      });
    },
  };
}
