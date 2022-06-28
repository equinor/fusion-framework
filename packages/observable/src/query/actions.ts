import { PayloadAction, ActionError } from '..';
import { RetryOpt } from './types';

export enum ActionType {
    REQUEST = 'request',
    SUCCESS = 'success',
    FAILURE = 'failure',
    ERROR = 'error',
    CANCEL = 'cancel',
}

type BaseAction<
    TType extends ActionType = ActionType,
    TPayload = unknown,
    TMeta = unknown
> = PayloadAction<TType, TPayload> & {
    meta: TMeta;
};

export type RequestAction<TArgs = unknown> = BaseAction<
    ActionType.REQUEST,
    TArgs,
    {
        controller: AbortController;
        retry?: Partial<RetryOpt>;
    }
> & {
    transaction: string;
};

export type SuccessAction<TArgs, TResponse = Response> = BaseAction<
    ActionType.SUCCESS,
    TResponse,
    { request: RequestAction<TArgs> }
>;

export type CancelAction<TArgs, TReason = string> = BaseAction<
    ActionType.CANCEL,
    TReason,
    { request?: RequestAction<TArgs> }
>;

export type FailureAction<TArgs, TType extends Error = Error> = BaseAction<
    ActionType.FAILURE,
    ActionError<BaseAction, TType>,
    { request: RequestAction<TArgs> }
>;

export type ErrorAction<TArgs, TType extends Error = Error> = BaseAction<
    ActionType.ERROR,
    ActionError<BaseAction, TType>,
    { request: RequestAction<TArgs> }
>;

export type Actions<
    TType = unknown,
    TArgs = unknown,
    TFailure extends Error = Error,
    TError extends Error = Error
> =
    | RequestAction<TArgs>
    | SuccessAction<TArgs, TType>
    | FailureAction<TArgs, TFailure>
    | ErrorAction<TArgs, TError>
    | CancelAction<TArgs>;
