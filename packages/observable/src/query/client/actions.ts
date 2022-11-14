import { ActionError } from '../..';
import type { Action, PayloadAction, PayloadMetaAction } from '../..';
import type { QueryTaskValue, RetryOptions } from './types';
import { Subject } from 'rxjs';

export type RequestAction<TArgs = unknown, TResponse = unknown> = PayloadMetaAction<
    'request',
    TArgs,
    {
        transaction: string;
        controller: AbortController;
        task: Subject<QueryTaskValue<TResponse, TArgs>>;
        retry?: Partial<RetryOptions>;
        ref?: string;
    }
>;

export type RetryAction<TArgs = unknown, TResponse = unknown> = PayloadAction<
    'retry',
    RequestAction<TArgs, TResponse>
>;

export type SuccessAction<TArgs = unknown, TResponse = unknown> = PayloadMetaAction<
    'success',
    TResponse,
    { request: RequestAction<TArgs, TResponse> }
>;

export type CancelAction = PayloadAction<
    'cancel',
    /** reason */
    { transaction: string; reason?: string }
>;

export type FailureAction<
    TArgs = unknown,
    TResponse = unknown,
    TError extends Error = Error
> = PayloadMetaAction<
    'failure',
    ActionError<Action, TError>,
    { request: RequestAction<TArgs, TResponse> }
>;

export type ErrorAction<
    TArgs = unknown,
    TResponse = unknown,
    TError extends Error = Error
> = PayloadMetaAction<
    'error',
    ActionError<Action, TError>,
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
