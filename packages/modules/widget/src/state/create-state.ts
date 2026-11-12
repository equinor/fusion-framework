import { FlowSubject } from '@equinor/fusion-observable';

import { createReducer } from './create-reducer.js';

import { handleFetchManifest, handleImportWidget, handleFetchConfig } from './flows.js';

import { actions, type Actions } from './actions.js';
import type { WidgetState, WidgetStateInitial } from '../types.js';
import type WidgetModuleProvider from '../WidgetModuleProvider.js';
import type {
  OperationalTelemetry,
  OperationalProperties,
} from '@equinor/fusion-framework-module-telemetry';
import { measureStage } from '../integrations/measure-stage.js';

/**
 * Creates and wires the RxJS-based `FlowSubject` state machine for a single
 * widget.
 *
 * Attaches the manifest-fetch, script-import, and config-fetch flows to the
 * subject so that dispatched actions trigger the corresponding side effects.
 *
 * @param value - Initial widget state (name and optional pre-loaded data).
 * @param provider - The {@link WidgetModuleProvider} used by flows to query
 *   the backend API.
 * @param telemetry - Optional scope recording one outcome per load-stage request.
 * @returns A `FlowSubject` managing {@link WidgetState} via {@link Actions}.
 */
export const createState = (
  value: WidgetStateInitial,
  provider: WidgetModuleProvider,
  telemetry?: OperationalTelemetry | (() => OperationalTelemetry | undefined),
): FlowSubject<WidgetState, Actions> => {
  const reducer = createReducer(value);
  const state = new FlowSubject<WidgetState, Actions>(reducer);
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
            (typeof telemetry === 'function' ? telemetry() : telemetry)?.safeIdentity(
              action.payload.version,
              'version',
            );
          return version ? { widgetVersion: version } : {};
        },
      ),
    ),
  );
  state.addFlow(
    handleImportWidget(measureStage<Actions>(telemetry, 'import', actions.importWidget)),
  );
  state.addFlow(
    handleFetchConfig(
      provider,
      measureStage<Actions>(telemetry, 'load-config', actions.fetchConfig),
    ),
  );
  return state;
};
