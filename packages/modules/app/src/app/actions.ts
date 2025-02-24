import {
  type ActionInstanceMap,
  type ActionTypes,
  createAction,
  createAsyncAction,
} from '@equinor/fusion-observable';
import type {
  AppConfig,
  AppManifest,
  AppModulesInstance,
  AppScriptModule,
  AppSettings,
} from '../types';

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
  /** Settings loading */
  setSettings: createAction('set_settings', (settings?: AppSettings) => ({
    payload: settings,
  })),
  /** Fetching settings */
  fetchSettings: createAsyncAction(
    'fetch_settings',
    (appKey: string) => ({ payload: { appKey } }),
    (settings: AppSettings) => ({ payload: settings }),
    (error: unknown) => ({ payload: error }),
  ),
  /** Updating settings */
  updateSettings: createAsyncAction(
    'update_settings',
    (appKey: string, settings: AppSettings) => ({
      payload: { appKey, settings },
    }),
    (settings: AppSettings) => ({
      payload: settings,
    }),
    (error: unknown) => ({
      payload: error,
    }),
  ),
  updateSettingsAbort: createAction('update_settings::abort', (id: string) => ({
    payload: id,
  })),
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
