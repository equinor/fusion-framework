import { BaseCollector, createSchema } from './BaseCollector.js';
import { type AppItemType, appSchema, extractAppMetadata } from './utils/extractAppMetadata.js';
import {
  type ContextItemType,
  contextSchema,
  extractContextMetadata,
} from './utils/extractContextMetadata.js';
import type { IAnalyticsCollector } from './AnalyticsCollector.interface.js';

import type { AppEnv, AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';

import { type ObservableInput, Subject } from 'rxjs';
import { z } from 'zod';
import type { ContextModule } from '@equinor/fusion-framework-module-context';

const EVENT_NAME = 'onReactAppLoaded';

/**
 * The schema of the data to be sent.
 */
const eventSchema = createSchema(appSchema, z.object({ context: contextSchema }));

/**
 * Collector to listen for app loaded and add values and attributes for
 * further processing by adapters.
 */
export class AppLoadedCollector
  extends BaseCollector<AppItemType, { context?: ContextItemType }>
  implements IAnalyticsCollector
{
  #eventProvider: IEventModuleProvider;

  constructor(eventProvider: IEventModuleProvider) {
    super('app-loaded', eventSchema);
    this.#eventProvider = eventProvider;
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
      const env = event.detail.env as AppEnv;
      const modules = event.detail.modules as AppModulesInstance<[ContextModule]>;

      // console.log(11, modules.context.resolveContext(modules.context.currentContext));
      // console.log(12, modules.context.validateContext(modules.context.currentContext));
      // console.log(13, modules.context.currentContext);

      const context =
        modules.context.currentContext &&
        modules.context.validateContext(modules.context.currentContext) &&
        modules.context.resolveContext(modules.context.currentContext)
          ? extractContextMetadata(modules.context.currentContext)
          : undefined;

      const data = {
        value: env.manifest && extractAppMetadata(env.manifest),
        attributes: {
          context,
        },
      };

      subject.next(data);
    });

    return subject;
  }
}
