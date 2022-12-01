import { ReplaySubject, Subject } from 'rxjs';

import uuid from 'uuid';

import { ActionInstanceMap, createAction } from '@equinor/fusion-observable';

import type { ActionTypes } from '@equinor/fusion-observable';

import type { QueryTaskValue, RetryOptions } from './types';

type RequestMeta<TType, TArgs> = {
    transaction: string;
    created: number;
    controller: AbortController;
    task: Subject<QueryTaskValue<TType, TArgs>>;
    retry?: Partial<RetryOptions>;
    ref?: string;
};

const createActions = <TType, TArgs>() => {
    const request = createAction(
        'client/request',
        (payload: unknown, meta?: Partial<RequestMeta<TType, TArgs>>) => {
            meta ??= {};
            meta.transaction ??= uuid.v4();
            meta.created ??= Date.now();
            meta.controller ??= new AbortController();
            meta.task ??= new ReplaySubject<QueryTaskValue<TType, TArgs>>();
            return { payload, meta: meta as RequestMeta<TType, TArgs> };
        }
    );
    return {
        request,
        retry: createAction('client/retry', (payload: ReturnType<typeof request>) => ({ payload })),
        success: createAction(
            'client/success',
            (payload: unknown, meta: { request: ReturnType<typeof request> }) => ({ payload, meta })
        ),
        cancel: createAction(
            'client/cancel',
            (payload: { transaction: string; reason?: string }) => ({ payload })
        ),
        failure: createAction(
            'client/failure',
            (payload: Error, meta: { request: ReturnType<typeof request> }) => ({
                payload,
                meta,
            })
        ),
        error: createAction(
            'client/error',
            (payload: Error, meta: { request: ReturnType<typeof request> }) => ({
                payload,
                meta,
            })
        ),
    };
};

export const actions = createActions();

export type ActionBuilder<TType = any, TArgs = any> = ReturnType<
    typeof createActions<TType, TArgs>
>;

export type ActionMap<TType = any, TArgs = any> = ActionInstanceMap<ActionBuilder<TType, TArgs>>;
export type Actions<TType = any, TArgs = any> = ActionTypes<ActionMap<TType, TArgs>>;

export default actions;
