import type { Observable, ObservableInput } from 'rxjs';
import type { AnyAction } from './actions';

/**
 * A flow function (similar to a Redux-Observable epic) that receives an
 * observable of actions and an observable of state, and returns an observable
 * of new actions to be dispatched.
 *
 * @template TAction - The action type.
 * @template TState - The state type.
 */
export type Flow<TAction extends AnyAction, TState = unknown> = (
  action: Observable<TAction>,
  state: Observable<TState>,
) => Observable<TAction>;

/**
 * An effect function that receives a single action and the current state,
 * and optionally returns a new action (or `void`) to be dispatched.
 *
 * Unlike {@link Flow}, effects operate on individual actions rather than
 * the full action stream.
 *
 * @template TAction - The action type.
 * @template TState - The state type.
 */
export type Effect<TAction extends AnyAction, TState = unknown> = (
  action: TAction,
  state: TState,
) => ObservableInput<TAction | void> | TAction | void;
