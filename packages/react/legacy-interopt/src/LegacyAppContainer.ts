import {
    AppManifest as LegacyAppManifest,
    DistributedState,
    EventEmitter,
    FeatureLogger,
    IEventHub,
    TelemetryLogger,
} from '@equinor/fusion';

import { AppManifest } from '@equinor/fusion-framework-app';
import { ActionTypes, createAction, createReducer, FlowSubject } from '@equinor/fusion-observable';

import { original } from 'immer';
import { pairwise, Subscription } from 'rxjs';

import type { PortalFramework } from './types';

type AppContainerEvents = {
    update: (app: Record<string, LegacyAppManifest>) => void;
    change: (app: LegacyAppManifest | null) => void;
    fetch: (status: boolean) => void;
};

// export type EventHandlerParameter<
//     TEvent extends Record<string, (...args: any[]) => void>,
//     TKey extends keyof TEvent,
//     THandler extends TEvent[TKey] = TEvent[TKey]
// > = THandler extends (arg: infer P) => void ? P : never;

export const actions = {
    updateManifests: createAction(
        'update_manifest',
        (manifest: Record<string, LegacyAppManifest>) => ({
            payload: manifest,
            meta: { created: Date.now() },
        })
    ),
};

export type Actions = ActionTypes<typeof actions>;

const compareApp = (a: LegacyAppManifest, b?: LegacyAppManifest) => {
    if (!b) return true;
    const attr = Object.keys(b) as Array<keyof LegacyAppManifest>;
    return attr.some((key) => {
        switch (key) {
            case 'render':
            case 'AppComponent':
                return a[key] !== b[key];

            case 'tags': {
                if (a.tags.length !== b.tags.length) {
                    console.debug('tags changed', a.tags, b.tags);
                    return true;
                }
                for (const tag of b.tags ?? []) {
                    if (!a.tags.includes(tag)) {
                        console.debug(`tag [${tag}] changed`, a.tags, b.tags);
                        return true;
                    }
                }
                return false;
            }

            case 'category': {
                const hasChanged = a.category?.id !== b.category?.id;
                if (hasChanged) {
                    console.debug('category changed', a.category, b.category);
                }
                return hasChanged;
            }
            // Dates
            case 'publishedDate': {
                const hasChanged = String(a[key]) !== String(b[key]);
                if (hasChanged) {
                    console.debug('publishedDate changed', a.publishedDate, b.publishedDate);
                }
                return String(a[key]) !== String(b[key]);
            }
        }
        return false;
    });
};

const indexManifests = (manifests: LegacyAppManifest[]): Record<string, LegacyAppManifest> =>
    manifests.reduce((cur, value) => Object.assign(cur, { [value.key]: value }), {});

/** minimum time between updated of internal state */
const minManifestLastUpdated = 20;

export class LegacyAppContainer extends EventEmitter<AppContainerEvents> {
    #framework: PortalFramework;
    #subscription: Subscription;
    #state: FlowSubject<
        { lastUpdated: number; manifests: Record<string, LegacyAppManifest> },
        Actions
    >;

    #updateTask: Promise<void> & { state?: 'pending' | 'fulfilled' | 'rejected' } =
        Promise.resolve();

    #isUpdating = false;
    public get isUpdating(): boolean {
        return this.#isUpdating;
    }

    #lastUpdated?: number;
    public get lastUpdated(): number | undefined {
        return this.#lastUpdated;
    }

    public get requireUpdate(): boolean {
        return this.isUpdating === false && this.#updateTask.state !== 'pending';
    }

    public get updateComplete(): Promise<void> {
        return this.#updateTask;
    }

    get currentApp(): LegacyAppManifest | undefined {
        return this.#framework.modules.app.current?.state.manifest as unknown as LegacyAppManifest;
    }

    get allApps(): Record<string, LegacyAppManifest> {
        return this.#state.value.manifests;
    }

    constructor(args: {
        framework: PortalFramework;
        eventHub: IEventHub;
        featureLogger: FeatureLogger;
        telemetryLogger: TelemetryLogger;
    }) {
        super();
        const { framework, eventHub, featureLogger, telemetryLogger } = args;

        this.#framework = framework;

        this.#subscription = new Subscription();

        this.#state = new FlowSubject(
            createReducer(
                {
                    lastUpdated: 0,
                    manifests: {} as Record<string, LegacyAppManifest>,
                },
                (builder) =>
                    builder.addCase(actions.updateManifests, (state, action) => {
                        const currentState = original(state.manifests) || {};
                        const nextState = action.payload;

                        const lastUpdated = action.meta.created - state.lastUpdated;
                        console.debug(
                            '🕥 LegacyAppContainer',
                            `${lastUpdated}ms since last update`
                        );
                        if (lastUpdated < minManifestLastUpdated) {
                            return console.warn(
                                '🚨 LegacyAppContainer',
                                'loop detection! skipping updating of state!',
                                currentState,
                                nextState
                            );
                        }

                        for (const appKey in nextState) {
                            const current = currentState[appKey];
                            const next = nextState[appKey];
                            if (!current) {
                                state.manifests[appKey] = next;
                                state.lastUpdated = action.meta.created;
                            } else if (compareApp(current, next)) {
                                console.debug(
                                    '🔥 LegacyAppContainer',
                                    `[${appKey}] manifest changed`,
                                    current,
                                    next
                                );
                                state.manifests[appKey] = { ...current, ...next };
                                state.lastUpdated = action.meta.created;
                            }
                        }
                    })
            )
        );

        /** legacy wrapper */
        const apps = new DistributedState<Record<string, LegacyAppManifest>>(
            'AppContainer.apps',
            {},
            eventHub
        );

