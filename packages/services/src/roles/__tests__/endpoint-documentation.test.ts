import { readFileSync, readdirSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  ROLES_OPENAPI_OPERATIONS,
  ROLES_OPENAPI_SNAPSHOT,
} from './fixtures/roles-openapi-snapshot';
import { ROLES_OPERATION_ENDPOINTS } from './fixtures/roles-operation-endpoints';

/** Source of every Roles endpoint module, keyed by file name. */
const ENDPOINT_SOURCES: ReadonlyMap<string, string> = new Map(
  readdirSync(new URL('../endpoints/', import.meta.url))
    .filter((file) => file.endsWith('.ts'))
    .map((file) => [file, readFileSync(new URL(`../endpoints/${file}`, import.meta.url), 'utf8')]),
);

/** Finds the endpoint module declaring a public operation function. */
const sourceForEndpoint = (endpoint: string): string => {
  const source = [...ENDPOINT_SOURCES.values()].find((candidate) =>
    candidate.includes(`\nconst ${endpoint} = <`),
  );
  // A missing implementation means the OpenAPI-to-endpoint fixture has drifted.
  if (!source) throw new Error(`No endpoint module declares '${endpoint}'`);
  return source;
};

/** Reads the summary published for an OpenAPI operation. */
const summaryFor = (operation: string): string => {
  const [method, path] = operation.split(' ');
  const pathItem = ROLES_OPENAPI_SNAPSHOT.paths[path];
  const summary = (pathItem[method.toLowerCase()] as { summary?: string }).summary;
  // Operation-specific documentation cannot be verified without a published summary.
  if (!summary) throw new Error(`Operation '${operation}' publishes no summary`);
  return summary;
};

describe('Roles endpoint documentation', () => {
  it('maps every OpenAPI operation and summary to its endpoint documentation', () => {
    const undocumented = ROLES_OPENAPI_OPERATIONS.filter((operation) => {
      const endpoint = ROLES_OPERATION_ENDPOINTS[operation];
      const normalizedSource = sourceForEndpoint(endpoint)
        .replace(/^[ \t]*\*[ \t]?/gm, '')
        .replace(/\s+/g, ' ');
      return !normalizedSource.includes(
        `Roles V2 operation: \`${operation}\` — "${summaryFor(operation)}"`,
      );
    });

    expect(ROLES_OPENAPI_OPERATIONS).toHaveLength(73);
    expect(undocumented).toEqual([]);
  });
});
