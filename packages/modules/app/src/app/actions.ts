import {
    ActionInstanceMap,
    ActionTypes,
    createAction,
    createAsyncAction,
} from '@equinor/fusion-observable';
import type { AppConfig, AppManifest, AppModulesInstance, AppScriptModule } from '../types';

const createActions = () => ({
    /** Manifest loading */
    setManifest: createAction('set_manifest', (manifest: AppManifest, update?: boolean) => ({
        payload: manifest,
        meta: {
            // TODO when updating
            created: Date.now(),
            update,
        },
    })),

    fetchManifest: createAsyncAction(
        'fetch_manifest',
        (key: string, update?: boolean) => ({ payload: key, meta: { update } }),
        (manifest: AppManifest) => ({ payload: manifest }),
        (error: unknown) => ({ payload: error }),
    ),
    /** Config loading */
    setConfig: createAction('set_config', (config: AppConfig) => ({ payload: config })),
    fetchConfig: createAsyncAction(
        'fetch_config',
        (manifest: AppManifest) => ({ payload: manifest }),
        (config: AppConfig) => ({ payload: config }),
        (error: unknown) => ({ payload: error }),
    ),
    /** App loading */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setModule: createAction('set_module', (module: any) => ({ payload: module })),
    importApp: createAsyncAction(
        'import_app',
        (entrypoint: string) => ({ payload: entrypoint }),
        (module: AppScriptModule) => ({ payload: module }),
        (error: unknown) => ({ payload: error }),
    ),

    // App Instance
    setInstance: createAction('set_instance', (instance: AppModulesInstance) => ({
        payload: instance,
    })),

    initialize: createAsyncAction(
        'initialize_app',
        () => ({ payload: null }),
        () => ({ payload: null }),
        (error: unknown) => ({ payload: error }),
    ),
});

export const actions = createActions();

export type ActionBuilder = ReturnType<typeof createActions>;

export type ActionMap = ActionInstanceMap<ActionBuilder>;

export type Actions = ActionTypes<typeof actions>;
