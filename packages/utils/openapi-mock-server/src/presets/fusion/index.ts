import { createService, type ServiceBuilder } from '../../discovery/create-service.js';

import appState from './app-state.openapi.json' with { type: 'json' };
import apps from './apps.openapi.json' with { type: 'json' };
import bookmarks from './bookmarks.openapi.json' with { type: 'json' };
import context from './context.openapi.json' with { type: 'json' };
import notification from './notification.openapi.json' with { type: 'json' };
import people from './people.openapi.json' with { type: 'json' };
import portalConfig from './portal-config.openapi.json' with { type: 'json' };
import rolesv2 from './rolesv2.openapi.json' with { type: 'json' };

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

/** A faked personPortrait photo, clipped to a circle with a colored border, as a `data:image/svg+xml` URI. */
function fakeAvatar(): string {
  const svg = `<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.9 122.9" style="enable-background:new 0 0 122.9 122.9" xml:space="preserve"><g><path d="M61.4,0c17,0,32.3,6.9,43.4,18c11.1,11.1,18,26.5,18,43.4c0,17-6.9,32.3-18,43.4c-11.1,11.1-26.5,18-43.4,18 s-32.3-6.9-43.4-18C6.9,93.8,0,78.4,0,61.4c0-17,6.9-32.3,18-43.4C29.1,6.9,44.5,0,61.4,0L61.4,0z M41.3,54.3c-1.1,0-2,0.3-2.5,0.7 c-0.3,0.2-0.6,0.5-0.7,0.8c-0.2,0.4-0.3,0.8-0.2,1.4c0,1.5,0.8,3.5,2.4,5.8l0,0l0,0l5,8c2,3.2,4.1,6.5,6.8,8.9 c2.5,2.3,5.6,3.9,9.6,3.9c4.4,0,7.6-1.6,10.2-4.1c2.7-2.5,4.9-6,7-9.5l5.7-9.3c1.1-2.4,1.4-4,1.2-5c-0.1-0.6-0.8-0.8-1.8-0.9 c-0.2,0-0.5,0-0.7,0c-0.3,0-0.5,0-0.8,0c-0.2,0-0.3,0-0.4,0c-0.5,0-1,0-1.6-0.1l1.9-8.6c-14.4,2.3-25.2-8.4-40.4-2.1L43,54.4 C42.4,54.4,41.8,54.4,41.3,54.3L41.3,54.3L41.3,54.3L41.3,54.3z M18.8,95.7c7.1-2.5,19.6-3.8,25.4-7.7c1-1.3,2.1-2.9,3.1-4.3 c0.6-0.9,1.1-1.7,1.6-2.3c0.1-0.1,0.2-0.2,0.3-0.3c-2.4-2.5-4.4-5.5-6.3-8.5l-5-8C36,61.8,35,59.3,35,57.3c0-1,0.1-1.9,0.5-2.6 c0.4-0.8,1-1.5,1.7-2c0.4-0.2,0.8-0.5,1.2-0.6c-0.3-4.3-0.4-9.8-0.2-14.4c0.1-1.1,0.3-2.2,0.6-3.3c1.3-4.6,4.5-8.3,8.5-10.8 c1.4-0.9,2.9-1.6,4.6-2.2c2.9-1.1,1.5-5.5,4.7-5.6c7.5-0.2,19.8,6.2,24.6,11.4c2.8,3,4.6,7,4.9,12.3l-0.3,13.1l0,0 c1.4,0.4,2.3,1.3,2.7,2.7c0.4,1.6,0,3.8-1.4,6.9l0,0c0,0.1-0.1,0.1-0.1,0.2l-5.7,9.4c-2.2,3.6-4.5,7.3-7.5,10.1L73.7,82l0,0 c0.4,0.5,0.8,1.1,1.2,1.7c0.8,1.1,1.6,2.4,2.5,3.6c5.3,4.5,19.3,5.9,26.7,8.6c7.6-9.4,12.1-21.4,12.1-34.4c0-15.1-6.1-28.8-16-38.7 c-9.9-9.9-23.6-16-38.7-16s-28.8,6.1-38.7,16c-9.9,9.9-16,23.6-16,38.7C6.7,74.4,11.2,86.3,18.8,95.7L18.8,95.7z M77,90.5 c-1.4-1.6-2.8-3.7-4.1-5.5c-0.4-0.5-0.7-1.1-1.1-1.5c-2.7,2-6,3.3-10.3,3.3c-4.5,0-8-1.6-10.9-4.1c0,0,0,0.1-0.1,0.1 c-0.5,0.7-1,1.4-1.6,2.3c-1.1,1.6-2.3,3.3-3.4,4.8C45.6,100,71.1,106,77,90.5L77,90.5z"/></g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
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
  return {
    context: createService('context', context),
    bookmarks: createService('bookmarks', bookmarks),
    people: createService('people', people).withFields({
      'SuggestionAccount.avatarUrl': fakeAvatar,
    }),
    notification: createService('notification', notification),
    'app-state': createService('app-state', appState),
    apps: createService('apps', apps),
    rolesv2: createService('rolesv2', rolesv2),
    'portal-config': createService('portal-config', portalConfig),
  };
}

export default fusionPreset;
