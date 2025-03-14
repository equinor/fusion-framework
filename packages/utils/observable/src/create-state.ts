import { actionMapper } from './action-mapper';
import { type ActionReducerMapBuilder, createReducer } from './create-reducer';
import { FlowSubject } from './FlowSubject';
import type { ActionDefinitions, ActionTypes } from './types/actions';
import type { ReducerWithInitialState } from './types/reducers';

export type FlowState<TState, TActions extends ActionDefinitions> = {
  subject: FlowSubject<TState, ActionTypes<TActions>>;
  actions: TActions;
  dispatch: ReturnType<typeof actionMapper<TActions>>;
};

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
