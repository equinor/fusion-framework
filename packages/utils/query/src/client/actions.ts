import { v4 as generateGUID } from 'uuid';

import { ActionInstanceMap, createAction, createAsyncAction } from '@equinor/fusion-observable';

import type { ActionTypes } from '@equinor/fusion-observable';

import type { QueryClientResult, RetryOptions } from './types';

const createActions = <TType, TArgs>() => ({
    /**
     * Action to initiate a request.
     *
     * @param args - The arguments for the request.
     * @param options - Optional parameters including a reference and retry options.
     * @returns An action with the request details and metadata.
     */
    request: createAction(
        'client/request',
        (args: TArgs, options?: { ref?: string; retry?: Partial<RetryOptions> }) => ({
            payload: { args, options },
            meta: { transaction: generateGUID(), created: Date.now() },
        }),
    ),
    /**
     * Async action to execute a request.
     *
     * @param transaction - The unique identifier for the transaction.
     * @returns An async action with the transaction details and metadata.
     */
    execute: createAsyncAction(
        'client/execute',
        (transaction: string) => ({
            payload: transaction,
            meta: { transaction, created: Date.now() },
        }),
        (result: QueryClientResult<TType, TArgs>) => ({
            payload: result,
            meta: { transaction: result.transaction, created: Date.now() },
        }),
        (error: Error, transaction: string) => ({
            payload: error,
            meta: { transaction, created: Date.now() },
        }),
    ),
    /**
     * Action to cancel a request.
     *
     * @param transaction - The unique identifier for the transaction to cancel.
     * @param reason - Optional reason for cancellation.
     * @returns An action with the cancellation details and metadata.
     */
    cancel: createAction('client/cancel', (transaction: string, reason?: string) => ({
        payload: { transaction, reason },
        meta: { transaction, created: Date.now() },
    })),
    /**
     * Action to report an error.
     *
     * @param transaction - The unique identifier for the transaction that errored.
     * @param error - The error that occurred.
     * @returns An action with the error details and metadata.
     */
    error: createAction('client/error', (transaction: string, error: unknown) => ({
        payload: { transaction, error },
        meta: { transaction, created: Date.now() },
    })),
});

export const actions = createActions();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionBuilder<TType = any, TArgs = any> = ReturnType<
    typeof createActions<TType, TArgs>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionMap<TType = any, TArgs = any> = ActionInstanceMap<ActionBuilder<TType, TArgs>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Actions<TType = any, TArgs = any> = ActionTypes<ActionMap<TType, TArgs>>;

export default actions;
