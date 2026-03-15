import { useLayoutEffect, useState } from 'react';
import type { FlowSubject } from '../FlowSubject';
import type { Action, Effect, ActionType, ExtractAction } from '../types';

/**
 * React hook that attaches a side-effect to a {@link FlowSubject}, filtered
 * by a specific action type.
 *
 * @template S - The state type.
 * @template A - The action type.
 * @template TType - The specific action type to listen for.
 * @param subject - The `FlowSubject` to attach the effect to.
 * @param type - The action type string to filter on.
 * @param effect - The effect function invoked for each matching action.
 */
export function useObservableEffect<
  S,
  A extends Action = Action,
  TType extends ActionType<A> = ActionType<A>,
>(subject: FlowSubject<S, A>, type: TType, effect?: Effect<ExtractAction<A, TType>, S>): void;

/**
 * React hook that attaches a side-effect to a {@link FlowSubject} for all actions.
 *
 * @template S - The state type.
 * @template A - The action type.
 * @param subject - The `FlowSubject` to attach the effect to.
 * @param effect - The effect function invoked for each dispatched action.
 */
export function useObservableEffect<S, A extends Action = Action>(
  subject: FlowSubject<S, A>,
  effect: Effect<A, S>,
): void;
/**
 * Applies a side-effect to a {@link FlowSubject}.
 *
 * The subscription is created on mount (or when `subject` changes) and torn down
 * on unmount. Pass an action type string as the second argument to filter effects
 * to a single action type, or pass the effect function directly to handle all actions.
 *
 * **Important:** The effect may return a new action, which will be dispatched back
 * into the subject. Be careful to avoid infinite loops.
 *
 * @example
 * ```tsx
 * useObservableEffect(subject, 'fetchUser', (action, state) => {
 *   return { type: 'setLoading', payload: true };
 * });
 * ```
 */
export function useObservableEffect<
  S,
  A extends Action = Action,
  TType extends ActionType<A> = ActionType<A>,
>(
  subject: FlowSubject<S, A>,
  effectOrType: Effect<A, S> | TType,
  effect?: Effect<ExtractAction<A, TType>, S>,
): void {
  const [type] = useState(() => (typeof effectOrType === 'string' ? effectOrType : undefined));
  const [fn] = useState(() => effect ?? effectOrType);
  useLayoutEffect(() => {
    const subscription = type
      ? subject.addEffect(type, fn as Effect<ExtractAction<A, TType>, S>)
      : subject.addEffect(fn as Effect<A, S>);
    return () => subscription.unsubscribe();
  }, [subject, type, fn]);
}

export default useObservableEffect;
