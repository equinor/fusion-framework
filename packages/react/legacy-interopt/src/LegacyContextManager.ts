import { ReliableDictionary, EventHub, LocalStorageProvider } from '@equinor/fusion';
import type { FeatureLogger, ContextManifest } from '@equinor/fusion';

import type { ContextCache } from '@equinor/fusion/lib/core/ContextManager';

import { Fusion } from '@equinor/fusion-framework-react';
import { configureModules } from '@equinor/fusion-framework-app';
import type { AppManifest, AppModule } from '@equinor/fusion-framework-module-app';
import {
    enableContext,
    ContextItem,
    ContextModule,
} from '@equinor/fusion-framework-module-context';

import { asyncScheduler, filter, map, observeOn, pairwise, scan, tap } from 'rxjs';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { LOCAL_STORAGE_CURRENT_CONTEXT_KEY } from 'static';

type AppManifestLegacy = AppManifest & {
    context?: ContextManifest;
};

export class LegacyContextManager extends ReliableDictionary<ContextCache> {
    #framework: Fusion<[AppModule, NavigationModule]>;

    constructor(args: {
        framework: Fusion<[AppModule, NavigationModule]>;
        // TODO - enable module-navigation
        history: History;
        featureLogger: FeatureLogger;
    }) {
        super(new LocalStorageProvider(`FUSION_CURRENT_CONTEXT`, new EventHub()));

        this.#framework = args.framework;

        const { context, app, navigation } = args.framework.modules;

        context.currentContext$
            .pipe(
                tap((x) => args.featureLogger.setCurrentContext(x?.id ?? null, x?.title ?? null)),
                filter((x): x is ContextItem => !!x),
                scan((acc, value) => {
                    if (!acc.find((x) => x.id === value.id)) {
                        return [value, ...acc].slice(0, 9);
                    }
                    return acc;
                }, [] as Array<ContextItem>)
            )
            .subscribe((values) => {
                const currentContext = values.shift();

                this.setAsync('history', values);

                if (currentContext) {
                    this.setAsync('current', currentContext);
                    args.featureLogger.log('Context selected', '0.0.1', {
                        selectedContext: currentContext,
                        // why do we need and array of all contexts?
                        previusContexts: values.map((c) => ({ id: c.id, name: c.title })),
                    });
                }
            });

        app.current$.subscribe((app) => {
            if (app) {
                const manifest = app.state.manifest as unknown as AppManifestLegacy | undefined;
                if (manifest?.context) {
                    const initModules = configureModules<[ContextModule]>((configurator) => {
                        enableContext(configurator, async (builder) => {
                            // TODO - check build url and get context from url
                            manifest.context?.types &&
                                builder.setContextType(manifest.context.types);
                            manifest.context?.filterContexts &&
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                builder.setContextFilter(manifest.context.filterContexts);
                        });

                        configurator.onInitialized((instance) => {
                            const { navigator } = navigation;
                            const currentContextId = context.currentContext?.id;
                            if (!this._resolveContextIdFromUrl() && currentContextId) {
                                navigator.replace(`apps/${app.appKey}/${currentContextId}`);
                            }

                            instance.context.currentContext$
                                .pipe(
                                    pairwise(),
                                    map(([previous, next]) => ({
                                        previousId: previous?.id,
                                        nextId: next?.id,
                                        urlId: this._resolveContextIdFromUrl(),
                                    })),
                                    // TODO might not needed 🤷
                                    observeOn(asyncScheduler)
                                )
                                .subscribe({
                                    next: (data) => {
                                        const { previousId, nextId, urlId } = data;
                                        console.debug(
                                            'LegacyContextManager.instance.context.currentContext$',
                                            app,
                                            data
                                        );
                                        if (nextId) {
                                            if (urlId) {
                                                navigator.replace(
                                                    navigator.location.pathname.replace(
                                                        urlId,
                                                        nextId
                                                    )
                                                );
                                            } else {
                                                navigator.replace(`apps/${app.appKey}/${nextId}`);
                                            }
                                        } else {
                                            if (previousId) {
                                                this._clearContextFromLocalStorage();
                                            }
                                            navigator.replace(`apps/${app.appKey}`);
                                        }
                                    },
                                    error: (err) =>
                                        console.error(
                                            'LegacyContextManager.instance.context.currentContext$',
                                            err
                                        ),
                                    complete: () =>
                                        console.error(
                                            'LegacyContextManager.instance.context.currentContext$',
                                            'subscription closed',
                                            app
                                        ),
                                });
                        });
                    });
                    initModules({
                        fusion: args.framework,
                        env: { manifest: manifest as AppManifest },
                    });
                }
            }
        });
    }

