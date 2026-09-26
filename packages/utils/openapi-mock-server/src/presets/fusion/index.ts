import { createService, type ServiceBuilder } from '../../discovery/create-service.js';
import peopleFakers from './people.fakers.js';

import type { OpenApiMockOverrideContext, OpenApiMockResponse } from '@equinor/fusion-openapi-mock';

import appState from './app-state.openapi.json' with { type: 'json' };
import apps from './apps.openapi.json' with { type: 'json' };
import bookmarks from './bookmarks.openapi.json' with { type: 'json' };
import context from './context.openapi.json' with { type: 'json' };
import notification from './notification.openapi.json' with { type: 'json' };
import people from './people.openapi.json' with { type: 'json' };
import portalConfig from './portal-config.openapi.json' with { type: 'json' };
import rolesv2 from './rolesv2.openapi.json' with { type: 'json' };

/**
 * Preserves the requested Context identity while retaining the schema-generated response fields.
 *
 * @param params - Path parameters resolved from the Context request.
 * @param mockResponseForOperation - Generates the schema-shaped baseline Context response.
 * @returns The generated Context response with its ID replaced by the requested path ID.
 * @throws If the route has no context ID or the generated response is not an object.
 */
async function preserveRequestedContextId({
  params,
  mockResponseForOperation,
}: OpenApiMockOverrideContext): Promise<OpenApiMockResponse> {
  const requestedId = params.id;
  // A matched /contexts/{id} operation must always provide the identity used by application routing.
  if (!requestedId) {
    throw new Error('The Fusion Context mock requires an "id" path parameter.');
  }

  const baseline = await mockResponseForOperation();
  // The Context schema must generate an object before its identity can be preserved.
  if (baseline.mock === null || typeof baseline.mock !== 'object' || Array.isArray(baseline.mock)) {
    throw new Error('The Fusion Context mock generated a non-object response.');
  }

  return {
    ...baseline,
    mock: {
      ...baseline.mock,
      id: requestedId,
    },
  };
}

/**
 * Fusion's bundled baseline services, keyed by service key — pass this straight to
 * `MockServerHandle.preset()`, or reach into one service's own {@link ServiceBuilder}
 * (e.g. to register `middleware` on it) before doing so.
 */
export interface FusionPresetServices {
  [key: string]: ServiceBuilder;
  context: ServiceBuilder;
  bookmarks: ServiceBuilder;
  people: ServiceBuilder;
  notification: ServiceBuilder;
  'app-state': ServiceBuilder;
  apps: ServiceBuilder;
  rolesv2: ServiceBuilder;
  'portal-config': ServiceBuilder;
}

/**
 * Baseline mock definitions for Fusion's mandatory service-discovery keys —
 * `context`, `bookmarks`, `people`, `notification`, `app-state`, `apps`,
 * `portal-config` — the services a Fusion app's default framework modules
 * resolve eagerly at startup and fail hard (blank page, not just a console
 * warning) without. `rolesv2` isn't part of that mandatory set, but is
 * bundled too since `packages/dev-portal`'s `PersonSideSheet` resolves it.
 *
 * @remarks
 * `apps` and `portal-config` are generic mocks only — serving your own app or
 * portal locally still needs its own manifest/build/config override (see
 * `createService`), since a bundled preset has no way to know the specific
 * appKey/version/build being served.
 *
 * @returns The Fusion baseline's service mock definitions, keyed by service key.
 *
 * @example
 * ```typescript
 * const fusionServices = fusionPreset();
 * fusionServices.people.middleware((router) => router.post('/people-picker/resolve', handler));
 * someServer.preset(fusionServices);
 * ```
 */
export function fusionPreset(): FusionPresetServices {
  const contextService = createService('context', context);
  contextService.paths = {
    '/contexts/{id}': {
      get: preserveRequestedContextId,
    },
  };

  return {
    context: contextService,
    bookmarks: createService('bookmarks', bookmarks),
    people: createService('people', people).withFields(peopleFakers),
    notification: createService('notification', notification),
    'app-state': createService('app-state', appState),
    apps: createService('apps', apps),
    rolesv2: createService('rolesv2', rolesv2),
    'portal-config': createService('portal-config', portalConfig),
  };
}

export default fusionPreset;
