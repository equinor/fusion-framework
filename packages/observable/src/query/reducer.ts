import type { Reducer } from '..';

import { Actions, ActionType } from './actions';
import { QueryState, QueryStatus } from './types';

export const createReducer =
    <TType, TArgs>(): Reducer<QueryState, Actions<TType, TArgs>> =>
    (state, action) => {
        switch (action.type) {
            case ActionType.REQUEST: {
                const { transaction } = action;
                if (state.transaction === transaction) {
                    return {
                        ...state,
                        status: QueryStatus.ACTIVE,
                        retryCount: (state.retryCount || 0) + 1,
                    };
                }
                return {
                    transaction,
                    status: QueryStatus.ACTIVE,
                    initiated: Date.now(),
                    retryCount: 0,
                };
            }

            case ActionType.SUCCESS: {
                return {
                    ...state,
                    status: QueryStatus.IDLE,
                    completed: Date.now(),
                };
            }

            case ActionType.FAILURE: {
                return {
                    ...state,
                    status: QueryStatus.FAILED,
                };
            }

            case ActionType.ERROR: {
                return {
                    ...state,
                    status: QueryStatus.FAILED,
                    error: action.payload,
                };
            }

            case ActionType.CANCEL: {
                return state.status === QueryStatus.CANCELED
                    ? state
                    : {
                          ...state,
                          status: QueryStatus.CANCELED,
                      };
            }
        }
    };

export default createReducer;
