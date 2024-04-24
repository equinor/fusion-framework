import { castDraft, createReducer as makeReducer } from '@equinor/fusion-observable';

import { Actions, actions } from './actions';

import type { QueryClientRequest, QueryClientState } from './types';

/**
 * Creates a reducer function for managing the state of query client operations.
 * The reducer updates the state based on actions dispatched related to query transactions.
 *
 * The state is an object where each key represents a unique transaction ID and its value
 * is a `QueryClientRequest` object that contains details about the request, its execution status,
 * any errors that occurred, and the results of the query execution.
 *
 * The reducer handles the following actions:
 * - `request`: Initializes a new query in the state with the given transaction ID.
 *   The state is updated with a new `QueryClientRequest` object which includes the request details,
 *   an empty execution log, an empty error log, and sets the status to 'idle'.
 * - `execute`: Marks a query as active by updating its status to 'active' and logs the execution time.
 * - `execute.success`: Removes a successfully executed query from the state, indicating the query has completed.
 * - `execute.failure`: Updates a query's status to 'failed' and logs the error information.
 * - `error`: Removes a query from the state due to an irrecoverable error, effectively cleaning up its state.
 * - `cancel`: Removes a query from the state if it's canceled, cleaning up any associated state.
 *
 * This reducer is created using a builder pattern provided by `makeReducer` from '@equinor/fusion-observable',
 * allowing for a declarative approach to defining how state is updated in response to actions.
 *
 * @param initial An optional initial state for the reducer. If not provided, defaults to an empty object.
 * @returns A reducer function tailored for managing the state of query client operations.
 */
export const createReducer = <TArgs = unknown>(initial: QueryClientState<TArgs> = {}) =>
    makeReducer<QueryClientState<TArgs>, Actions>(initial, (builder) => {
        builder.addCase(actions.request, (state, action) => {
            // When an action of type 'request' is dispatched, this case handler will be invoked.
            // It updates the state by setting a new `QueryClientRequest` object for the key specified by `action.meta.transaction`.
            // The new `QueryClientRequest` object is created by merging `action.payload` and `action.meta`, and initializing
            // `execution` as an empty array, `errors` as an empty array, and `status` as 'idle'.
            state[action.meta.transaction] = castDraft({
                ...action.payload,
                ...action.meta,
                execution: [],
                errors: [],
                status: 'idle',
            } as QueryClientRequest<TArgs>);
        });

        builder.addCase(actions.execute, (state, action) => {
            // Locates the query entry in the state using the transaction ID provided in `action.payload`.
            const entry = state[action.payload];
            if (entry) {
                // If the entry is found, logs the current timestamp to the `execution` array
                // to indicate when the execution action was triggered.
                entry.execution.push(Date.now());
                // Updates the status of the entry to 'active' to reflect that the execution
                // process has started.
                entry.status = 'active';
            }
        });

        builder.addCase(actions.execute.success, (state, action) => {
            // When an action of type 'execute.success' is dispatched, this case handler will be invoked.
            // It removes the query entry from the state using the transaction ID provided in `action.payload.transaction`.
            delete state[action.payload.transaction];
        });

        builder.addCase(actions.execute.failure, (state, action) => {
            // Locates the query entry in the state using the transaction ID provided in `action.meta`.
            const entry = state[action.meta.transaction];
            if (entry) {
                // If the entry is found, the error information from `action.payload` is added to the `errors` array of the entry.
                // This allows tracking of all errors that have occurred during the execution of the query.
                entry.errors.push(action.payload);
                // The status of the entry is updated to 'failed' to indicate that the query execution has encountered an error.
                entry.status = 'failed';
            }
        });

        builder.addCase(actions.error, (state, action) => {
            // When an action of type 'error' is dispatched, this case handler will be invoked.
            // This handler removes the query entry from the state using the transaction ID provided in `action.meta.transaction`.
            // This is typically used to clean up any state associated with a transaction that has encountered an irrecoverable error.
            delete state[action.meta.transaction];
        });

        builder.addCase(actions.cancel, (state, action) => {
            // When an action of type 'cancel' is dispatched, this case handler will be invoked.
            // It removes the query entry from the state using the transaction ID provided in `action.meta.transaction`.
            // This is useful for cleaning up any state associated with a transaction that is no longer needed, effectively canceling the operation.
            delete state[action.meta.transaction];
        });
    });

export default createReducer;
