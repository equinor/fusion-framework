
import { FlowSubject } from '@equinor/fusion-observable';
import type { Actions } from './StateProvider.actions';
import { makeReducer } from './StateProvider.reducer';
import type { IStateItem } from './StateItem';

export type State = {
  items: Record<string, IStateItem>;
};

export type Store = FlowSubject<State, Actions>;

const defaultInitial: State = { items: {} } satisfies State;

export const createStore = (initial?: State): Store => {
  return new FlowSubject<State, Actions>(makeReducer(initial ?? defaultInitial));
}

// @TODO: handleStoreSuccess
