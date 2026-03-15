import { distinctUntilChanged, map, type ObservableInput, pairwise } from 'rxjs';
import type { IAnalyticsCollector } from './AnalyticsCollector.interface.js';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import type { AppModuleProvider } from '@equinor/fusion-framework-module-app';
import { z } from 'zod';
import { BaseCollector, createSchema } from './BaseCollector.js';
import {
  type ContextItemType,
  contextSchema,
  extractContextMetadata,
} from './utils/extractContextMetadata.js';

/** Zod schema for the `context-selected` event (value + attributes). */
const eventSchema = createSchema(
  contextSchema,
  z.object({ previous: contextSchema, appKey: z.string().optional() }),
);

/**
 * Collector that emits an analytics event whenever the active Fusion context changes.
 *
 * @remarks
 * Listens to `IContextProvider.currentContext$`, de-duplicates by context ID,
 * pairs consecutive values, and emits both the new and previous context
 * metadata. The current application key is included in attributes.
 *
 * Register via:
 * ```ts
 * builder.setCollector('context-selected', async (args) => {
 *   const ctx = await args.requireInstance('context');
 *   const app = await args.requireInstance('app');
 *   return new ContextSelectedCollector(ctx, app);
 * });
 * ```
 */
export class ContextSelectedCollector
  extends BaseCollector<ContextItemType, { previous?: ContextItemType; appKey?: string }>
  implements IAnalyticsCollector
{
  #contextProvider: IContextProvider;
  #appProvider: AppModuleProvider;

  /**
   * @param contextProvider - Fusion context module provider to observe.
   * @param appProvider - Fusion app module provider for the current app key.
   */
  constructor(contextProvider: IContextProvider, appProvider: AppModuleProvider) {
    super('context-selected', eventSchema);
    this.#contextProvider = contextProvider;
    this.#appProvider = appProvider;
  }

  _initialize(): ObservableInput<{
    value: ContextItemType;
    attributes: { previous?: ContextItemType; appKey?: string };
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
            appKey: this.#appProvider.current?.appKey,
          },
        };
      }),
    );

    return data$;
  }
}
