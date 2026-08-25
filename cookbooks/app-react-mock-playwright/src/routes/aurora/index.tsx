import type { RouterHandle } from '@equinor/fusion-framework-react-router';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import { useEffect, useState, type ReactElement } from 'react';

interface AuroraForecastResponse {
  location: string;
  activity: string;
}

export const handle = {
  route: {
    description: 'Demonstrates integrating a service before its discovery registration exists.',
  },
} as const satisfies RouterHandle;

/**
 * Demonstrates a future platform service that the app consumes before discovery registration.
 *
 * `mocks/aurora-api.mock.ts` temporarily contributes a complete schema and a local discovery
 * entry. The page already uses the production-style framework client that remains after the
 * backend team registers the service and the temporary `'new'` mock definition is removed.
 *
 * @returns The pre-production explanation and its loading, error, or resolved forecast response.
 *
 * @example
 * Navigate to `/aurora` while the cookbook mock and app development servers run.
 */
export default function PreProductionServicePage(): ReactElement {
  const client = useHttpClient('aurora-api');
  const [forecast, setForecast] = useState<AuroraForecastResponse>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    client
      .json<AuroraForecastResponse>('/forecast', { signal: controller.signal })
      .then((response) => setForecast(response))
      .catch(() => setHasError(true));
    return () => controller.abort();
  }, [client]);

  // A rejected mock request demonstrates the page's explicit service failure state.
  if (hasError) return <p data-testid="aurora-forecast">Failed to load Aurora forecast</p>;
  // No response yet means the discovery-backed request is still in flight.
  if (!forecast) return <p data-testid="aurora-forecast">Loading...</p>;

  return (
    <section>
      <h2>Pre-production discovery service</h2>
      <p>
        Aurora API is not registered yet. The local mock temporarily adds it and rejects collisions
        so a real registration cannot be shadowed accidentally.
      </p>
      <p data-testid="aurora-forecast">
        Response: Aurora activity over {forecast.location}: {forecast.activity}
      </p>
    </section>
  );
}