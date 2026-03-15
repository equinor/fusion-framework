import {
  type ActionInstanceMap,
  type ActionTypes,
  createAction,
  createAsyncAction,
} from '@equinor/fusion-observable';
import type {
  GetWidgetParameters,
  WidgetConfig,
  WidgetManifest,
  WidgetModulesInstance,
  WidgetScriptModule,
} from '../types';

/**
 * Factory that creates all widget state-machine actions.
 *
 * Each action (or async action triplet) drives a specific step in the
 * widget lifecycle: manifest loading, config loading, script import,
 * and initialization.
 *
 * @returns Action creators for the widget state machine.
 */
const createActions = () => ({
  /** Sets the manifest in state (optionally merging with existing). */
  setManifest: createAction('set_manifest', (manifest: WidgetManifest, update?: boolean) => ({
    payload: manifest,
    meta: {
      created: Date.now(),
      update,
    },
  })),
  /** Async action triplet for fetching the widget manifest from the API. */
  fetchManifest: createAsyncAction(
    'fetch_manifest',
    (payload: { key: string; args?: GetWidgetParameters['args'] }, update?: boolean) => ({
      payload,
      meta: { update },
    }),
    (manifest: WidgetManifest) => ({ payload: manifest }),
    (error: unknown) => ({ payload: error }),
  ),
  /** Sets the widget config in state. */
  setConfig: createAction('set_config', (config: WidgetConfig) => ({ payload: config })),
  /** Async action triplet for fetching the widget config from the API. */
  fetchConfig: createAsyncAction(
    'fetch_config',
    (payload: { key: string; args?: GetWidgetParameters['args'] }, update?: boolean) => ({
      payload,
      meta: { update },
    }),
    (config: WidgetConfig) => ({ payload: config }),
    (error: unknown) => ({ payload: error }),
  ),
  /** Sets the dynamically imported widget script module in state. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setModule: createAction('set_module', (module: any) => ({ payload: module })),
  /** Async action triplet for dynamically importing the widget script. */
  importWidget: createAsyncAction(
    'import_widget',
    (entrypoint: string) => ({ payload: entrypoint }),
    (module: WidgetScriptModule) => ({ payload: module }),
    (error: unknown) => ({ payload: error }),
  ),
  /** Sets the resolved widget framework-module instances in state. */
  setInstance: createAction('set_instance', (instance: WidgetModulesInstance) => ({
    payload: instance,
  })),
  /** Async action triplet for the overall widget initialization lifecycle. */
  initialize: createAsyncAction(
    'initialize_widget',
    () => ({ payload: null }),
    () => ({ payload: null }),
    (error: unknown) => ({ payload: error }),
  ),
});

/** Singleton action creators used by the widget state machine. */
export const actions = createActions();

/** Map of action-creator names to their instance types. */
export type ActionBuilder = ReturnType<typeof createActions>;

/** Map of action types produced by the action builders. */
export type ActionMap = ActionInstanceMap<ActionBuilder>;

/** Union of all action types dispatched in the widget state machine. */
export type Actions = ActionTypes<typeof actions>;
