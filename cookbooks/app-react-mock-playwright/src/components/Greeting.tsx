import { useEffect, useState } from 'react';

import { useHttpClient } from '@equinor/fusion-framework-react-app/http';

interface GreetingResponse {
  message: string;
}

/**
 * Fetches and renders a greeting from the `my-api` service discovered through the mock server
 * (see `mocks/my-api.openapi.json`).
 */
export const Greeting = () => {
  const client = useHttpClient('my-api');
  const [greeting, setGreeting] = useState<string>('Loading…');

  useEffect(() => {
    const controller = new AbortController();
    client
      .json<GreetingResponse>('/greeting', { signal: controller.signal })
      .then(({ message }) => {
        setGreeting(message);
      })
      .catch(() => {
        setGreeting('Failed to load greeting');
      });
    return () => {
      controller.abort();
    };
  }, [client]);

  return <h1 data-testid="greeting">{greeting}</h1>;
};

export default Greeting;
