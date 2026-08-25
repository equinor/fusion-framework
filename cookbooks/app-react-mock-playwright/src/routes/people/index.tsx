import type { RouterHandle } from '@equinor/fusion-framework-react-router';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import { useEffect, useState, type ReactElement } from 'react';

interface PersonResponse {
  name: string;
}

export const handle = {
  route: {
    description: 'Demonstrates deterministic local behavior for an existing discovered service.',
  },
} as const satisfies RouterHandle;

/**
 * Demonstrates merging local behavior into the existing platform-owned `people` service.
 *
 * The app uses a normal framework service client. `mocks/people.mock.ts` inherits the People API
 * schema and changes only the response needed for deterministic local development and testing.
 *
 * @returns The existing-service explanation and its loading, error, or resolved person response.
 *
 * @example
 * Navigate to `/people` while the cookbook mock and app development servers run.
 */
export default function ExistingServicePage(): ReactElement {
  const client = useHttpClient('people');
  const [personName, setPersonName] = useState<string>('Loading...');

  useEffect(() => {
    const controller = new AbortController();
    client
      .json<PersonResponse>('/persons/00000000-0000-0000-0000-000000000000', {
        signal: controller.signal,
      })
      .then(({ name }) => setPersonName(name))
      .catch(() => setPersonName('Failed to load person'));
    return () => controller.abort();
  }, [client]);

  return (
    <section>
      <h2>Existing discovery service</h2>
      <p>
        The People API already exists in service discovery. The local mock merges deterministic
        route behavior into that existing definition instead of replacing its schema.
      </p>
      <p data-testid="person-name">Response: {personName}</p>
    </section>
  );
}