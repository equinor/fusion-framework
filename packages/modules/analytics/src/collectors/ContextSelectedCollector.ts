import { distinctUntilChanged, map, type ObservableInput, pairwise } from 'rxjs';
import type { IAnalyticsCollector } from './AnalyticsCollector.interface.js';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import { z } from 'zod';
import { BaseCollector, createSchema } from './BaseCollector.js';
import {
  type ContextItemType,
  contextSchema,
  extractContextMetadata,
} from './utils/extractContextMetadata.js';

/**
 * The schema of the data to be sent.
 */
const eventSchema = createSchema(contextSchema, z.object({ previous: contextSchema }));

/**
 * Collector to listen for context changes and add values and attributes for
 * further processing by adapters.
 */
export class ContextSelectedCollector
  extends BaseCollector<ContextItemType, { previous?: ContextItemType }>
  implements IAnalyticsCollector
{
  #contextProvider: IContextProvider;

  constructor(contextProvider: IContextProvider) {
    super('context-selected', eventSchema);
    this.#contextProvider = contextProvider;
  }

  _initialize(): ObservableInput<{
    value: ContextItemType;
    attributes: { previous?: ContextItemType };
  }> {
    const contextSelected$ = this.#contextProvider.currentContext$.pipe(
      // Only emit when an actual change has happened.
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
      // Provide both the old and the new value.
      pairwise(),
    );

    const data$ = contextSelected$.pipe(
      map(([prev, next]) => {
        return {
          value: next && extractContextMetadata(next),
          attributes: {
            previous: prev && extractContextMetadata(prev),
          },
        };
      }),
    );

    return data$;
  }
}
