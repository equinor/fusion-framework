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
        })
    ),
    setManifests: createAction('set_manifests', (manifests: Record<string, LegacyAppManifest>) => ({
        payload: manifests,
    })),
};

export type Actions = ActionTypes<typeof actions>;

const compareApp = (a: LegacyAppManifest, b?: LegacyAppManifest) => {
    if (!b) return true;
    const attr = Object.keys(b) as Array<keyof LegacyAppManifest>;
    return attr.some((key) => {
        switch (key) {
            case 'auth':
                return false;
            //@todo maybe?!?!
            case 'context':
                return false;
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

            case 'category':
                a.category?.id !== b.category?.id &&
                    console.debug('category changed', a.category, b.category);
                return a.category?.id !== b.category?.id;
            // Dates
            case 'publishedDate':
                String(a[key]) !== String(b[key]) &&
                    console.debug('publishedDate changed', a.publishedDate, b.publishedDate);
                return String(a[key]) !== String(b[key]);

            default:
                a[key] !== b[key] && console.debug(`${key} changed`, a[key], b[key]);
                return a[key] !== b[key];
        }
    });
};

const indexManifests = (manifests: LegacyAppManifest[]): Record<string, LegacyAppManifest> =>
    manifests.reduce((cur, value) => Object.assign(cur, { [value.key]: value }), {});

export class LegacyAppContainer extends EventEmitter<AppContainerEvents> {
    #framework: PortalFramework;
    #manifests: FlowSubject<Record<string, LegacyAppManifest>, Actions>;

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
        return this.#manifests.value;
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
        this.#manifests = new FlowSubject(
            createReducer({} as Record<string, LegacyAppManifest>, (builder) =>
                builder
                    .addCase(actions.setManifests, (state, action) => {
                        state = action.payload;
                    })
                    .addCase(actions.updateManifests, (state, action) => {
                        const currentState = original(state) || {};
                        const nextState = action.payload;
                        for (const appKey in nextState) {
                            const current = currentState[appKey];
                            const next = nextState[appKey];
                            if (!current) {
                                state[appKey] = next;
                            } else if (compareApp(current, next)) {
                                console.debug(`🔥 [${appKey}] manifest changed`, current, next);
                                state[appKey] = { ...current, ...next };
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
        apps.on('change', (apps) => {
            console.debug('app-container changed', apps);
            return this.#manifests.next(actions.updateManifests(apps));
        });
        this.#manifests.subscribe((value) => (apps.state = value));

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

        framework.modules.event.addEventListener('onCurrentAppChanged', (e) => {
            const { next, previous } = e.detail;

            console.debug('📦 current application changed', next, previous);

            const currentManifest = next ? this.#manifests.value[next.appKey] || null : null;
            currentApp.state = currentManifest;
            this.emit('change', currentManifest);

            const previousManifest = previous
                ? this.#manifests.value[previous.appKey] || null
                : null;
            if (previousManifest) {
                previousApps.state = {
                    ...previousApps.state,
                    [previousManifest.key]: previousManifest,
                };
            }

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

            telemetryLogger.trackEvent({
                name: 'App selected',
                properties: {
                    previousApp: currentApp.state ? currentApp.state.name : null,
                    selectedApp: currentManifest?.name,
                    previousApps: Object.keys(previousApps.state).map(
                        (key) => previousApps.state[key].name
                    ),
                    currentApp: currentManifest?.name,
                },
            });
        });

        this.on('fetch', (fetching) => (this.#isUpdating = fetching));
    }

    async setCurrentAppAsync(appKey: string | null): Promise<void> {
        if (appKey) {
            const { key, AppComponent } = this.#manifests.value[appKey];
            if (AppComponent === undefined) {
                await this.#loadScript(key);
            }
            await new Promise((resolve) => window.requestAnimationFrame(resolve));
            const manifest = this.#manifests.value[appKey] as unknown as AppManifest;
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
        return this.#manifests.value[appKey];
    }

    public getAll(): Array<LegacyAppManifest> {
        return Object.values(this.#manifests.value);
    }

    public async getAllAsync(): Promise<Record<string, LegacyAppManifest>> {
        await this.requestUpdate();
        return this.#manifests.value;
    }

    public updateManifest(manifest: LegacyAppManifest): void {
        this.#manifests.next(actions.updateManifests({ [manifest.key]: manifest }));
    }

    public async requestUpdate(): Promise<void> {
        this.requireUpdate && this.#update();
        return this.updateComplete;
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
                    this.#manifests.next(
                        actions.updateManifests(
                            indexManifests(value as unknown as LegacyAppManifest[])
                        )
                    ),
            });
        });
    }
}

export default LegacyAppContainer;
