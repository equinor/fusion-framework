import type { RouterHandle } from '@equinor/fusion-framework-react-router';

import { Greeting } from '../components/Greeting';
import { PersonName } from '../components/PersonName';

export const handle = {
  route: {
    description: 'Renders a greeting and a person name, both served by the mock server.',
  },
} as const satisfies RouterHandle;

/**
 * Index route — renders the mocked greeting and person name at the layout's root path.
 */
export default function Index() {
  return (
    <>
      <Greeting />
      <PersonName />
    </>
  );
}
