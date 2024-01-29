import {
    ActionInstanceMap,
    ActionTypes,
    createAction,
    createAsyncAction,
} from '@equinor/fusion-observable';
import {
    GetWidgetParameters,
    WidgetManifest,
    WidgetModulesInstance,
    WidgetScriptModule,
} from '../types';

const createActions = () => ({
    /** Manifest loading */
    setManifest: createAction('set_manifest', (manifest: WidgetManifest, update?: boolean) => ({
        payload: manifest,
        meta: {
            created: Date.now(),
            update,
        },
    })),
    fetchManifest: createAsyncAction(
        'fetch_manifest',
        (payload: { key: string; args?: GetWidgetParameters['args'] }, update?: boolean) => ({
            payload,
            meta: { update },
        }),
        (manifest: WidgetManifest) => ({ payload: manifest }),
        (error: unknown) => ({ payload: error }),
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setModule: createAction('set_module', (module: any) => ({ payload: module })),
    importWidget: createAsyncAction(
        'import_widget',
        (entrypoint: string) => ({ payload: entrypoint }),
        (module: WidgetScriptModule) => ({ payload: module }),
        (error: unknown) => ({ payload: error }),
    ),
    // widget Instance
    setInstance: createAction('set_instance', (instance: WidgetModulesInstance) => ({
        payload: instance,
    })),
    initialize: createAsyncAction(
        'initialize_widget',
        () => ({ payload: null }),
        () => ({ payload: null }),
        (error: unknown) => ({ payload: error }),
    ),
});

export const actions = createActions();

export type ActionBuilder = ReturnType<typeof createActions>;

export type ActionMap = ActionInstanceMap<ActionBuilder>;

export type Actions = ActionTypes<typeof actions>;
