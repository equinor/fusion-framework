import { ActionError } from '../..';
import type { Action, PayloadMetaAction } from '../..';
import type { RetryOptions } from './types';

export type RequestAction<TArgs = unknown> = PayloadMetaAction<
    'request',
    TArgs,
    {
        controller: AbortController;
        retry?: Partial<RetryOptions>;
        ref?: string;
        transaction: string;
    }
>;

// export type SkipAction<TArgs = unknown, TType = unknown> = Action<'skipped', TArgs, TType>;

export type SuccessAction<TArgs, TResponse = Response> = PayloadMetaAction<
    'success',
    TResponse,
    { request: RequestAction<TArgs> }
>;

export type CancelAction<TArgs, TTransaction = string | undefined> = PayloadMetaAction<
    'cancel',
    TTransaction,
    { request?: RequestAction<TArgs>; reason?: string }
>;

export type FailureAction<TArgs, TType extends Error = Error> = PayloadMetaAction<
    'failure',
    ActionError<Action, TType>,
    { request: RequestAction<TArgs> }
>;

export type ErrorAction<TArgs, TType extends Error = Error> = PayloadMetaAction<
    'error',
    ActionError<Action, TType>,
    { request: RequestAction<TArgs> }
>;

export type ActionTypes<
    TType = unknown,
    TArgs = unknown,
    TFailure extends Error = Error,
    TError extends Error = Error
> =
    | RequestAction<TArgs>
    // | SkipAction<TArgs>
    | SuccessAction<TArgs, TType>
    | FailureAction<TArgs, TFailure>
    | ErrorAction<TArgs, TError>
    | CancelAction<TArgs>;
