import { type ReactElement, useState } from 'react';
import { interval, map } from 'rxjs';

import { useObservableState } from '@equinor/fusion-observable/react';

import { buttonRowStyle, buttonStyle, mutedTextStyle, panelStyle } from '../styles';
import { formatValue } from './format';

/**
 * Demonstrates subscription dependencies and teardown for a memoized interval observable.
 *
 * @returns UI for switching observable dependencies and observing teardown calls.
 * @example
 * <DepsAndTeardownPanel />
 */
export const DepsAndTeardownPanel = (): ReactElement => {
  const [feedName, setFeedName] = useState('alpha');
  const [renderCount, setRenderCount] = useState(0);
  const [teardownCount, setTeardownCount] = useState(0);

  const liveFeedState = useObservableState(
    // Intentionally nasty for the cookbook: this proves `deps` can control a factory-created observable.
    interval(1000).pipe(map((tick) => `${feedName} tick ${tick}`)),
    {
      initial: `${feedName} feed is starting`,
      deps: [feedName],
      teardown: () => setTeardownCount((count) => count + 1),
    },
  );

  const switchFeed = (): void => {
    setFeedName((current) => (current === 'alpha' ? 'bravo' : 'alpha'));
  };

  const repaintWithoutResubscribe = (): void => {
    setRenderCount((count) => count + 1);
  };

  return (
    <article style={panelStyle}>
      <h2 style={{ margin: 0 }}>Deps and teardown</h2>
      <p style={mutedTextStyle}>
        The interval observable resubscribes when `feedName` changes and runs teardown for the
        previous feed.
      </p>
      <strong>Value: {formatValue(liveFeedState.value)}</strong>
      <span>Active feed: {feedName}</span>
      <span>Unrelated renders: {renderCount}</span>
      <span>Teardowns: {teardownCount}</span>
      <div style={buttonRowStyle}>
        <button type="button" style={buttonStyle} onClick={switchFeed}>
          Switch feed
        </button>
        <button type="button" style={buttonStyle} onClick={repaintWithoutResubscribe}>
          Re-render
        </button>
      </div>
    </article>
  );
};
