import type { ReactElement } from 'react';

import { DepsAndTeardownPanel } from './DepsAndTeardownPanel';
import { ErrorStatePanel } from './ErrorStatePanel';
import { PlainSubjectPanel } from './PlainSubjectPanel';
import { StatefulSubjectPanel } from './StatefulSubjectPanel';

/**
 * Demonstrates `useObservableState` with stateful subjects, plain observables,
 * `initial`, `error`, `complete`, `teardown`, and `deps` behavior.
 *
 * @returns UI panels for the core observable hook lifecycle features.
 * @example
 * <ObservableBasics />
 */
export const ObservableBasics = (): ReactElement => {
  return (
    <>
      <StatefulSubjectPanel />
      <PlainSubjectPanel />
      <ErrorStatePanel />
      <DepsAndTeardownPanel />
    </>
  );
};
