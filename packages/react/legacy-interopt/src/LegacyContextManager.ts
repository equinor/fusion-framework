import { asyncScheduler, filter, observeOn, pairwise, scan, tap } from 'rxjs';

import {
    ReliableDictionary,
    EventHub,
    LocalStorageProvider,
    Context,
    type FeatureLogger,
    type ContextManifest,
} from '@equinor/fusion';

import type { ContextCache } from '@equinor/fusion/lib/core/ContextManager';

import { Fusion } from '@equinor/fusion-framework-react';

import { configureModules } from '@equinor/fusion-framework-app';

import { type AppManifest, type AppModule } from '@equinor/fusion-framework-module-app';

import {
    enableContext,
    type ContextItem,
    type ContextModule,
} from '@equinor/fusion-framework-module-context';

import { type NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { LOCAL_STORAGE_CURRENT_CONTEXT_KEY } from './static';

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
                    const { navigator } = navigation;
                    const appUrlResolver = {
                        root: `apps/${app.appKey}`,
                        get location() {
                            return navigation.navigator.location;
                        },
                        get pathname() {
                            const { pathname } = this.location;
                            return pathname.replace(this.root, '').replace(/^[/]/, '');
                        },
                        get contextId() {
                            const { pathname } = this;
                            if (manifest.context?.getContextFromUrl) {
                                return manifest.context.getContextFromUrl(pathname);
                            }

                            console.warn(
                                'LegacyContextManager.appUrlResolver.contextId',
                                'legacy application with manifest should have method [getContextFromUrl]'
                            );

                            const [contextId] =
                                pathname.match(/^\d+$/) ??
                                pathname.match(/^(?:[a-z0-9]+-){4}[a-z0-9]+$/) ??
                                [];
                            return contextId;
                        },
                        navigate(path?: string): void {
                            navigation.navigator.replace(
                                [this.root, path].filter((x) => !!x).join('/')
                            );
                        },
                        buildPathname(context?: ContextItem) {
                            if (manifest.context?.buildUrl) {
                                return manifest.context.buildUrl(
                                    (context as unknown as Context) ?? null,
                                    this.pathname
                                );
                            }

                            console.warn(
                                'LegacyContextManager.appUrlResolver.buildPathname',
                                'legacy application with manifest should have method [buildUrl]'
                            );

                            const { contextId, pathname } = this;
                            if (contextId && context) {
                                return pathname.replace(contextId, context.id);
                            } else {
                                return [this.pathname, context?.id].filter((x) => !!x).join('/');
                            }
                        },
                        buildLocation(context?: ContextItem) {
                            return [this.buildPathname(context), this.location.search]
                                .filter((x) => !!x)
                                .join('?');
                        },
                    };

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

                        configurator.onInitialized(async (instance) => {
                            /** remove context from url if no context is presented */
                            if (!instance.context.currentContext) {
                                const { contextId } = appUrlResolver;
                                console.debug(
                                    'LegacyContextManager.onInitialized',
                                    'application missing context',
                                    contextId
                                        ? `setting context from url [${contextId}]`
                                        : 'no context found in url'
                                );
                                if (contextId) {
                                    await instance.context.setCurrentContextByIdAsync(contextId);
                                }
                            }
                            if (context.currentContext) {
                                // TODO - is it needed, should be fetch by current context?
                                //navigator.replace(buildUrl(context.currentContext));
                            }

                            instance.context.currentContext$
                                .pipe(
                                    pairwise(),
                                    // TODO might not needed 🤷
                                    observeOn(asyncScheduler)
                                )
                                .subscribe({
                                    next: ([previous, next]) => {
                                        const url = appUrlResolver.buildLocation(next);
                                        console.debug(
                                            'LegacyContextManager.instance.context.currentContext$',
                                            url,
                                            app,
                                            { previous, next }
                                        );
                                        if (!next && previous) {
                                            this._clearContextFromLocalStorage();
                                        }
                                        appUrlResolver.navigate(url);
                                    },
                                    error: (err) =>
                                        console.error(
                                            'LegacyContextManager.instance.context.currentContext$',
                                            err
                                        ),
                                    complete: () =>
                                        console.debug(
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
