import { FlowSubject } from '@equinor/fusion-observable';

import { createReducer } from './create-reducer.js';

import {
  handleFetchManifest,
  handleFetchConfig,
  handleFetchSettings,
  handleUpdateSettings,
  handleImportApplication,
} from './flows/index.js';

import { actions, type Actions } from './actions.js';
import type { AppBundleState, AppBundleStateInitial } from './types.js';
import type { AppModuleProvider } from '../AppModuleProvider.js';
import {
  OperationalTelemetry,
  type OperationalProperties,
} from '../integrations/OperationalTelemetry.js';
import { measureStage } from '../integrations/measure-stage.js';

/**
 * Creates and configures the reactive state machine ({@link FlowSubject}) for
 * an {@link App} instance.
 *
 * Registers flows for fetching manifests, configs, settings, and importing
 * the application script module.
 *
 * @param value - Initial state values (appKey, tag, and any pre-loaded data).
 * @param provider - The {@link AppModuleProvider} used by flows to fetch data.
 * @param telemetry - Optional scope recording one outcome per load-stage request.
 * @returns A configured `FlowSubject` ready for use by the App class.
 */
export const createState = (
  value: AppBundleStateInitial,
  provider: AppModuleProvider,
  telemetry?: OperationalTelemetry,
): FlowSubject<AppBundleState, Actions> => {
  const reducer = createReducer(value);

  // create state
  const state = new FlowSubject<AppBundleState, Actions>(reducer);

  // add handler for fetching manifest
  state.addFlow(
    handleFetchManifest(
      provider,
      measureStage<Actions>(
        telemetry,
        'load-manifest',
        actions.fetchManifest,
        (action): OperationalProperties => {
          const version =
            actions.fetchManifest.success.match(action) &&
            OperationalTelemetry.safeIdentity(action.payload.build?.version, 'version');
          return version ? { appVersion: version } : {};
        },
      ),
    ),
  );

  // add handler for fetching config
  state.addFlow(
    handleFetchConfig(
      provider,
      measureStage<Actions>(telemetry, 'load-config', actions.fetchConfig),
    ),
  );

  // add handler for fetching settings
  state.addFlow(
    handleFetchSettings(
      provider,
      measureStage<Actions>(telemetry, 'load-settings', actions.fetchSettings),
    ),
  );

  state.addFlow(
    handleUpdateSettings(
      provider,
      measureStage<Actions>(telemetry, 'update-settings', actions.updateSettings),
    ),
  );

  // add handler for loading application script
  state.addFlow(
    handleImportApplication(
      provider,
      measureStage<Actions>(telemetry, 'import', actions.importApp),
    ),
  );

  return state;
};
