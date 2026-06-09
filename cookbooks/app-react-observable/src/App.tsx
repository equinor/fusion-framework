import type { ReactElement } from 'react';

import { gridStyle, mutedTextStyle, pageStyle } from './components/styles';
import { ObservableBasics } from './components/observable';
import { TodoApp } from './components/todo';

/**
 * Renders the observable cookbook application shell.
 *
 * @returns A Fusion React cookbook app for observable state, actions, and reducers.
 * @example
 * <App />
 */
export const App = (): ReactElement => {
  return (
    <main style={pageStyle}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.5rem' }}>Observable React Cookbook</h1>
        <p style={mutedTextStyle}>
          A compact tour of observable state, actions, reducers, dispatch, selectors, teardown, and
          deps.
        </p>
      </header>

      <section style={gridStyle}>
        <ObservableBasics />
        <TodoApp />
      </section>
    </main>
  );
};

export default App;