    protected _resolveContextIdFromUrl(): string | undefined {
        const [, appUrl] = window.location.pathname.match(/apps\/(?:\w|-)+\/(.*)/) ?? [];
        if (appUrl) {
            console.debug(
                'LegacyContextManager::_resolveContextIdFromUrl',
                'failed to resolve context from url',
                window.location.pathname
            );
            return;
        }
        const [contextUrlId] =
            appUrl.match(/^\d+$/) ?? appUrl.match(/^(?:[a-z0-9]+-){4}[a-z0-9]+$/) ?? [];

        console.debug(
            'LegacyContextManager::_resolveContextIdFromUrl',
            `resolved context id [${contextUrlId}] from ${window.location.pathname}`
        );
        return contextUrlId;
    }

    protected _clearContextFromLocalStorage(): void {
        const storage = window.localStorage.getItem(LOCAL_STORAGE_CURRENT_CONTEXT_KEY);
        if (!storage) {
            console.debug(
                'LegacyContextManager::_clearContextFromLocalStorage',
                `no local storage for ${LOCAL_STORAGE_CURRENT_CONTEXT_KEY}`
            );
            return;
        }

        const contextData = JSON.parse(storage);
        if (!contextData) {
            console.debug(
                'LegacyContextManager::_clearContextFromLocalStorage',
                'no data for context found in local storage'
            );
            return;
        }

        if (!contextData.current) {
            console.debug(
                'LegacyContextManager::_clearContextFromLocalStorage',
                'no current context found in local storage'
            );
            return;
        }

        delete contextData.current;
        const setStorage = JSON.stringify(contextData);
        window.localStorage.setItem(LOCAL_STORAGE_CURRENT_CONTEXT_KEY, setStorage);
        console.debug(
            'LegacyContextManager::_clearContextFromLocalStorage',
            'current context removed from local storage'
        );
    }

    public getCurrentContext(): ContextItem | undefined {
        return this.#framework.modules.context.currentContext;
    }

    public async setCurrentContextAsync(context: string | ContextItem | null): Promise<void> {
        const contextProvider = this.#framework.modules.context;
        if (context === null) {
            this.#framework.modules.context.clearCurrentContext();
        } else if (typeof context === 'string') {
            await contextProvider.setCurrentContextByIdAsync(context);
        } else {
            await contextProvider.setCurrentContextAsync(context);
        }
    }

    public async setCurrentContextIdAsync(id: string | null): Promise<void> {
        return this.setCurrentContextAsync(id);
    }

    getLinkedContextAsync() {
        throw Error(
            '🤷 [getLinkedContextAsync] not implemented/supported, context fusion-core if needed'
        );
    }
    getCurrentContextAsync() {
        throw Error(
            '🤷 [getCurrentContextAsync]  not implemented/supported, context fusion-core if needed'
        );
    }
    getHistory() {
        const value = this.toObject();
        return value?.history || [];
    }
    exchangeContextAsync() {
        throw Error(
            '🤷 [exchangeContextAsync]  not implemented/supported, context fusion-core if needed'
        );
    }
    exchangeCurrentContextAsync() {
        throw Error(
            '🤷 [exchangeCurrentContextAsync]  not implemented/supported, context fusion-core if needed'
        );
    }
}

export default LegacyContextManager;
