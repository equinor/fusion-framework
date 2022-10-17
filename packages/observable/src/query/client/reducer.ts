import type { Reducer } from '../..';

import { ActionTypes } from './actions';
import { State } from './types';

export const createReducer =
    <TType, TArgs>(): Reducer<State, ActionTypes<TType, TArgs>> =>
    (state, action) => {
        switch (action.type) {
            // case 'skipped': {
            //     return state;
            // }

            case 'request': {
                const { transaction } = action.meta;
                if (state.transaction === transaction) {
                    return {
                        ...state,
                        status: 'active',
                        retryCount: (state.retryCount || 0) + 1,
                    };
                }
                return {
                    transaction,
                    status: 'active',
                    initiated: Date.now(),
                    retryCount: 0,
                };
            }

            case 'success': {
                return {
                    ...state,
                    status: 'idle',
                    completed: Date.now(),
                };
            }

            case 'failure': {
                return {
                    ...state,
                    status: 'failed',
                };
            }

            case 'error': {
                return {
                    ...state,
                    status: 'failed',
                    error: action.payload,
                };
            }

            case 'cancel': {
                return state.status === 'canceled'
                    ? state
                    : {
                          ...state,
                          status: 'canceled',
                      };
            }
        }
    };

export default createReducer;
