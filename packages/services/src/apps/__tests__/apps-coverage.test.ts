import { beforeEach, describe, expect, it } from 'vitest';

import type { HttpClient } from '@equinor/fusion-framework-module-http/client';

import * as appsApi from '..';
import { ApiVersion } from '..';

import { createTestClient, type TestClient } from '../../__tests__/fixtures/create-test-client';
import { APPS_OPENAPI_OPERATIONS } from './fixtures/apps-openapi-snapshot';
import { APPS_OPERATION_ENDPOINTS } from './fixtures/apps-operation-endpoints';

/**
 * Loosely typed view of an endpoint function, so one call site can drive all 108
 * operations instead of 108 individually typed ones.
 */
type EndpointFactory = (
  version: string,
  client: HttpClient,
  method?: 'json' | 'json$',
) => (args?: Record<string, unknown>, init?: unknown) => Promise<unknown>;

/** Placeholder for each OpenAPI path parameter, chosen to exercise URI encoding. */
const PATH_PARAM_VALUES: Record<string, string> = {
  accountIdentifier: 'user/name@example.com',
  appCategoryIdentifier: 'app category/1',
  appIdentifier: 'app/1',
  azureUniqueId: '00000000-0000-0000-0000-000000000000',
  contextTypeIdentifier: 'context type/1',
  documentType: 'document type/1',
  id: 'changelog/1',
  propertyName: 'property/1',
  resource: 'assets/app-bundle.js',
  tagName: 'tag/1',
  technologyProductIdentifier: 'technology product/1',
  versionIdentifier: 'version/1',
  widgetIdentifier: 'widget/1',
};

/**
 * Representative request bodies for mutating operations, so the coverage sweep
 * exercises body construction instead of posting empty objects.
 */
const BODY_FIELD_VALUES: Record<string, Record<string, unknown>> = {
  confirmAppGovernance: { comment: 'reviewed' },
  createApp: { appKey: 'my-app', displayName: 'My app' },
  createAppCategory: { name: 'productivity', displayName: 'Productivity' },
  createAppGovernanceDocument: { type: 'AppOwnership', content: '# Ownership' },
  createContextType: { name: 'ProjectMaster' },
  createTechnologyProduct: { name: 'fusion-core' },
  createWidget: { name: 'my-widget', description: 'My widget' },
  pinMyApp: { appKey: 'my-app' },
  pinPersonApp: { appKey: 'my-app' },
  putAppsSubscription: { identifier: 'subscriber' },
  queryAppFeatureEvents: { query: '{ events { id } }' },
  registerAppTag: { version: '1.2.3' },
  registerWidgetTag: { version: '1.2.3' },
  setMyAppTag: { tag: 'preview' },
  setPersonAppTag: { tag: 'preview' },
  updateApp: { displayName: 'Renamed app' },
  updateAppCategory: { displayName: 'Renamed category' },
  updateAppGovernance: { supportsAllProjectPhases: true },
  updateAppGovernanceDocument: { content: '# Updated' },
  updateContextType: { description: 'Project master contexts' },
  updateTechnologyProduct: { name: 'fusion-core' },
  upsertAppBuildConfig: { environment: { LOG_LEVEL: 'debug' } },
  upsertMyAppSettings: { settings: { theme: 'dark' } },
  upsertPersonAppSettings: { settings: { theme: 'dark' } },
  upsertWidgetBuildConfig: { environment: { LOG_LEVEL: 'debug' } },
};

/** Extracts the `{placeholder}` names an OpenAPI path template declares. */
const pathParameterNames = (template: string): string[] =>
  // `matchAll` yields one match per placeholder, so the capture group is the parameter name.
  [...template.matchAll(/{([^}]+)}/g)].map(([, name]) => name);

