import { QueryClientError } from './QueryClientError';
import { QueryTaskCompleted, State } from './types';

import { actions } from './actions';
import { createReducer as makeReducer } from '@equinor/fusion-observable';

export const createReducer = (initial: State = {}) =>
    makeReducer(initial as State, (builder) =>
        builder
            .addCase(actions.request, (state, action) => {
                const { transaction, task, ref, created } = action.meta;
                state[transaction] = {
                    transaction,
                    task,
                    ref,
                    created,
                };
            })
            .addCase(actions.success, (state, action) => {
                const { request } = action.meta;
                const { transaction, ref } = request.meta;
                const entry = state[transaction];
                if (entry) {
                    const next: QueryTaskCompleted<unknown> = {
                        status: 'complete',
                        transaction,
                        ref,
                        value: action.payload,
                        args: request.payload,
                        created: entry.created,
                        completed: Date.now(),
                    };
                    entry.task.next(next);
                    entry.task.complete();
                }
                delete state[transaction];
            })
            .addCase(actions.retry, (state, action) => {
                const { transaction } = action.payload.meta;
                const entry = state[transaction];
                if (entry) {
                    entry.retry ??= [];
                    entry.retry.push(Date.now());
                }
            })
            .addCase(actions.cancel, (state, action) => {
                const { transaction, reason } = action.payload;
                const entry = state[transaction];
                if (entry) {
                    entry.task.error(
                        new QueryClientError('abort', 'request was canceled', new Error(reason))
                    );
                    delete state[transaction];
                }
            })
            .addCase(actions.failure, (state, action) => {
                const { payload, meta } = action;
                const { transaction } = meta.request.meta;
                const entry = state[transaction];
                if (entry) {
                    entry.errors ??= [];
                    entry.errors.push(payload);
                }
            })
    );

export default createReducer;
