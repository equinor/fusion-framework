/**
 * Compares a service's published OpenAPI documents with the snapshots checked into this package.
 *
 * Read-only by construction: no snapshot is ever written, and every remote document arrives
 * through the caller's loader, so the package tests drive the same code path offline that
 * `check-openapi.ts` drives over the network.
 *
 * @packageDocumentation
 */

import { readFileSync } from 'node:fs';

import type { OpenApiServiceConfig, OpenApiVersionConfig } from './openapi-services.ts';

/** Any value in a parsed JSON document. */
export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
/** An object in a parsed JSON document. */
export type JsonObject = { [key: string]: JsonValue };

/** The parts of an OpenAPI document the checker addresses by name; the rest is generic JSON. */
export type OpenApiDocument = JsonObject & {
  openapi: string;
  info: JsonObject & { version: string };
  paths: { [path: string]: JsonObject };
  components?: JsonObject & { schemas?: JsonObject };
};

/** Entry names added, removed, and changed within one class of contract entries. */
export type OpenApiEntryDiff = { added: string[]; removed: string[]; changed: string[] };

/**
 * Difference between two normalized documents: operations named `"<METHOD> <path>"`, schemas by
 * component name, other fields by dotted name. An entry changed when anything inside it did.
 */
export type OpenApiDiff = {
  operations: OpenApiEntryDiff;
  schemas: OpenApiEntryDiff;
  fields: OpenApiEntryDiff;
};

/** Outcome of checking every registered version of a service. */
export type OpenApiCheckReport = {
  /** `0` when every version is in sync, `1` when at least one drifted. */
  exitCode: number;
  /** Text to print: an in-sync summary, or a drift report with manual adoption instructions. */
  output: string;
  /** Per-version outcome, in registry order. */
  results: readonly {
    version: string;
    drifted: boolean;
    diff: OpenApiDiff;
    operations: number;
    schemas: number;
  }[];
};

/** HTTP methods an OpenAPI path item may publish as operations. */
const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

/** Exit code reported for drift; `2` is reserved by the CLI for a check that could not run. */
const EXIT_DRIFT = 1;

/** Message of an unknown thrown value, so terminal output stays readable. */
const message = (error: unknown): string => (error instanceof Error ? error.message : `${error}`);

/** Sorts object keys recursively; array order is meaningful in OpenAPI and stays untouched. */
const sortKeys = (value: JsonValue): JsonValue => {
  // Arrays keep their order; only their elements are normalized.
  if (Array.isArray(value)) {
    // Recursing per element normalizes nested objects without reordering the array.
    return value.map(sortKeys);
  }
  // Primitives and null have no keys to sort.
  if (value === null || typeof value !== 'object') return value;
  const sorted: JsonObject = {};
  // Inserting in sorted order is what makes the serialized snapshot stable.
  for (const key of Object.keys(value).sort()) sorted[key] = sortKeys(value[key]);
  return sorted;
};

/**
 * Validates, version-pins, and normalizes a parsed document. Sorting keys is the only
 * transformation — nothing is stripped — so the snapshot stays the complete published contract
 * while a key reordering cannot register as drift, and a bad body fails with its own message.
 */
const parseDocument = (
  value: unknown,
  source: string,
  apiVersion: string | undefined,
): OpenApiDocument => {
  // An error page or a JSON array parses fine but is not a document.
  const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
  // An error page or a JSON array parses fine but is not a document.
  if (!isObject) throw new Error(`${source} did not return an OpenAPI document object`);
  const document = value as Partial<OpenApiDocument>;
  const required: [boolean, string][] = [
    [typeof document.openapi === 'string', '"openapi" version field'],
    [typeof document.info?.version === 'string', '"info.version" field'],
    // Empty `paths` would report every operation as removed rather than failing loudly.
    [Object.keys(document.paths ?? {}).length > 0, 'a non-empty "paths" object'],
  ];
  // Naming the first missing field keeps the failure actionable in a terminal.
  const missing = required.find(([satisfied]) => !satisfied);
  // Anything short of the three required fields cannot be compared at all.
  if (missing !== undefined) throw new Error(`${source} is missing ${missing[1]}`);
  // A version bump needs its own snapshot and schema graph, not a refresh of this one.
  if (apiVersion !== undefined && document.info?.version !== apiVersion) {
    throw new Error(
      `${source} publishes API version ${document.info?.version}, not ${apiVersion}. A new API` +
        ' version needs its own snapshot, schema graph, and endpoint contract entries.',
    );
  }
  return sortKeys(document as JsonValue) as OpenApiDocument;
};

