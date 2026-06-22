import { type ReactElement, useMemo } from 'react';
import { BehaviorSubject } from 'rxjs';

import { useObservableState } from '@equinor/fusion-observable/react';

import { buttonRowStyle, buttonStyle, mutedTextStyle, panelStyle } from '../styles';
import { formatValue } from './format';

/**
 * Demonstrates a stateful `BehaviorSubject` source.
 *
 * @returns UI for a stateful observable with synchronous current value.
 * @example
 * <StatefulSubjectPanel />
 */
export const StatefulSubjectPanel = (): ReactElement => {
  const counter = useMemo(() => new BehaviorSubject(0), []);
  const counterState = useObservableState(counter);
  const counterComplete = counterState.complete;

  const incrementCounter = (): void => {
    counter.next(counter.value + 1);
  };

  const completeCounter = (): void => {
    counter.complete();
  };

  return (
    <article style={panelStyle}>
      <h2 style={{ margin: 0 }}>Stateful subject</h2>
      <p style={mutedTextStyle}>
        BehaviorSubject exposes the current value synchronously on first render.
      </p>
      <strong>Value: {formatValue(counterState.value)}</strong>
      <span>Complete: {String(counterState.complete)}</span>
      <div style={buttonRowStyle}>
        <button
          type="button"
          style={buttonStyle}
          onClick={incrementCounter}
          disabled={counterComplete}
        >
          Increment
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={completeCounter}
          disabled={counterComplete}
        >
          Complete
        </button>
      </div>
    </article>
  );
};
