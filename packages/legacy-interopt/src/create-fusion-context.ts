/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    createApiClients,
    ResourceCache,
    EventHub,
    HttpClient,
    AbortControllerManager,
    createResourceCollections,
    TelemetryLogger,
    FeatureLogger,
    SettingsContainer,
    ComponentDisplayType,
    AppContainer,
    TasksContainer,
    NotificationCenter,
    PeopleContainer,
    UserMenuContainer,
    FusionContextRefs,
    IFusionContext,
    // appContainerFactory,
} from '@equinor/fusion';
import { appContainerFactory } from '@equinor/fusion/lib/app/AppContainer';

import { NavigationUpdate } from '@equinor/fusion-framework-module-navigation';

import { LegacyAppContainer } from './LegacyAppContainer';
import { LegacyAuthContainer } from './LegacyAuthContainer';

import createServiceResolver from './create-service-resolver';
import type { PortalFramework } from './types';
import legacySignIn from 'legacy-api-signin';

type FusionContextOptions = {
    loadBundlesFromDisk: boolean;
    environment?: {
        env: string;
        pullRequest?: string;
    };
    telemetry?: {
        instrumentationKey: string;
    };
};

export const createFusionContext = async (args: {
    framework: PortalFramework;
    refs: FusionContextRefs;
    options?: FusionContextOptions;
}): Promise<IFusionContext> => {
    const { framework, refs, options } = args;

    const { environment = { env: 'ci' }, loadBundlesFromDisk = false, telemetry } = options ?? {};

    const authContainer = new LegacyAuthContainer({ auth: framework.modules.auth });

    const telemetryLogger = new TelemetryLogger(telemetry?.instrumentationKey ?? '', authContainer);

    const abortControllerManager = new AbortControllerManager(new EventHub());

    await legacySignIn(framework);

    const serviceResolver = await createServiceResolver(framework.modules.serviceDiscovery);
    const resourceCollections = createResourceCollections(serviceResolver, {
        loadBundlesFromDisk,
        environment,
    });

    const resourceCache = new ResourceCache(new EventHub());

    const httpClient = new HttpClient(
        authContainer,
        resourceCache,
        abortControllerManager,
        telemetryLogger,
        new EventHub()
    );

    const apiClients = createApiClients(httpClient, resourceCollections, serviceResolver);

    const featureLogger = new FeatureLogger(apiClients, new EventHub());

    const history = framework.modules.navigation.navigator;

    const historyListenFn = history.listen.bind(history);

    /**
     * TODO - write what this wrapper does!?
     */
    // @ts-ignore
    history.listen = (
        cb: (
            eventOrLocation: NavigationUpdate | NavigationUpdate['location'],
            action?: NavigationUpdate['action']
        ) => void
    ) => {
        return historyListenFn(
            (e: { action: NavigationUpdate['action']; location: NavigationUpdate['location'] }) => {
                const event = new Proxy(e, {
                    get(target, p) {
                        switch (p) {
                            case 'action':
                                return target.action;

                            case 'location':
                                return target.location;

                            case 'state':
                            case 'hash':
                            case 'key':
                            case 'search':
                            case 'pathname':
                                // @ts-ignore
                                return target.location[p];
                        }
                    },
                });
                cb(event, e.action);
            }
        );
    };

    const coreSettings = new SettingsContainer(
        'core',
        authContainer.getCachedUser(),
        new EventHub(),
        {
            componentDisplayType: ComponentDisplayType.Comfortable,
        }
    );

    const appContainer = new LegacyAppContainer({
        framework,
        eventHub: new EventHub(),
        featureLogger,
        telemetryLogger,
    }) as unknown as AppContainer;

    appContainerFactory(appContainer);

    // @ts-ignore
    const contextManager = new CliContextManager({ featureLogger, framework, history });

    const tasksContainer = new TasksContainer(apiClients, new EventHub());
    const notificationCenter = new NotificationCenter(new EventHub(), apiClients);
    const peopleContainer = new PeopleContainer(apiClients, resourceCollections, new EventHub());
    const userMenuSectionsContainer = new UserMenuContainer(new EventHub());

    const fusionContext = {
        auth: { container: authContainer },
        http: {
            client: httpClient,
            resourceCollections,
            apiClients,
            resourceCache,
            serviceResolver,
        },
        refs,
        history,
        settings: {
            core: coreSettings,
            apps: {},
        },
        app: {
            container: appContainer,
        },
        contextManager,
        tasksContainer,
        abortControllerManager,
        notificationCenter,
        peopleContainer,
        userMenuSectionsContainer,
        environment,
        logging: {
            telemetry: telemetryLogger,
            feature: featureLogger,
        },
        options: { environment },
    };
    // @ts-ignore
    window[globalEquinorFusionContextKey] = fusionContext;

    return fusionContext as unknown as IFusionContext;
};
