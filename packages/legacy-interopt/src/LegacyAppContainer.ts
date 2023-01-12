import {
    AppManifest,
    DistributedState,
    EventEmitter,
    FeatureLogger,
    IEventHub,
    TelemetryLogger,
} from '@equinor/fusion';

import { ActionTypes, createAction, createReducer, FlowSubject } from '@equinor/fusion-observable';

import type { PortalFramework } from './types';

type AppContainerEvents = {
    update: (app: Record<string, AppManifest>) => void;
    change: (app: AppManifest | null) => void;
    fetch: (status: boolean) => void;
};

// export type EventHandlerParameter<
//     TEvent extends Record<string, (...args: any[]) => void>,
//     TKey extends keyof TEvent,
//     THandler extends TEvent[TKey] = TEvent[TKey]
// > = THandler extends (arg: infer P) => void ? P : never;

export const actions = {
    updateManifests: createAction('update_manifest', (manifest: Record<string, AppManifest>) => ({
        payload: manifest,
    })),
    setManifests: createAction('set_manifests', (manifests: Record<string, AppManifest>) => ({
        payload: manifests,
    })),
};

export type Actions = ActionTypes<typeof actions>;

const compareApp = (a: AppManifest, b?: AppManifest) => {
    if (!b) return true;
    const attr = Object.keys(a) as Array<keyof AppManifest>;
    return attr.some((key) => {
        switch (key) {
            case 'auth':
                return false;
            //@todo maybe?!?!
            case 'context':
                return false;
            case 'tags': {
                for (const tag of a.tags) {
                    if (b.tags.includes(tag)) {
                        return true;
                    }
                }
                return false;
            }

            case 'category':
                return a.category?.id !== b.category?.id;
            // Dates
            case 'publishedDate':
                return String(a[key]) !== String(b[key]);

            default:
                return a[key] !== b[key];
        }
    });
};

const indexManifests = (manifests: AppManifest[]): Record<string, AppManifest> =>
    manifests.reduce((cur, value) => Object.assign(cur, { [value.key]: value }), {});

export class LegacyAppContainer extends EventEmitter<AppContainerEvents> {
    #framework: PortalFramework;
    #manifests: FlowSubject<Record<string, AppManifest>, Actions>;

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

    get currentApp(): AppManifest | undefined {
        return this.#framework.modules.app.current?.state.manifest as unknown as AppManifest;
    }

    get allApps(): Record<string, AppManifest> {
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
            createReducer({} as Record<string, AppManifest>, (builder) =>
                builder
                    .addCase(actions.setManifests, (state, action) => {
                        state = action.payload;
                    })
                    .addCase(actions.updateManifests, (state, action) => {
                        for (const appKey in action.payload) {
                            const next = action.payload[appKey];
                            const current = state[appKey];
                            if (!current || compareApp(current, next)) {
                                state[appKey] = { ...current, ...next };
                            }
                        }
                    })
            )
        );

        /** legacy wrapper */
        const apps = new DistributedState<Record<string, AppManifest>>(
            'AppContainer.apps',
            {},
            eventHub
        );
        apps.on('change', (apps) => {
            return this.#manifests.next(actions.updateManifests(apps));
        });
        this.#manifests.subscribe((value) => (apps.state = value));

        /** legacy wrapper */
        const currentApp = new DistributedState<AppManifest | null>(
            'AppContainer.currentApp',
            null,
            eventHub
        );
        const previousApps = new DistributedState<Record<string, AppManifest>>(
            'AppContainer.previousApps',
            {},
            eventHub
        );

        framework.modules.event.addEventListener('onCurrentAppChanged', (e) => {
            const { next, previous } = e.detail;

            console.log('📦 current application changed', next, previous);

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
            const manifest = this.#manifests.value[appKey];
            if (!manifest.AppComponent) {
                await this.#loadScript(manifest.key);
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const app = this.#framework.modules.app.createApp({ appKey, manifest });
            await app.getConfigAsync();
            this.#framework.modules.app.setCurrentApp(app);
        } else {
            this.#framework.modules.app.clearCurrentApp();
        }
    }

    public get(appKey: string): AppManifest | undefined {
        return this.#manifests.value[appKey];
    }

    public getAll(): Array<AppManifest> {
        return Object.values(this.#manifests.value);
    }

    public async getAllAsync(): Promise<Record<string, AppManifest>> {
        await this.requestUpdate();
        return this.#manifests.value;
    }

    public updateManifest(manifest: AppManifest): void {
        this.#manifests.next(actions.updateManifests({ [manifest.key]: manifest }));
    }

    public async requestUpdate(): Promise<void> {
        this.requireUpdate && this.#update();
        return this.updateComplete;
    }

    async #loadScript(appKey: string): Promise<void> {
        const { uri } = await this.#framework.modules.serviceDiscovery.resolveService('portal');
        const source = new URL(`/bundles/apps/${appKey}.js`, uri);
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.async = true;
            document.head.appendChild(script);

            script.addEventListener('load', () => resolve());
            script.addEventListener('abort', () => reject());
            script.addEventListener('error', () => reject());

            script.src = source.href;
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
                        actions.updateManifests(indexManifests(value as unknown as AppManifest[]))
                    ),
            });
        });
    }
}

export default LegacyAppContainer;
