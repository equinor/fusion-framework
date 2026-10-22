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
} from '../types.js';

let nextTelemetryAttemptId = 0;

/**
 * Factory function that creates all action creators used by the {@link App}
 * state machine.
 *
 * Actions are grouped by domain:
 * - **Manifest** – `setManifest`, `fetchManifest` (async)
 * - **Config** – `setConfig`, `fetchConfig` (async)
 * - **Settings** – `setSettings`, `fetchSettings` (async), `updateSettings` (async)
 * - **Script module** – `setModule`, `importApp` (async)
 * - **Instance** – `setInstance`
 * - **Lifecycle** – `initialize` (async)
 */
const createActions = () => ({
  /** Manifest loading */
  setManifest: createAction('set_manifest', (manifest: AppManifest, update?: boolean) => ({
    payload: manifest,
    meta: {
      // This timestamps the action, not the manifest, so updates receive a new creation time.
      created: Date.now(),
      update,
    },
  })),

  fetchManifest: createAsyncAction(
    'fetch_manifest',
    (key: string, tag?: string, update?: boolean) => ({
      payload: { key, tag },
      meta: { update, telemetryAttemptId: ++nextTelemetryAttemptId },
    }),
    (manifest: AppManifest, telemetryAttemptId: number) => ({
      payload: manifest,
      meta: { telemetryAttemptId },
    }),
    (error: unknown, telemetryAttemptId: number) => ({
      payload: error,
      meta: { telemetryAttemptId },
    }),
  ),
  /** Config loading */
  setConfig: createAction('set_config', (config: AppConfig) => ({ payload: config })),
  fetchConfig: createAsyncAction(
    'fetch_config',
    (manifest: AppManifest) => ({
      payload: manifest,
      meta: { telemetryAttemptId: ++nextTelemetryAttemptId },
    }),
    (config: AppConfig, telemetryAttemptId: number) => ({
      payload: config,
      meta: { telemetryAttemptId },
    }),
    (error: unknown, telemetryAttemptId: number) => ({
      payload: error,
      meta: { telemetryAttemptId },
    }),
  ),
  /** Settings loading */
  setSettings: createAction('set_settings', (settings?: AppSettings) => ({
    payload: settings,
  })),
  /** Fetching settings */
  fetchSettings: createAsyncAction(
    'fetch_settings',
    (appKey: string) => ({
      payload: { appKey },
      meta: { telemetryAttemptId: ++nextTelemetryAttemptId },
    }),
    (settings: AppSettings, telemetryAttemptId: number) => ({
      payload: settings,
      meta: { telemetryAttemptId },
    }),
    (error: unknown, telemetryAttemptId: number) => ({
      payload: error,
      meta: { telemetryAttemptId },
    }),
  ),
  /** Updating settings */
  updateSettings: createAsyncAction(
    'update_settings',
    (appKey: string, settings: AppSettings) => ({
      payload: { appKey, settings },
      meta: { telemetryAttemptId: ++nextTelemetryAttemptId },
    }),
    (settings: AppSettings, telemetryAttemptId: number) => ({
      payload: settings,
      meta: { telemetryAttemptId },
    }),
    (error: unknown, telemetryAttemptId: number) => ({
      payload: error,
      meta: { telemetryAttemptId },
    }),
  ),
  updateSettingsAbort: createAction('update_settings::abort', (id: string) => ({
    payload: id,
  })),
  /** App loading */
  // biome-ignore lint/suspicious/noExplicitAny: module payload widens to accept any script module shape when set
  setModule: createAction('set_module', (module: any) => ({ payload: module })),
  importApp: createAsyncAction(
    'import_app',
    (entrypoint: string) => ({
      payload: entrypoint,
      meta: { telemetryAttemptId: ++nextTelemetryAttemptId },
    }),
    (module: AppScriptModule, telemetryAttemptId: number) => ({
      payload: module,
      meta: { telemetryAttemptId },
    }),
    (error: unknown, telemetryAttemptId: number) => ({
      payload: error,
      meta: { telemetryAttemptId },
    }),
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

/** Singleton action creator map used by the app state machine. */
export const actions = createActions();

/** Record mapping action names to their creator functions. */
export type ActionBuilder = ReturnType<typeof createActions>;

/** Map of action names to their instantiated action shapes. */
export type ActionMap = ActionInstanceMap<ActionBuilder>;

/** Union of all action types dispatched by the app state machine. */
export type Actions = ActionTypes<typeof actions>;
