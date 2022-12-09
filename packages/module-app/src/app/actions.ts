import {
    ActionInstanceMap,
    ActionTypes,
    createAction,
    createAsyncAction,
} from '@equinor/fusion-observable';
import { AppConfig, AppManifest, AppModulesInstance, AppScriptModule } from '../types';

const createActions = () => ({
    /** Manifest loading */
    setManifest: createAction('set_manifest', (manifest: AppManifest) => ({
        payload: manifest,
        meta: { created: Date.now() },
    })),
    fetchManifest: createAsyncAction(
        'fetch_manifest',
        (key: string) => ({ payload: key }),
        (manifest: AppManifest) => ({ payload: manifest }),
        (error: unknown) => ({ payload: error })
    ),
    /** Config loading */
    setConfig: createAction('set_config', (config: AppConfig) => ({ payload: config })),
    fetchConfig: createAsyncAction(
        'fetch_config',
        (key: string) => ({ payload: key }),
        (config: AppConfig) => ({ payload: config }),
        (error: unknown) => ({ payload: error })
    ),
    /** App loading */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setModule: createAction('set_module', (module: any) => ({ payload: module })),
    importApp: createAsyncAction(
        'import_app',
        (entrypoint: string) => ({ payload: entrypoint }),
        (module: AppScriptModule) => ({ payload: module }),
        (error: unknown) => ({ payload: error })
    ),

    // App Instance
    setInstance: createAction('set_instance', (instance: AppModulesInstance) => ({
        payload: instance,
    })),
});

export const actions = createActions();

export type ActionBuilder = ReturnType<typeof createActions>;

export type ActionMap = ActionInstanceMap<ActionBuilder>;

export type Actions = ActionTypes<typeof actions>;