/** Fetches a remote document, naming the URL in every failure `fetch` reports opaquely. */
const fetchDocument = async (url: string): Promise<unknown> => {
  let response: Response;
  try {
    response = await fetch(url, { headers: { accept: 'application/json' } });
  } catch (error) {
    // A failure here is usually VPN or DNS, so the cause is surfaced verbatim.
    throw new Error(`Failed to reach ${url}: ${message(error)}`, { cause: error });
  }
  // A 4xx/5xx body is usually an HTML error page, which would otherwise be diffed.
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  try {
    return JSON.parse(await response.text());
  } catch (error) {
    throw new Error(`Failed to parse ${url} as JSON: ${message(error)}`, { cause: error });
  }
};

/** Reads a snapshot from disk; `exports` publishes the same path, so the bytes are identical. */
const readSnapshot = (version: OpenApiVersionConfig): unknown => {
  const location = new URL(`../${version.snapshotPath}`, import.meta.url);
  try {
    return JSON.parse(readFileSync(location, 'utf8'));
  } catch (error) {
    throw new Error(
      `Failed to read the snapshot at ${version.snapshotPath}: ${message(error)}.` +
        ' Restore or manually recreate the checked-in snapshot before running the check.',
      { cause: error },
    );
  }
};

/** Operations, component schemas, and remaining contract fields, keyed by their report name. */
const contractEntries = (
  document: OpenApiDocument,
): Record<keyof OpenApiDiff, Map<string, JsonValue>> => {
  const pathEntries = Object.entries(document.paths);
  const operations = new Map<string, JsonValue>(
    // One path template may publish several operations, so every path contributes its methods.
    pathEntries.flatMap(([path, item]) =>
      // Only known verbs are operations; `parameters` and `summary` remain contract fields.
      METHODS.filter((method) => item[method] !== undefined)
        // Each published operation has a stable verb-and-path name in drift reports.
        .map<[string, JsonValue]>((method) => [
          `${method.toUpperCase()} ${path}`,
          item[method] as JsonValue,
        ]),
    ),
  );
  const fields = new Map<string, JsonValue>(
    // Path-item metadata applies to every operation at its path, so contract drift must retain it.
    pathEntries.flatMap(([path, item]) =>
      // Method entries are represented above; retain every other path-item field here.
      Object.entries(item)
        .filter(([key]) => !METHODS.includes(key as (typeof METHODS)[number]))
        // Prefixing with the path avoids collisions between identically named path-item fields.
        .map<[string, JsonValue]>(([key, value]) => [`paths.${path}.${key}`, value]),
    ),
  );
  // Every remaining top-level field is compared as one subtree.
  for (const [key, value] of Object.entries(document)) {
    // Paths and components are reported per entry instead.
    if (key !== 'paths' && key !== 'components') fields.set(key, value);
  }
  // Components other than schemas, such as `securitySchemes`, are contract fields too.
  for (const [key, value] of Object.entries(document.components ?? {})) {
    // Schemas are reported per schema name, so reporting them here would duplicate them.
    if (key !== 'schemas') fields.set(`components.${key}`, value);
  }
  const schemas = new Map(Object.entries(document.components?.schemas ?? {}));
  return { operations, schemas, fields };
};

/** Compares two entry maps by serialized value, sorting each list for stable reporting. */
const compareEntries = (
  baseline: Map<string, JsonValue>,
  current: Map<string, JsonValue>,
): OpenApiEntryDiff => {
  const json = (value: JsonValue | undefined): string => JSON.stringify(value ?? null);
  // Names the remote introduced.
  const added = [...current.keys()].filter((key) => !baseline.has(key));
  // Names the remote dropped.
  const removed = [...baseline.keys()].filter((key) => !current.has(key));
  // Only keys on both sides can have changed; the rest are added or removed.
  const changed = [...baseline.keys()].filter(
    (key) => current.has(key) && json(baseline.get(key)) !== json(current.get(key)),
  );
  return { added: added.sort(), removed: removed.sort(), changed: changed.sort() };
};

