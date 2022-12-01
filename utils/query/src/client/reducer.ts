import type { Reducer } from '@equinor/fusion-observable';

import { ActionTypes } from './actions';
import { QueryClientError } from './QueryClientError';
import { QueryTaskCompleted, State } from './types';

export const createReducer =
    <TType, TArgs>(): Reducer<State<TType, TArgs>, ActionTypes<TType, TArgs>> =>
    (state, action) => {
        switch (action.type) {
            case 'request': {
                const { transaction, task, ref } = action.meta;
                return Object.assign({}, state, {
                    [transaction]: {
                        transaction,
                        task,
                        ref,
                        created: Date.now(),
                    },
                });
            }

            case 'retry': {
                const { transaction } = action.payload.meta;
                const entry = { ...state[transaction] };
                if (entry) {
                    entry.retry = entry.retry ? [...entry.retry, Date.now()] : [];
                    return Object.assign({}, state, { [transaction]: entry });
                }
                break;
            }

            case 'failure': {
                const { transaction } = action.meta.request.meta;
                const entry = { ...state[transaction] };
                if (entry) {
                    entry.errors = entry.errors ? [...entry.errors, action.payload] : [];
                    return Object.assign({}, state, { [transaction]: entry });
                }
                break;
            }

            case 'cancel': {
                const { transaction, reason } = action.payload;
                const entry = state[transaction];
                if (entry) {
                    entry.task.error(
                        new QueryClientError('abort', 'request was canceled', new Error(reason))
                    );
                    const next = { ...state };
                    delete next[transaction];
                    return next;
                }
                break;
            }
            case 'error': {
                const { transaction } = action.meta.request.meta;
                const entry = state[transaction];
                if (entry) {
                    entry.task.error(
                        new QueryClientError('error', 'failed to execute request', action.payload)
                    );
                    const next = { ...state };
                    delete next[transaction];
                    return next;
                }
                break;
            }
            case 'success': {
                const { request } = action.meta;
                const { transaction, ref } = request.meta;
                const entry = state[transaction];
                if (entry) {
                    const taskNext: QueryTaskCompleted<TType, TArgs> = {
                        status: 'complete',
                        transaction,
                        ref,
                        value: action.payload,
                        args: request.payload,
                        created: entry.created,
                        completed: Date.now(),
                    };
                    entry.task.next(taskNext);
                    entry.task.complete();
                    const next = { ...state };
                    delete next[transaction];
                    return next;
                }
                break;
            }
        }
        return state;
    };

export default createReducer;
