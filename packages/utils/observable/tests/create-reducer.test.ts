import { describe, it, expect } from 'vitest';
import { createReducer } from '../src/create-reducer';
import type { AnyAction, PayloadAction } from '../src/types/actions';

describe('createReducer', () => {
  it('should create a reducer function', () => {
    const initialState = { value: 0 };
    const reducer = createReducer(initialState, () => {
      // no-op
    });
    const result = reducer(reducer.getInitialState(), { type: 'unknown' } as AnyAction);
    expect(result).toEqual(initialState);
  });

  it('should create a reducer with default value from a function', () => {
    const initialState = { value: 0 };
    const reducer = createReducer(
      () => initialState,
      () => {
        // no-op
      },
    );

    // check that the initial value of the reducer is resolved
    expect(reducer.getInitialState()).toEqual(initialState);

    const result = reducer(initialState, { type: 'unknown' } as AnyAction);
    expect(result).toEqual(initialState);
  });

  it('should handle actions and update state correctly', () => {
    const initialState = { value: 0 };
    const updateAction = { type: 'update', payload: 1 };
    const reducer = createReducer<typeof initialState, typeof updateAction>(
      initialState,
      (builder) => {
        builder.addCase(updateAction.type, (state, action) => {
          state.value = action.payload;
        });
      },
    );

    const result = reducer(initialState, updateAction);

    expect(result).toEqual({ value: updateAction.payload });
  });

  it('should handle multiple actions and update state correctly', () => {
    const initialState = { value: 0 };
    const incrementAction = { type: 'increment' } as AnyAction;
    const decrementAction = { type: 'decrement' } as AnyAction;
    const reducer = createReducer(initialState, (builder) => {
      builder.addCase('increment', (state) => {
        state.value += 1;
      });
      builder.addCase('decrement', (state) => {
        state.value -= 1;
      });
    });

    const resultIncrement = reducer(initialState, incrementAction);
    expect(resultIncrement).toEqual({ value: 1 });

    const resultDecrement = reducer(resultIncrement, decrementAction);
    expect(resultDecrement).toEqual({ value: 0 });
  });

  it('should handle default case when no action matches', () => {
    const initialState = { value: 0 };
    const unknownAction = { type: 'unknown' } as AnyAction;
    const reducer = createReducer(initialState, (builder) => {
      builder.addDefaultCase((state) => {
        state.value = -1;
      });
    });

    const result = reducer(initialState, unknownAction);

    expect(result).toEqual({ value: -1 });
  });

  it('should handle matchers correctly', () => {
    const initialState = { value: 0 };
    const incrementAction = { type: 'increment' } as AnyAction;
    const reducer = createReducer(initialState, (builder) => {
      builder.addMatcher(
        (action): action is AnyAction => action.type === 'increment',
        (state) => {
          state.value += 1;
        },
      );
    });

    const result = reducer(initialState, incrementAction);

    expect(result).toEqual({ value: 1 });
  });
});
