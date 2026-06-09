import { type ReactElement, useState } from 'react';
import { Subject } from 'rxjs';

import { useObservableState } from '@equinor/fusion-observable/react';

import { buttonRowStyle, buttonStyle, mutedTextStyle, panelStyle } from '../styles';
import { formatValue, initialMessage } from './format';

interface PlainSubjectSession {
  /** Remount key used to replace a completed subject owner. */
  id: number;
  /** Subject instance used for the current plain-subject example session. */
  subject: Subject<string>;
}

interface PlainSubjectSnapshotProps {
  /** Subject observed by `useObservableState`. */
  subject: Subject<string>;
  /** Resets the example with a fresh subject instance. */
  onReset: VoidFunction;
}

/**
 * Renders the current state for a plain `Subject` with an initial hook value.
 *
 * @param subject - Subject observed by `useObservableState`.
 * @param onReset - Resets the plain subject example.
 * @returns Current value, completion status, and controls for a plain subject.
 * @example
 * <PlainSubjectSnapshot subject={subject} onReset={() => undefined} />
 */
const PlainSubjectSnapshot = ({ subject, onReset }: PlainSubjectSnapshotProps): ReactElement => {
  const messageState = useObservableState<string, unknown, string>(subject, {
    initial: initialMessage,
  });
  const messageComplete = messageState.complete;

  const emitMessage = (): void => {
    subject.next(`Message ${Date.now()}`);
  };

  const completeMessages = (): void => {
    subject.complete();
  };

  return (
    <>
      <strong>Value: {formatValue(messageState.value)}</strong>
      <span>Complete: {String(messageState.complete)}</span>
      <div style={buttonRowStyle}>
        <button type="button" style={buttonStyle} onClick={emitMessage} disabled={messageComplete}>
          Emit
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={completeMessages}
          disabled={messageComplete}
        >
          Complete
        </button>
        <button type="button" style={buttonStyle} onClick={onReset}>
          Reset
        </button>
      </div>
    </>
  );
};

/**
 * Demonstrates a plain `Subject` with an initial hook value.
 *
 * @returns UI for a plain subject that can emit, complete, and reset.
 * @example
 * <PlainSubjectPanel />
 */
export const PlainSubjectPanel = (): ReactElement => {
  const [session, setSession] = useState<PlainSubjectSession>(() => ({
    id: 0,
    subject: new Subject<string>(),
  }));

  const resetMessages = (): void => {
    setSession(({ id }) => ({ id: id + 1, subject: new Subject<string>() }));
  };

  return (
    <article style={panelStyle}>
      <h2 style={{ margin: 0 }}>Plain subject with initial</h2>
      <p style={mutedTextStyle}>
        Subject has no current value, so the hook uses the provided initial value.
      </p>
      <PlainSubjectSnapshot key={session.id} subject={session.subject} onReset={resetMessages} />
    </article>
  );
};
