import { ReplaySubject, Subject } from 'rxjs';

import { v4 as generateGUID } from 'uuid';

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
            meta.transaction ??= generateGUID();
            meta.created ??= Date.now();
            meta.controller ??= new AbortController();
            meta.task ??= new ReplaySubject<QueryTaskValue<TType, TArgs>>();
            return { payload, meta: meta as RequestMeta<TType, TArgs> };
        },
    );
    return {
        request,
        retry: createAction('client/retry', (payload: ReturnType<typeof request>) => ({ payload })),
        success: createAction(
            'client/success',
            (payload: unknown, meta: { request: ReturnType<typeof request> }) => ({
                payload,
                meta,
            }),
        ),
        cancel: createAction(
            'client/cancel',
            (payload: { transaction: string; reason?: string }) => ({ payload }),
        ),
        failure: createAction(
            'client/failure',
            (payload: Error, meta: { request: ReturnType<typeof request> }) => ({
                payload,
                meta,
            }),
        ),
        error: createAction(
            'client/error',
            (payload: Error, meta: { request: ReturnType<typeof request> }) => ({
                payload,
                meta,
            }),
        ),
    };
};

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
