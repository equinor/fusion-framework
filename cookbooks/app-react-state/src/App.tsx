import { Button } from '@equinor/eds-core-react';
import { useAppState } from '../../../packages/react/app/src/state/useAppState';
import { StateItems } from './StateItems';

export const App = () => {
  const { state: fooState, setState: setFooState } = useAppState('foo');
  const { state: barState, setState: setBarState } = useAppState('bar');
  return (
    <>
      <StateItems />

      <hr />

      'foo' state: {fooState?.value}
      <Button onClick={() => setFooState(true)}>
        Set state 'foo' to true
      </Button>
      <Button onClick={() => setFooState(false)}>
        Set state 'foo' to false
      </Button>

      <hr />

      'bar' state: {barState?.value}
      <Button onClick={() => setBarState('bar')}>
        Set state 'bar' to 'bar'
      </Button>
      <Button onClick={() => setBarState('baz')}>
        Set state 'bar' to 'baz'
      </Button>
    </>
  );
};

export default App;
