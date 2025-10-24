import type { FrameworkConfigurator, Fusion } from "@equinor/fusion-framework";

import { type MetricEvent, metricsModule } from '@equinor/fusion-framework-module-metrics';
import { ConsoleMetricsAdapter, FusionMetricsAdapter } from '@equinor/fusion-framework-module-metrics/adapters';
import { Subject } from "rxjs";

// biome-ignore lint/suspicious/noExplicitAny: is unknown.
type FusionPortal = any;

export type ComponentRenderArgs<
  PortalConfig = unknown,
  TFusionPortal extends FusionPortal = FusionPortal,
> = {
  ref: TFusionPortal;
  config: PortalConfig;
};

export type PortalModuleInitiator<TRef extends Fusion = Fusion> = (
  configurator: FrameworkConfigurator,
  ref?: TRef,
) => void | Promise<void>;

export const frameworkConfig: PortalModuleInitiator = (configurator) => {
//   enableMetrics(configurator, (build) => {
//   });
  configurator.addConfig({
    module: metricsModule,
    configure(config) {
      config.setAdapter('console', async () => {
        return new ConsoleMetricsAdapter(); // @TODO: Remove
      });
      config.setAdapter('fusion', async () => {
        return new FusionMetricsAdapter();
      });

      config.setReporter('click-test', async () => {
        const subject = new Subject<MetricEvent>();
        // fusionEventModule.on('contextChange', (e) => subject.next(new MetricEvent(e));
        window.addEventListener('click', (e) => {
          subject.next({
            name: 'window-clicker',
            value: 69,
          });
        });

        return {
          subscribe: (subscriber) => {
            return subject.subscribe(subscriber);
          }
        }
      });
    },
  });
  console.log('11111111111111111111111111111');
}
