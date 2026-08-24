import { useEffect, useState } from 'react';

import { useHttpClient } from '@equinor/fusion-framework-react-app/http';

interface Person {
  name: string;
}

/**
 * Fetches and renders a person's name from the bundled `people` service, overridden by
 * `mocks/people.overrides.ts`.
 */
export const PersonName = () => {
  const client = useHttpClient('people');
  const [personName, setPersonName] = useState<string>('Loading…');

  useEffect(() => {
    const controller = new AbortController();
    client
      .json<Person>('/persons/00000000-0000-0000-0000-000000000000', { signal: controller.signal })
      .then(({ name }) => {
        setPersonName(name);
      })
      .catch(() => {
        setPersonName('Failed to load person');
      });
    return () => {
      controller.abort();
    };
  }, [client]);

  return <p data-testid="person-name">{personName}</p>;
};

export default PersonName;
