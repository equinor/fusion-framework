import { BaseCollector, createSchema } from './BaseCollector.js';
import { type AppItemType, appSchema, extractAppMetadata } from './utils/extractAppMetadata.js';
import {
  type ContextItemType,
  contextSchema,
  extractContextMetadata,
} from './utils/extractContextMetadata.js';
import type { IAnalyticsCollector } from './AnalyticsCollector.interface.js';

import type {
  AppModulesInstance,
  AppManifest,
  AppModuleProvider,
} from '@equinor/fusion-framework-module-app';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import { type ObservableInput, Subject } from 'rxjs';
import { z } from 'zod';
import type { ContextModule } from '@equinor/fusion-framework-module-context';

const EVENT_NAME = 'onAppModulesLoaded';

/** Zod schema for the `app-loaded` event (value + attributes). */
const eventSchema = createSchema(appSchema, z.object({ context: contextSchema }));

/**
 * Collector that emits an analytics event whenever an application’s modules
 * finish loading.
 *
 * @remarks
 * Listens to the framework `onAppModulesLoaded` event, extracts application
 * manifest metadata, and includes the current context (if available) in the
 * event attributes.
 *
 * Register via:
 * ```ts
 * builder.setCollector('app-loaded', async (args) => {
 *   const event = await args.requireInstance('event');
 *   const app = await args.requireInstance('app');
 *   return new AppLoadedCollector(event, app);
 * });
 * ```
 */
export class AppLoadedCollector
  extends BaseCollector<AppItemType, { context?: ContextItemType }>
  implements IAnalyticsCollector
{
  #eventProvider: IEventModuleProvider;
  #appProvider: AppModuleProvider;

  /**
   * @param eventProvider - Fusion event module provider to listen for app-loaded events.
   * @param appProvider - Fusion app module provider for fallback manifest data.
   */
  constructor(eventProvider: IEventModuleProvider, appProvider: AppModuleProvider) {
    super('app-loaded', eventSchema);
    this.#eventProvider = eventProvider;
    this.#appProvider = appProvider;
  }

  _initialize(): ObservableInput<{
    value: AppItemType;
    attributes: { context?: ContextItemType };
  }> {
    const subject = new Subject<{
      value: AppItemType;
      attributes: { context?: ContextItemType };
    }>();
    this.#eventProvider.addEventListener(EVENT_NAME, (event) => {
      // Fallback to appProvider for manifest if app is not updated with latest
      // payload for onAppModulesLoaded (missing manifest).
      const manifest =
        (event.detail.manifest as AppManifest) ?? this.#appProvider.current?.manifest;
      const modules = event.detail.modules as AppModulesInstance<[ContextModule]>;

      const data = {
        value: manifest && extractAppMetadata(manifest),
        attributes: {
          context:
            modules.context?.currentContext &&
            extractContextMetadata(modules.context.currentContext),
        },
      };

      subject.next(data);
    });

    return subject;
  }
}
