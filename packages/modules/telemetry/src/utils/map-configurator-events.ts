import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { TelemetryType, type TelemetryItem } from '@equinor/fusion-framework-module-telemetry';

/**
 * Transforms events emitted by a given modules configurator into standardized telemetry items.
 *
 * @param configurator - The modules configurator instance emitting events to be mapped.
 * @returns An observable stream of `TelemetryItem` objects, each representing a mapped event.
 *
 * The function listens to the `event$` observable of the configurator and maps each event to a `TelemetryItem`.
 * - If the event contains an `error`, the item is marked as an exception.
 * - If the event contains a `metric`, the item is marked as a metric with its value.
 * - Otherwise, the item is treated as a standard event.
 *
 * The resulting telemetry items include event name, type, level, message, properties, and a fixed scope of `['core', 'configuration']`.
 */
export const mapConfiguratorEvents = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
): Observable<TelemetryItem> => {
  return configurator.event$.pipe(
    map((event) => {
      const item = {
        name: event.name,
        type: TelemetryType.Event,
        level: Number(event.level),
        properties: {
          message: event.message,
          ...event.properties,
        },
        scope: ['core', 'configuration'],
      } satisfies TelemetryItem;

      if (event.error) {
        return {
          ...item,
          type: TelemetryType.Exception,
          exception: event.error as Error,
        };
      }
      if (event.metric) {
        return {
          ...item,
          type: TelemetryType.Metric,
          value: event.metric,
        };
      }
      return item;
    }),
  );
};

export default mapConfiguratorEvents;
