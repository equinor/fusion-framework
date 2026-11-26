import { useEffect, useState, type ReactElement } from 'react';

import {
  TelemetryLevel,
  TelemetryScope,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';
import { useAppModule } from '@equinor/fusion-framework-react-app';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';

/** Progress of the instrumented request, shown so the reader sees every outcome. */
type RequestState = 'idle' | 'loading' | 'success' | 'failure';

/**
 * Produces a custom app event and HTTP request outcomes. The app adds no adapter or exporter of
 * its own; the dev server exports what the framework records.
 * @returns Buttons that record an event and send instrumented requests.
 * @example <HomePage />
 */
export function HomePage(): ReactElement {
  const telemetry = useAppModule<TelemetryModule>('telemetry');
  const client = useHttpClient('cookbook');
  const [request, setRequest] = useState<RequestState>('idle');

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

  /**
   * Requests a local fixture; operational records contain duration and outcome, not the URL.
   * @param scenario - Explicitly selected local success, failure, or delayed response.
   */
  const sendRequest = async (scenario: 'success' | 'failure' | 'slow'): Promise<void> => {
    setRequest('loading');
    try {
      const path =
        scenario === 'success'
          ? window.location.pathname
          : `/@fusion-api/__telemetry-cookbook/${scenario}`;
      const response = await client.fetch(path, {
        headers: { Accept: scenario === 'success' ? 'text/html' : 'application/json' },
      });
      setRequest(response.ok ? 'success' : 'failure');
    } catch {
      setRequest('failure');
    }
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}
    >
      <button type="button" onClick={sendTelemetryEvent}>
        Send telemetry event
      </button>
      <button type="button" onClick={() => sendRequest('success')} disabled={request === 'loading'}>
        Send HTTP request
      </button>
      <button type="button" onClick={() => sendRequest('failure')} disabled={request === 'loading'}>
        Send failing HTTP request
      </button>
      <button type="button" onClick={() => sendRequest('slow')} disabled={request === 'loading'}>
        Send slow HTTP request
      </button>
      <p>Request: {request}</p>
    </div>
  );
}

export default HomePage;
