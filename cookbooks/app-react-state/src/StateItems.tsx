import { useAppState } from '@equinor/fusion-framework-react-app/state';

import { Switch, Typography } from '@equinor/eds-core-react';

export const StateItems = () => {
  const { state: fooState, setState: setFooState } = useAppState('foo');
  const { state: barState, setState: setBarState } = useAppState('bar');
  console.log(fooState);

  const states = [useAppState('foo'), useAppState('bar')];

  return (
    <div style={{ padding: 10 }}>
      <Typography variant="h1">
        Feature Flags
      </Typography>
      <div style={{ display: 'flex', flexFlow: 'column', padding: '1rem' }}>
        {states.map(({ state, setState }) => {
          return (
            <div key={state?.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Typography group="table" variant="cell_header">
                  {state?.key}
                </Typography>
              </div>
              <div>
                {state?.value[Symbol.iterator] === 'function'
                  ? state?.value.join(',')
                  : state?.value
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StateItems;