/** Builds the argument object an endpoint needs to address an operation's resource. */
const buildArgs = (template: string, endpoint: string): Record<string, unknown> => {
  // Every placeholder is filled from the shared table, so paths stay comparable across operations.
  const pathArgs = pathParameterNames(template).map((name) => [name, PATH_PARAM_VALUES[name]]);
  // Path identifiers and body fields share one argument object in this API's contract.
  return { ...Object.fromEntries(pathArgs), ...BODY_FIELD_VALUES[endpoint] };
};

/** Renders the request path an operation is expected to produce for version 1.0. */
const expectedPath = (template: string): string => {
  // Path parameters are URI-encoded, so the expectation has to encode them the same way.
  const path = template.replace(/{([^}]+)}/g, (_match, name: string) =>
    encodeURIComponent(PATH_PARAM_VALUES[name]),
  );
  return `${path}?api-version=${ApiVersion.v1}`;
};

// The barrel exports endpoint factories under stable names; the coverage table
// addresses them by name, which requires an index signature the module lacks.
const endpoints = appsApi as unknown as Record<string, EndpointFactory>;

/** Endpoint names the mapping table claims implement a published operation. */
const coveredEndpoints = new Set(
  // One entry per published operation, so the set doubles as the expected export list.
  APPS_OPENAPI_OPERATIONS.map((operation) => APPS_OPERATION_ENDPOINTS[operation]),
);

describe('Fusion Apps operation coverage', () => {
  let testClient: TestClient;

  beforeEach(() => {
    testClient = createTestClient();
  });

  it('reads all 108 operations from the checked-in OpenAPI snapshot', () => {
    expect(APPS_OPENAPI_OPERATIONS).toHaveLength(108);
  });

  it('maps every operation the snapshot publishes onto an endpoint function', () => {
    // An unmapped operation would silently drop out of the sweep below.
    const unmapped = APPS_OPENAPI_OPERATIONS.filter(
      (operation) => APPS_OPERATION_ENDPOINTS[operation] === undefined,
    );
    expect(unmapped).toEqual([]);
  });

  it('maps no operation the snapshot does not publish', () => {
    const published = new Set(APPS_OPENAPI_OPERATIONS);
    // A stale mapping would keep exercising an operation the service has dropped.
    const stray = Object.keys(APPS_OPERATION_ENDPOINTS).filter(
      (operation) => !published.has(operation),
    );
    expect(stray).toEqual([]);
  });

  it('implements every operation exactly once', () => {
    expect(coveredEndpoints.size).toBe(APPS_OPENAPI_OPERATIONS.length);
  });

  it('exports an endpoint function for every operation and nothing beyond them', () => {
    // The barrel also exports the `ApiVersion` enum, so only functions count as endpoints.
    const exportedFunctions = Object.entries(appsApi).filter(
      ([, value]) => typeof value === 'function',
    );
    // The coverage table addresses endpoints by their exported name, so compare names.
    const exportedNames = exportedFunctions.map(([name]) => name);
    expect(new Set(exportedNames)).toEqual(coveredEndpoints);
  });

  it('keeps every request-body fixture pointed at a real operation', () => {
    // A fixture for a removed operation would silently stop being exercised.
    const strayFixtures = Object.keys(BODY_FIELD_VALUES).filter(
      (name) => !coveredEndpoints.has(name),
    );
    expect(strayFixtures).toEqual([]);
  });

  it.each(APPS_OPENAPI_OPERATIONS)('%s', async (operation) => {
    const [method, template] = operation.split(' ');
    const endpoint = APPS_OPERATION_ENDPOINTS[operation];
    const factory = endpoints[endpoint];
    expect(factory, `missing endpoint function '${endpoint}'`).toBeTypeOf('function');

    await factory('v1', testClient.client)(buildArgs(template, endpoint));

    const [path, init] = testClient.json.mock.calls.at(-1) as [string, { method?: string }];
    expect(path).toBe(expectedPath(template));
    // A GET is the client default, so only the other verbs set `method` explicitly.
    expect(init.method ?? 'GET').toBe(method);
  });
});
