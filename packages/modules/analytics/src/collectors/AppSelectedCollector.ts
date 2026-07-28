import { map, type ObservableInput, pairwise } from 'rxjs';
import type { IAnalyticsCollector } from './AnalyticsCollector.interface.js';
import { BaseCollector, createSchema } from './BaseCollector.js';
import { type AppKeyType, appKeySchema } from './utils/extractAppMetadata.js';
import { extractAppKeyMetadata } from './utils/extract-app-key-metadata.js';

import type { AppModuleProvider } from '@equinor/fusion-framework-module-app';

import { z } from 'zod';

/** Zod schema for the `app-selected` event (value + attributes). */
const eventSchema = createSchema(appKeySchema, z.object({ previous: appKeySchema }));

/**
 * Collector that emits an analytics event whenever the active Fusion application changes.
 *
 * @remarks
 * Listens to `AppModuleProvider.current$`, pairs consecutive values, and emits
 * both the new and previous app key metadata.
 *
 * Register via:
 * ```ts
 * builder.setCollector('app-selected', async (args) => {
 *   const app = await args.requireInstance('app');
 *   return new AppSelectedCollector(app);
 * });
 * ```
 */
export class AppSelectedCollector
  extends BaseCollector<AppKeyType, { previous?: AppKeyType }>
  implements IAnalyticsCollector
{
  #appProvider: AppModuleProvider;

  /**
   * @param appProvider - Fusion app module provider to observe.
   */
  constructor(appProvider: AppModuleProvider) {
    super('app-selected', eventSchema);
    this.#appProvider = appProvider;
  }

  /**
   * Builds an observable that emits an analytics event each time the selected
   * app changes, including the previous app's key metadata.
   *
   * @returns An observable input emitting the newly selected app's value and attributes.
   */
  _initialize(): ObservableInput<{
    value: AppKeyType;
    attributes: { previous?: AppKeyType };
  }> {
    // Pair each app-selection emission with the previously selected app
    const appSelected$ = this.#appProvider.current$.pipe(pairwise());

    // Map the [previous, next] pair into the analytics event shape
    const data$ = appSelected$.pipe(
      map(([prev, next]) => {
        return {
          value: extractAppKeyMetadata(next),
          attributes: {
            previous: prev && extractAppKeyMetadata(prev),
          },
        };
      }),
    );

    return data$;
  }
}
