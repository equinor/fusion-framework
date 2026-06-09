import { type ReactElement, useState } from 'react';
import { Subject } from 'rxjs';

import { useObservableState } from '@equinor/fusion-observable/react';

import { buttonRowStyle, buttonStyle, mutedTextStyle, panelStyle } from '../styles';
import { formatValue } from './format';

interface ErrorSubjectSession {
  /** Remount key used to replace an errored subject owner. */
  id: number;
  /** Subject instance used for the current error-state example session. */
  subject: Subject<number>;
}

interface ErrorStateSnapshotProps {
  /** Subject observed by `useObservableState`. */
  subject: Subject<number>;
  /** Resets the example with a fresh subject instance. */
  onReset: VoidFunction;
}

/**
 * Renders the current state for a subject that can fail.
 *
 * @param subject - Subject observed by `useObservableState`.
 * @param onReset - Resets the error-state example.
 * @returns Current value, error status, and controls for an erroring subject.
 * @example
 * <ErrorStateSnapshot subject={subject} onReset={() => undefined} />
 */
const ErrorStateSnapshot = ({ subject, onReset }: ErrorStateSnapshotProps): ReactElement => {
  const errorState = useObservableState<number, string, number>(subject, { initial: 0 });
  const hasError = errorState.error !== null;

  const emitErrorValue = (): void => {
    subject.next(errorState.value + 1);
  };

  const failErrorStream = (): void => {
    subject.error('Simulated observable failure');
  };

  return (
    <>
      <strong>Value: {formatValue(errorState.value)}</strong>
      <span>Error: {errorState.error ?? 'none'}</span>
      <div style={buttonRowStyle}>
        <button type="button" style={buttonStyle} onClick={emitErrorValue} disabled={hasError}>
          Emit
        </button>
        <button type="button" style={buttonStyle} onClick={failErrorStream} disabled={hasError}>
          Error
        </button>
        <button type="button" style={buttonStyle} onClick={onReset}>
          Reset
        </button>
      </div>
    </>
  );
};

/**
 * Demonstrates observable error state and reset by remounting the hook owner.
 *
 * @returns UI for a subject that can emit values, error, and reset.
 * @example
 * <ErrorStatePanel />
 */
export const ErrorStatePanel = (): ReactElement => {
  const [session, setSession] = useState<ErrorSubjectSession>(() => ({
    id: 0,
    subject: new Subject<number>(),
  }));

  const resetErrorStream = (): void => {
    setSession(({ id }) => ({ id: id + 1, subject: new Subject<number>() }));
  };

  return (
    <article style={panelStyle}>
      <h2 style={{ margin: 0 }}>Error state</h2>
      <p style={mutedTextStyle}>The hook keeps the last value and exposes the observable error.</p>
      <ErrorStateSnapshot key={session.id} subject={session.subject} onReset={resetErrorStream} />
    </article>
  );
};