        /** legacy wrapper */
        const currentApp = new DistributedState<LegacyAppManifest | null>(
            'AppContainer.currentApp',
            null,
            eventHub
        );
        const previousApps = new DistributedState<Record<string, LegacyAppManifest>>(
            'AppContainer.previousApps',
            {},
            eventHub
        );

        /** this should not happen, this means there is a duplicate app manager */
        this.#subscription.add(
            /** danger zone, this might cause loop */
            apps.on('change', (apps) => {
                console.debug('🚨 LegacyAppContainer', 'manifest changed', apps);
                return this.#state.next(actions.updateManifests(apps));
            })
        );

        this.#subscription.add(
            this.#state.subscribe((value) => {
                this.emit('update', value);
                /** update legacy DistributedState */
                apps.state = value.manifests;
            })
        );

        /** this is all legacy remove in future */
        this.#subscription.add(
            framework.modules.app.current$.pipe(pairwise()).subscribe(([previous, current]) => {
                const { manifests } = this.#state.value;
                /** update current app state */
                const currentManifest = current ? manifests[current.appKey] || null : null;
                currentApp.state = currentManifest;

                /** notify that current application changed!  */
                this.emit('change', currentManifest);

                /** update previous app state */
                const previousManifest = previous ? manifests[previous.appKey] || null : null;

                if (previousManifest) {
                    previousApps.state = {
                        ...previousApps.state,
                        [previousManifest.key]: previousManifest,
                    };
                }

                /** log entry to Fusion feature logger */
                featureLogger.setCurrentApp(currentManifest?.key || null);
                featureLogger.log('App selected', '0.0.1', {
                    selectedApp: currentManifest
                        ? {
                              key: currentManifest.key,
                              name: currentManifest.name,
                          }
                        : null,
                    previousApps: Object.keys(previousApps.state).map((key) => ({
                        key,
                        name: previousApps.state[key].name,
                    })),
                });

                if (!currentManifest?.context) {
                    // Reset context on feature logger if current app does not support it
                    featureLogger.setCurrentContext(null, null);
                }

                /** log change in AI */
                telemetryLogger.trackEvent({
                    name: 'App selected',
                    properties: {
                        previousApp: previousManifest ? previousManifest.name : null,
                        selectedApp: currentManifest?.name,
                        previousApps: Object.keys(previousApps.state).map(
                            (key) => previousApps.state[key].name
                        ),
                        currentApp: currentManifest?.name,
                    },
                });
            })
        );

        this.on('fetch', (fetching) => (this.#isUpdating = fetching));
    }

    async setCurrentAppAsync(appKey: string | null): Promise<void> {
        if (appKey) {
            const { AppComponent, render } = this.get(appKey) || {};
            /**
             * assume if the manifest missing AppComponent or render, that loading is required
             */
            if (!!AppComponent && !!render) {
                await this.#loadScript(appKey);
            }
            await new Promise((resolve) => window.requestAnimationFrame(resolve));
            const manifest = this.get(appKey) as unknown as AppManifest;
            const appProvider = this.#framework.modules.app;
            const currentApp = appProvider.current;
            if (currentApp && currentApp.appKey === appKey) {
                currentApp.updateManifest(manifest);
                await currentApp.getConfigAsync();
            } else {
                if (currentApp?.appKey !== appKey) {
                    console.warn(
                        'LegacyAppContainer::setCurrentAppAsync',
                        'miss match of application keys!, should not happen'
                    );
                } else {
                    console.error(
                        '🚨',
                        'LegacyAppContainer::setCurrentAppAsync',
                        'these lines should newer been reached'
                    );
                }
                const newApp = appProvider.createApp({ appKey, manifest });
                await newApp.getConfigAsync();
                appProvider.setCurrentApp(newApp);
            }
        } else {
            this.#framework.modules.app.clearCurrentApp();
        }
    }

    public get(appKey: string): LegacyAppManifest | undefined {
        return this.#state.value.manifests[appKey];
    }

    public getAll(): Array<LegacyAppManifest> {
        return Object.values(this.#state.value.manifests);
    }

    public async getAllAsync(): Promise<Record<string, LegacyAppManifest>> {
        await this.requestUpdate();
        return this.#state.value.manifests;
    }

    public updateManifest(manifest: LegacyAppManifest): void {
        this.#state.next(actions.updateManifests({ [manifest.key]: manifest }));
    }

    public async requestUpdate(): Promise<void> {
        this.requireUpdate && this.#update();
        return this.updateComplete;
    }

    public dispose() {
        this.#subscription.unsubscribe();
    }

    async #loadScript(appKey: string): Promise<void> {
        // const { uri } = await this.#framework.modules.serviceDiscovery.resolveService('portal');
        // const source = new URL(`/bundles/apps/${appKey}.js`, uri);
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.async = true;
            document.head.appendChild(script);

            script.addEventListener('load', () => resolve());
            script.addEventListener('abort', () => reject());
            script.addEventListener('error', () => reject());

            script.src = `/bundles/apps/${appKey}.js`;
        });
    }

    #update(): void {
        this.#updateTask = new Promise((resolve, reject) => {
            this.#updateTask.state = 'pending';
            this.#framework.modules.app.getAllAppManifests().subscribe({
                complete: () => {
                    this.#updateTask.state = 'fulfilled';
                    this.#lastUpdated = Date.now();
                    resolve();
                },
                error: (err) => {
                    this.#updateTask.state = 'rejected';
                    reject(err);
                },
                next: (value) =>
                    this.#state.next(
                        actions.updateManifests(
                            indexManifests(value as unknown as LegacyAppManifest[])
                        )
                    ),
            });
        });
    }
}

export default LegacyAppContainer;
