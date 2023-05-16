import { useAppModule } from '@equinor/fusion-framework-react-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { WSModule } from './module';
import { useMemo } from 'react';

export const App = () => {
  const module = useAppModule<WSModule<string>>('WS');
  const messages = useObservableState(useMemo(() => module.messages$, [module]));

  return (
    <>
      <h1>🚀 Hello Fusion(WS-POC)😎</h1>
      <ul>
        <li>
          <>
            {messages.value?.msg}({messages.value?.type})
          </>
        </li>
      </ul>
      <button onClick={() => module.send('foo')}>
        Send foo
      </button>
      <button onClick={() => module.send('foo2')}>Send foo2</button>
    </>
  );
};

export default App;
