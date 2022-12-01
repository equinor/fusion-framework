import { ActionError } from '@equinor/fusion-observable';
import type { Action, PayloadAction } from '@equinor/fusion-observable';
import type { QueryTaskValue, RetryOptions } from './types';
import { Subject } from 'rxjs';

export type RequestAction<TArgs = unknown, TResponse = unknown> = PayloadAction<
    TArgs,
    'request',
    {
        transaction: string;
        controller: AbortController;
        task: Subject<QueryTaskValue<TResponse, TArgs>>;
        retry?: Partial<RetryOptions>;
        ref?: string;
    }
>;

export type RetryAction<TArgs = unknown, TResponse = unknown> = PayloadAction<
    RequestAction<TArgs, TResponse>,
    'retry'
>;

export type SuccessAction<TArgs = unknown, TResponse = unknown> = PayloadAction<
    TResponse,
    'success',
    { request: RequestAction<TArgs, TResponse> }
>;

export type CancelAction = PayloadAction<
    /** reason */
    { transaction: string; reason?: string },
    'cancel'
>;

export type FailureAction<
    TArgs = unknown,
    TResponse = unknown,
    TError extends Error = Error
> = PayloadAction<
    ActionError<Action, TError>,
    'failure',
    { request: RequestAction<TArgs, TResponse> }
>;

export type ErrorAction<
    TArgs = unknown,
    TResponse = unknown,
    TError extends Error = Error
> = PayloadAction<
    ActionError<Action, TError>,
    'error',
    { request: RequestAction<TArgs, TResponse> }
>;

export type ActionTypes<
    TType = unknown,
    TArgs = unknown,
    TFailure extends Error = Error,
    TError extends Error = Error
> =
    | CancelAction
    | ErrorAction<TArgs, TType, TError>
    | FailureAction<TArgs, TType, TFailure>
    | RequestAction<TArgs, TType>
    | RetryAction<TArgs, TType>
    | SuccessAction<TArgs, TType>;
