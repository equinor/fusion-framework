import { map, type ObservableInput, pairwise } from 'rxjs';
import type { IAnalyticsCollector } from './AnalyticsCollector.interface.js';
import { BaseCollector, createSchema } from './BaseCollector.js';
import {
  type AppKeyType,
  appKeySchema,
  extractAppKeyMetadata,
} from './utils/extractAppMetadata.js';

import type { AppModuleProvider } from '@equinor/fusion-framework-module-app';

import { z } from 'zod';

/**
 * The schema of the data to be sent.
 */
const eventSchema = createSchema(appKeySchema, z.object({ previous: appKeySchema }));

/**
 * Collector to listen for app selection and add values and attributes for
 * further processing by adapters.
 */
export class AppSelectedCollector
  extends BaseCollector<AppKeyType, { previous?: AppKeyType }>
  implements IAnalyticsCollector
{
  #appProvider: AppModuleProvider;

  constructor(appProvider: AppModuleProvider) {
    super('app-selected', eventSchema);
    this.#appProvider = appProvider;
  }

  _initialize(): ObservableInput<{
    value: AppKeyType;
    attributes: { previous?: AppKeyType };
  }> {
    const appSelected$ = this.#appProvider.current$.pipe(pairwise());

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
