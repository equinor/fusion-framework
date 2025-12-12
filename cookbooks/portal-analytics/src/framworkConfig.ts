import type { FrameworkConfigurator, Fusion } from '@equinor/fusion-framework';
import { enableAppModule } from '@equinor/fusion-framework-module-app';

import { type AnalyticsEvent, enableAnalytics } from '@equinor/fusion-framework-module-analytics';
import {
  ConsoleAnalyticsAdapter,
  FusionAnalyticsAdapter,
} from '@equinor/fusion-framework-module-analytics/adapters';
import {
  AppLoadedCollector,
  AppSelectedCollector,
  ContextSelectedCollector,
} from '@equinor/fusion-framework-module-analytics/collectors';
import {
  OTLPLogExporter,
  FusionOTLPLogExporter,
} from '@equinor/fusion-framework-module-analytics/logExporters';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import { enableContext } from '@equinor/fusion-framework-react/context';
import { Subject } from 'rxjs';
import type { ServiceDiscoveryProvider } from '@equinor/fusion-framework-module-service-discovery';

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
  enableContext(configurator);

  enableAppModule(configurator);

  enableNavigation(configurator);

  enableAnalytics(configurator, (builder) => {
    builder.setAdapter('console', async () => {
      return new ConsoleAnalyticsAdapter();
    });

    builder.setAdapter('fusion-log', async () => {
      const logExporter = new OTLPLogExporter({
        url: '/@fusion-api/api/logs',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return new FusionAnalyticsAdapter({
        portalId: 'cookbook-portal-analytics',
        logExporter,
      });
    });

    builder.setAdapter('fusion', async (args) => {
      if (args.hasModule('serviceDiscovery')) {
        const serviceDiscovery =
          await args.requireInstance<ServiceDiscoveryProvider>('serviceDiscovery');
        const httpClient = await serviceDiscovery.createClient('monitor');

        const logExporter = new FusionOTLPLogExporter(httpClient);

        return new FusionAnalyticsAdapter({
          portalId: 'cookbook-portal-analytics',
          logExporter,
        });
      }
      console.error('Could not instanziate monitor http client from service-discovery');
    });

    builder.setCollector('context-selected', async (args) => {
      const contextProvider = await args.requireInstance('context');
      return new ContextSelectedCollector(contextProvider);
    });

    builder.setCollector('app-selected', async (args) => {
      const appProvider = await args.requireInstance('app');
      return new AppSelectedCollector(appProvider);
    });

    builder.setCollector('app-loaded', async (args) => {
      const eventProvider = await args.requireInstance('event');
      const appProvider = await args.requireInstance('app');
      return new AppLoadedCollector(eventProvider, appProvider);
    });

    builder.setCollector('click-test', async () => {
      const subject = new Subject<AnalyticsEvent>();
      window.addEventListener('click', (e) => {
        if ((e.target as HTMLButtonElement).id === 'button-trigger') {
          subject.next({
            name: 'window-clicker',
            value: 69,
          });
        }
      });

      return {
        subscribe: (subscriber) => {
          return subject.subscribe(subscriber);
        },
      };
    });
  });
};