/** Number of entries a group reports; zero means that part of the contract is unchanged. */
const countEntries = (group: OpenApiEntryDiff): number =>
  group.added.length + group.removed.length + group.changed.length;

/** Renders the summary a reviewer walks the endpoints with; `git diff` shows the full JSON. */
const renderDiff = (diff: OpenApiDiff): string => {
  const lines = (marker: string, names: readonly string[]): string[] =>
    // One line per name, so the summary can be scanned and pasted into a review.
    names.map((name) => `  ${marker} ${name}`);
  const groups: [string, OpenApiEntryDiff][] = [
    ['Operations', diff.operations],
    ['Component schemas', diff.schemas],
    ['Contract fields', diff.fields],
  ];
  // An empty group would print a heading with nothing beneath it.
  const populated = groups.filter(([, group]) => countEntries(group) > 0);
  // One section per populated group, each headed by its title.
  const sections = populated.map(([title, group]) => {
    // Added, removed, and changed share a section so an entry's fate reads in one place.
    const entries = [
      ...lines('+ added  ', group.added),
      ...lines('- removed', group.removed),
      ...lines('~ changed', group.changed),
    ];
    return [`${title}:`, ...entries].join('\n');
  });
  return sections.join('\n\n');
};

/**
 * Checks every registered API version of a service against its snapshot. Read-only: drift is
 * reported for manual adoption; anything that stops the check running throws instead.
 *
 * @param service - Service configuration from the registry.
 * @param loadRemote - Loads the remote document; defaults to an HTTP fetch, overridden by tests.
 * @returns The exit code, the text to print, and the per-version outcome.
 * @throws {Error} When the check could not run for one of the service's versions.
 */
export const checkOpenApiContract = async (
  service: OpenApiServiceConfig,
  loadRemote: (url: string) => Promise<unknown> = fetchDocument,
): Promise<OpenApiCheckReport> => {
  const results: OpenApiCheckReport['results'][number][] = [];
  const sections: string[] = [];

  // Versions are checked sequentially in registry order, so the report reads top to bottom.
  for (const version of service.versions) {
    const label = `${service.label} ${version.apiVersion} (${version.key})`;
    const snapshot = parseDocument(readSnapshot(version), version.snapshotPath, version.apiVersion);
    const remote = parseDocument(await loadRemote(version.url), version.url, version.apiVersion);
    const before = contractEntries(snapshot);
    const entries = contractEntries(remote);
    const diff: OpenApiDiff = {
      operations: compareEntries(before.operations, entries.operations),
      schemas: compareEntries(before.schemas, entries.schemas),
      fields: compareEntries(before.fields, entries.fields),
    };
    // Any non-empty group in any part of the contract counts as drift.
    const drifted = Object.values(diff).some((group) => countEntries(group) > 0);
    const counts = { operations: entries.operations.size, schemas: entries.schemas.size };
    results.push({ version: version.key, drifted, diff, ...counts });

    // The in-sync path is the common one, so it reports counts instead of a diff.
    sections.push(
      drifted
        ? `✗ ${label} has drifted from ${version.snapshotPath}\n\n${renderDiff(diff)}\n\n` +
            `The snapshot was left untouched. To adopt the remote contract: download ${version.url},` +
            ` review and update ${version.snapshotPath} manually, then update` +
            ` ${version.sourceDirs.join(' and ')} to match — the snapshot alone changes no` +
            ' generated code — run the package tests, and add a changeset for the change.'
        : `✓ ${label} is in sync\n  ${version.snapshotPath} matches ${version.url}\n` +
            `  ${counts.operations} operations, ${counts.schemas} component schemas`,
    );
  }

  // One drifted version fails the run: a service contract is adopted as a unit.
  const drifted = results.some((result) => result.drifted);
  return { exitCode: drifted ? EXIT_DRIFT : 0, output: sections.join('\n\n'), results };
};
