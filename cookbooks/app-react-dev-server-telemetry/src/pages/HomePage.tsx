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
   * Requests this page; the collector receives only the request's duration and outcome.
   * @param accept - Requested content type. The dev server serves this page as HTML but has no
   *   JSON representation, so requesting JSON fails with 404.
   */
  const sendRequest = async (accept: 'text/html' | 'application/json'): Promise<void> => {
    setRequest('loading');
    try {
      const response = await client.fetch(`${window.location.pathname}?token=never-exported`, {
        headers: { Accept: accept },
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
      <button
        type="button"
        onClick={() => sendRequest('text/html')}
        disabled={request === 'loading'}
      >
        Send HTTP request
      </button>
      <button
        type="button"
        onClick={() => sendRequest('application/json')}
        disabled={request === 'loading'}
      >
        Send failing HTTP request
      </button>
      <p>Request: {request}</p>
    </div>
  );
}

export default HomePage;
