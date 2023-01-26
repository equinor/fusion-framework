/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    actionSuffixDivider,
    createAction,
    matchActionSuffix,
    PayloadActionCreator,
} from './create-action';

import type { PrepareAction } from './create-action';
import type { AnyAction } from './types';

export function createAsyncAction<
    PA extends PrepareAction<any>,
    PA_Success extends PrepareAction<any>,
    T extends string
>(
    type: T,
    request: PA,
    success: PA_Success
): PayloadActionCreator<ReturnType<PA>['payload'], `${T}::request`, PA> & {
    success: PayloadActionCreator<ReturnType<PA_Success>['payload'], `${T}::success`, PA_Success>;
};

export function createAsyncAction<
    PA extends PrepareAction<any>,
    PA_Success extends PrepareAction<any>,
    PA_Failure extends PrepareAction<any>,
    T extends string
>(
    type: T,
    request: PA,
    success: PA_Success,
    failure: PA_Failure
): PayloadActionCreator<ReturnType<PA>['payload'], `${T}::request`, PA> & {
    success: PayloadActionCreator<ReturnType<PA_Success>['payload'], `${T}::success`, PA_Success>;
    failure: PayloadActionCreator<ReturnType<PA_Failure>['payload'], `${T}::failure`, PA_Failure>;
};

export function createAsyncAction(
    type: string,
    request: PrepareAction<any>,
    success: PrepareAction<any>,
    failure?: PrepareAction<any>
): any {
    const action = createAction([type, 'request'].join(actionSuffixDivider), request);
    if (success) {
        Object.assign(action, {
            success: createAction([type, 'success'].join(actionSuffixDivider), success),
        });
    }
    if (failure) {
        Object.assign(action, {
            failure: createAction([type, 'failure'].join(actionSuffixDivider), failure),
        });
    }
    return action as unknown as any;
}

export const isRequestAction = <A extends AnyAction>(action: A): action is A =>
    !!action.type.match(/::request$/);

export const isSuccessAction = <A extends AnyAction>(action: A): action is A =>
    !!action.type.match(matchActionSuffix('success'));

export const isFailureAction = <A extends AnyAction>(action: A): action is A =>
    !!action.type.match(matchActionSuffix('failure'));

export const isCompleteAction = <A extends AnyAction>(action: A): action is A =>
    isSuccessAction(action) || isFailureAction(action);
