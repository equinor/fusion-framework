import { Worker } from 'node:worker_threads';

/** Upper bound for one registry evaluation, so a hanging registry cannot stall the build. */
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Worker body. It imports the bundled registry from a `data:` URL and posts back a
 * structured-clone-safe projection of the exported DSL nodes: only `kind`, `path`,
 * `file`, `children` and string-valued `handle.route` metadata survive. Functions,
 * class instances and cycles never cross the thread boundary.
 *
 * The body is an ES module loaded from a `data:` URL instead of `eval` source, so
 * its module type does not depend on the host's `execArgv` (for example
 * `--input-type=module`, which workers inherit).
 */
const WORKER_SOURCE = `
import { parentPort, workerData } from 'node:worker_threads';
const isRecord = (value) => typeof value === 'object' && value !== null;
const toStrings = (value) => {
  if (!isRecord(value)) return undefined;
  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string') result[key] = entry;
  }
  return result;
};
const toSchema = (handle) => {
  const schema = isRecord(handle) && isRecord(handle.route) ? handle.route : {};
  const result = {};
  if (typeof schema.description === 'string') result.description = schema.description;
  const params = toStrings(schema.params);
  if (params) result.params = params;
  const search = toStrings(schema.search);
  if (search) result.search = search;
  return result;
};
const project = (value, seen) => {
  if (Array.isArray(value)) return value.map((entry) => project(entry, seen));
  if (!isRecord(value) || seen.has(value)) return null;
  seen.add(value);
  const node = {};
  for (const key of ['kind', 'path', 'file']) {
    if (typeof value[key] === 'string') node[key] = value[key];
  }
  if (Array.isArray(value.children)) node.children = project(value.children, seen);
  node.handle = { route: toSchema(value.handle) };
  seen.delete(value);
  return node;
};
import(workerData.url).then(
  (module) => {
    parentPort.postMessage({ ok: true, definition: project(module.default ?? module.routes, new Set()) });
  },
  (error) => {
    parentPort.postMessage({ ok: false, message: error instanceof Error ? error.message : String(error) });
  },
);
`;

/** Worker entry as an ES module `data:` URL. */
const WORKER_URL = new URL(`data:text/javascript,${encodeURIComponent(WORKER_SOURCE)}`);

/**
 * Narrows an unknown value to a plain object record.
 *
 * @param value - Value to check.
 * @returns `true` for non-null objects.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Evaluates a bundled route registry in a short-lived worker thread and returns a
 * plain-data projection of its route definition (`default` export, or `routes`).
 *
 * Every evaluation gets a fresh worker, which is terminated afterwards. Module
 * instances, globals and timers created by the registry therefore never reach or
 * accumulate in the calling process, and repeated development resolutions always
 * evaluate the current sources. The bundle is loaded from a `data:` URL, so no
 * temporary files are written.
 *
 * @param code - Self-contained ES module bundle without external imports.
 * @param timeoutMs - Maximum evaluation time before the worker is terminated.
 * @returns The projected route definition: nodes keep `kind`, `path`, `file`,
 *   `children` and string metadata; a missing or non-object export, and non-object
 *   entries, become `null`.
 * @throws {Error} When evaluation throws, the worker exits early or the timeout elapses.
 */
export async function evaluateRouteRegistry(
  code: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<unknown> {
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  const worker = new Worker(WORKER_URL, { workerData: { url } });
  let timer: NodeJS.Timeout | undefined;
  try {
    return await new Promise<unknown>((resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error(`evaluation did not finish within ${timeoutMs} ms`)),
        timeoutMs,
      );
      worker.once('message', (message: unknown) => {
        // The worker posts exactly one result message; anything else is a protocol error
        if (isRecord(message) && message.ok === true) {
          resolve(message.definition);
        } else {
          const reason = isRecord(message) ? message.message : undefined;
          reject(new Error(typeof reason === 'string' ? reason : 'evaluation failed'));
        }
      });
      worker.once('error', reject);
      worker.once('exit', (exitCode) =>
        reject(new Error(`evaluation worker exited with code ${exitCode} before reporting`)),
      );
    });
  } finally {
    clearTimeout(timer);
    // Terminating releases the worker isolate and everything the registry allocated
    await worker.terminate();
  }
}
