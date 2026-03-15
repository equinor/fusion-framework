import { actionMapper } from './action-mapper';
import { type ActionReducerMapBuilder, createReducer } from './create-reducer';
import { FlowSubject } from './FlowSubject';
import type { ActionDefinitions, ActionTypes } from './types/actions';
import type { ReducerWithInitialState } from './types/reducers';

/**
 * Describes the output of {@link createState}: a `FlowSubject`, the original
 * action definitions, and pre-bound dispatch functions.
 *
 * @template TState - The managed state type.
 * @template TActions - The action definitions record.
 */
export type FlowState<TState, TActions extends ActionDefinitions> = {
  /** The reactive state subject. */
  subject: FlowSubject<TState, ActionTypes<TActions>>;
  /** The original action creator definitions. */
  actions: TActions;
  /** Pre-bound dispatch functions mapped from the action definitions. */
  dispatch: ReturnType<typeof actionMapper<TActions>>;
};

/**
 * Creates a complete reactive state container with a {@link FlowSubject}, action
 * definitions, and pre-bound dispatch functions.
 *
 * This is a convenience factory that wires together `createReducer`,
 * `FlowSubject`, and `actionMapper` in a single call.
 *
 * @template TState - The state type.
 * @template TActions - The action definitions record.
 * @param actions - A record of action creators.
 * @param reducer_or_builder - Either a pre-built `ReducerWithInitialState`, or an object
 *   with a `builder` callback and `initial` state for inline reducer construction.
 * @returns A {@link FlowState} containing the subject, actions, and dispatch map.
 *
 * @example
 * ```ts
 * import { createState, createAction } from '@equinor/fusion-observable';
 *
 * const actions = {
 *   setName: createAction<string>('setName'),
 * };
 *
 * const { subject, dispatch } = createState(actions, {
 *   initial: { name: '' },
 *   builder: (builder, actions) => {
 *     builder.addCase(actions.setName, (state, action) => {
 *       state.name = action.payload;
 *     });
 *   },
 * });
 *
 * dispatch.setName('Alice');
 * ```
 */
export function createState<TState, TActions extends ActionDefinitions>(
  actions: TActions,
  reducer_or_builder:
    | ReducerWithInitialState<TState, ActionTypes<TActions>>
    | {
        builder: (builder: ActionReducerMapBuilder<TState>, actions: TActions) => void;
        initial: TState | (() => TState);
      },
): {
  subject: FlowSubject<TState, ActionTypes<TActions>>;
  actions: TActions;
  dispatch: ReturnType<typeof actionMapper<TActions>>;
} {
  const reducer: ReducerWithInitialState<
    TState,
    ActionTypes<TActions>
  > = typeof reducer_or_builder === 'function'
    ? reducer_or_builder
    : createReducer(reducer_or_builder.initial as TState, (builder) =>
        reducer_or_builder.builder(builder, actions),
      );

  const subject = new FlowSubject(reducer);
  const dispatch = actionMapper(actions, subject);

  return { actions, dispatch, subject };
}

export default createState;
