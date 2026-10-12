import { useEffect, type ReactElement } from 'react';

import {
  TelemetryLevel,
  TelemetryScope,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';
import { useAppModule } from '@equinor/fusion-framework-react-app';

/**
 * Records telemetry through the framework's telemetry module. The app adds no adapter or exporter;
 * the dev server exports these items when `FUSION_DEV_SERVER_OTLP_ENDPOINT` is set.
 * @returns A button that records a telemetry event each time it is clicked.
 * @example
 * ```tsx
 * <App />
 * ```
 */
export const App = (): ReactElement => {
  const telemetry = useAppModule<TelemetryModule>('telemetry');

  useEffect(() => {
    telemetry.trackEvent({
      name: 'cookbook_mounted',
      level: TelemetryLevel.Information,
      scope: [TelemetryScope.Application],
    });
  }, [telemetry]);

  /** Records a user interaction so the collector can prove app events are delivered. */
  const sendTelemetryEvent = (): void => {
    telemetry.trackEvent({
      name: 'cookbook_button_click',
      level: TelemetryLevel.Information,
      scope: [TelemetryScope.Application],
      properties: { source: 'cookbook' },
    });
  };

  return (
    <button type="button" onClick={sendTelemetryEvent}>
      Send telemetry event
    </button>
  );
};

export default App;
