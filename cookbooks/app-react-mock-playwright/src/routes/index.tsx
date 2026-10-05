import type { RouterHandle } from '@equinor/fusion-framework-react-router';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import { useEffect, useState, type ReactElement } from 'react';
import { HelpInfoButton } from '../components/HelpInfoButton';

interface GreetingResponse {
  message: string;
}

interface IdentityResponse {
  userId: string;
}

export const handle = {
  route: {
    description: 'Demonstrates an app-owned API configured without service discovery.',
  },
} as const satisfies RouterHandle;

/**
 * Demonstrates a direct-only app-owned API whose URL comes from `app.config.local.ts`.
 *
 * `mocks/my-api.mock.ts` serves the API but uses `serviceDiscovery: false`, so the app configures
 * the client endpoint explicitly instead of registering a framework service client.
 *
 * @returns The direct-only service explanation and its loading, error, or resolved response.
 *
 * @example
 * Navigate to the cookbook root while `ffc mock-server` and `ffc app dev --mock` run.
 */
export default function DirectOnlyServicePage(): ReactElement {
  const client = useHttpClient('my-api');
  const [greeting, setGreeting] = useState<string>('Loading...');
  const [identity, setIdentity] = useState<string>('Loading...');

  useEffect(() => {
    const controller = new AbortController();
    // Fetch ordinary data and the echoed bearer identity through the same scoped Fusion HTTP client.
    Promise.all([
      client.json<GreetingResponse>('/greeting', { signal: controller.signal }),
      client.json<IdentityResponse>('/identity', { signal: controller.signal }),
    ])
      .then(([greetingResponse, identityResponse]) => {
        setGreeting(greetingResponse.message);
        setIdentity(identityResponse.userId);
      })
      .catch(() => {
        setGreeting('Failed to load greeting');
        setIdentity('Failed to load identity');
      });
    return () => controller.abort();
  }, [client]);

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <h2>Direct-only app service</h2>
        <HelpInfoButton articleSlug="direct-only-service" label="Direct-only app service" />
      </div>
      <p>
        This app owns the service URL. The mock supplies its OpenAPI behavior but deliberately stays
        out of service discovery.
      </p>
      <p data-testid="greeting">Response: {greeting}</p>
      <p data-testid="identity">Authenticated as: {identity}</p>
    </section>
  );
}
