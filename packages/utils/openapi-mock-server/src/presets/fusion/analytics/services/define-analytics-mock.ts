import type { IncomingMessage } from 'node:http';

import {
  defineService,
  type MockResponse,
  type ServiceMockDefinition,
} from '../../../../discovery/index.js';
import { AnalyticsStore, type AnalyticsStoreOptions } from '../store/index.js';
import { handleAnalyticsControl } from '../control/index.js';
import { isJsonObject } from '../utils/index.js';
import { resolveAnalyticsSender } from '../identity/index.js';

import schema from './monitor.openapi.json' with { type: 'json' };

/** Deepest JSON nesting the Monitor service reads (`JsonSerializerOptions.MaxDepth = 64`). */
const MAX_JSON_DEPTH = 64;

/** Options for {@link defineAnalyticsMock}. */
export interface DefineAnalyticsMockOptions extends AnalyticsStoreOptions {
  /** Service-discovery key the Monitor service is served under. Defaults to `monitor`. */
  key?: string;
  /**
   * Store to keep analytics in. Pass one store to several mocks — for example the app-feature
   * events query — so they share the same events. Created from the other options when omitted.
   */
  store?: AnalyticsStore;
}

/** The mock Monitor service definition, with the store that holds what it received. */
export interface AnalyticsMockDefinition extends ServiceMockDefinition {
  /** The analytics received by this service, plus any seeded history. */
  store: AnalyticsStore;
}

/**
 * Defines a mock Fusion Monitor service that receives the analytics a Fusion app sends, keeps
 * them, and reads them the way Fusion's analytics pipeline does — so tests and local pages can
 * check tracked app features without live services.
 *
 * @remarks
 * Serves `POST /v1/logs` under the `monitor` service key, where the framework analytics adapter
 * sends OpenTelemetry logs, and answers like the real Monitor service:
 *
 * - `202` when the batch is accepted;
 * - `400` for invalid JSON, JSON nested deeper than 64 levels, or a body without log entries;
 * - `401` without a signed-in user, and `415` when the body is not declared as `application/json`.
 *
 * Accepted entries get the sender's `user.id`, are appended to the optional recording file, and
 * are kept per mock-auth browser session in {@link AnalyticsMockDefinition.store}. Tests read and
 * clear them through `/@fusion-mock/analytics` (see `createMockAnalytics`). A browser
 * using the framework MSAL mock's startup identity (no mock-auth user selected) is accepted too,
 * as the `local-development` session. Resetting the mock server removes received events and
 * keeps seeded ones.
 *
 * @param options - Recording file, seed recordings, service key, or a shared store.
 * @returns A `monitor` service definition with its store.
 *
 * @example
 * ```typescript
 * // mocks/monitor.mock.ts
 * import { defineAnalyticsMock } from '@equinor/fusion-openapi-mock-server/presets/fusion';
 *
 * export default defineAnalyticsMock({
 *   record: '.fusion/analytics.jsonl',
 *   seed: ['recordings/analytics.jsonl'],
 * });
 * ```
 */
export function defineAnalyticsMock(
  options: DefineAnalyticsMockOptions = {},
): AnalyticsMockDefinition {
  const { key = 'monitor', store = new AnalyticsStore(options) } = options;

  const definition = defineService({
    key,
    serviceDiscovery: 'replace',
    // A scope makes the framework attach the mock user's token, as for the real service.
    scopes: [`${key}/.default`],
    schema,
    reset: () => store.reset(),
    control: { analytics: (request) => handleAnalyticsControl(store, request) },
    middleware: (router) => {
      router.post('/v1/logs', async (req, res, { body, identity }) => {
        const sender = resolveAnalyticsSender(req, identity);
        // The Monitor service requires a signed-in user before reading anything.
        if (!sender) {
          res.statusCode = 401;
          return res.json({
            error: { code: 'Unauthorized', message: 'A signed-in user is required.' },
          });
        }
        // The real endpoint only consumes JSON.
        if (!isJsonContent(req)) {
          res.statusCode = 415;
          return res.json({
            error: { code: 'UnsupportedMediaType', message: 'Expected application/json.' },
          });
        }
        const resourceLogs = exceedsJsonDepth(body, MAX_JSON_DEPTH)
          ? undefined
          : readResourceLogs(body);
        // Bodies the real service cannot deserialize are rejected as a whole.
        if (!resourceLogs) {
          return sendInvalidOperation(
            res,
            'Invalid json',
            'The body could not be read as OTLP logs.',
          );
        }
        // An empty batch is rejected, like the real service.
        if (resourceLogs.length === 0) {
          return sendInvalidOperation(res, 'InvalidOperation', 'No log entries provided');
        }

        await store.receive(resourceLogs, sender);
        res.statusCode = 202;
        res.end();
      });
    },
  });

  return { ...definition, store };
}

/**
 * Checks the request's content type, allowing parameters such as `charset`.
 *
 * @param req - Incoming request.
 * @returns Whether the body is declared as JSON.
 */
function isJsonContent(req: IncomingMessage): boolean {
  const type = req.headers['content-type']?.split(';')[0]?.trim().toLowerCase();
  return type === 'application/json';
}

/**
 * Reads the `resourceLogs` entries of a request body the way the real service deserializes it.
 *
 * @param body - Parsed request body; `undefined` for an empty body.
 * @returns The entries — empty when the list is absent — or `undefined` when the body cannot be
 *   read as an OTLP logs request.
 */
function readResourceLogs(body: unknown): Record<string, unknown>[] | undefined {
  // An empty body or a non-object body cannot be deserialized.
  if (!isJsonObject(body)) return undefined;
  const { resourceLogs } = body;
  // An absent list deserializes to an empty one, which is then rejected as "no log entries".
  if (resourceLogs === undefined || resourceLogs === null) return [];
  // A list of another type cannot be deserialized.
  if (!Array.isArray(resourceLogs)) return undefined;
  // Every entry must be an object for the typed model to read the batch.
  return resourceLogs.every(isJsonObject) ? resourceLogs : undefined;
}

/**
 * Checks whether objects and arrays in a JSON value are nested deeper than a limit, stopping as
 * soon as the limit is passed so hostile bodies cannot exhaust the stack.
 *
 * @param value - Parsed JSON value.
 * @param limit - Deepest nesting allowed.
 * @returns Whether the nesting exceeds `limit`.
 */
function exceedsJsonDepth(value: unknown, limit: number): boolean {
  // Scalars add no nesting.
  if (value === null || typeof value !== 'object') return false;
  // This container is one level too many.
  if (limit === 0) return true;
  const children = Array.isArray(value) ? value : Object.values(value);
  // Any child nested too deeply makes the whole body too deep.
  return children.some((child) => exceedsJsonDepth(child, limit - 1));
}

/**
 * Sends the Fusion API error the Monitor service returns for a rejected batch.
 *
 * @param res - Response to write.
 * @param code - Error code.
 * @param message - Error message.
 */
function sendInvalidOperation(res: MockResponse, code: string, message: string): void {
  res.statusCode = 400;
  res.json({ error: { code, message } });
}

export default defineAnalyticsMock;
