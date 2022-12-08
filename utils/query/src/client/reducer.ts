import { original } from 'immer';

import { createReducer as makeReducer } from '@equinor/fusion-observable';

import { QueryClientError } from './QueryClientError';

import { actions } from './actions';

import type { QueryTaskCompleted, QueueItem, State } from './types';


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
                if (state[transaction]) {
                    const request = { ...original(state[transaction]) } as QueueItem;
                    request.task.error(
                        new QueryClientError('abort', {
                            request,
                            message: 'request was canceled',
                            cause: new Error(reason),
                        })
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
            .addCase(actions.error, (state, action) => {
                const { payload, meta } = action;
                const { transaction } = meta.request.meta;
                if (state[transaction]) {
                    const request = { ...original(state[transaction]) } as QueueItem;
                    request.task.error(
                        new QueryClientError('error', {
                            request,
                            message: `failed to process task [${transaction}]`,
                            cause: payload,
                        })
                    );
                    delete state[transaction];
                }
            })
    );

export default createReducer;
