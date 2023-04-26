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

                this.setAsync('current', currentContext ?? null);

                if (currentContext) {
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
                    const appUrlResolver = {
                        root: `/apps/${app.appKey}`,
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
                                [this.root, path?.replace(/^\//, '')].filter((x) => !!x).join('/')
                            );
                        },
                        navigateContext(context?: ContextItem) {
                            // TODO maybe more sophisticated 🤷
                            const shouldNavigate = this.contextId !== context?.id;

                            console.debug(
                                'LegacyContextManager.appUrlResolver.navigateContext',
                                shouldNavigate ? 'replacing url' : 'context matched url',
                                context
                            );

                            if (shouldNavigate) {
                                this.navigate(this.buildLocation(context));
                            }
                        },
                        buildPathname(context?: ContextItem) {
                            const suggestedUrl = (() => {
                                const { contextId, pathname } = this;
                                if (contextId && context) {
                                    return pathname.replace(contextId, context.id);
                                }
                                return context ? `/${context?.id}` : '/';
                            })();

                            if (manifest.context?.buildUrl) {
                                return manifest.context.buildUrl(
                                    (context as unknown as Context) ?? null,
                                    suggestedUrl
                                );
                            }

                            console.warn(
                                'LegacyContextManager.appUrlResolver.buildPathname',
                                'legacy application with manifest should have method [buildUrl]',
                                suggestedUrl
                            );

                            return suggestedUrl;
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
                            const { currentContext: initialContext } = instance.context;
                            if (initialContext) {
                                appUrlResolver.navigateContext(initialContext);
                            } else {
                                /** remove context from url if no context is presented */
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
                                } else {
                                    const current = await this.getAsync('current');
                                    if (current) {
                                        await instance.context.setCurrentContextByIdAsync(
                                            current.id
                                        );
                                    }
                                }
                            }

                            instance.context.currentContext$
                                .pipe(
                                    pairwise(),
                                    // TODO might not needed 🤷
                                    observeOn(asyncScheduler)
                                )
                                .subscribe({
                                    next: async ([previous, next]) => {
                                        console.debug(
                                            'LegacyContextManager.instance.context.currentContext$',
                                            'context changed',
                                            { app, previous, next }
                                        );
                                        await this.setAsync('current', next);
                                        appUrlResolver.navigateContext(next);
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
