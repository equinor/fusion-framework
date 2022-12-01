import { from } from 'rxjs';

import { Flow } from '@equinor/fusion-observable/src';
import { catchError, map } from 'rxjs/operators';
import { actions, Actions } from '../actions';
import { QueryFn, State } from '../types';

import { processRequest } from './process-request';

export const handleRequests =
    (fetch: QueryFn): Flow<Actions, State> =>
    (action$) => {
        return action$.pipe(
            processRequest((request) => {
                return from(fetch(request.payload, request.meta.controller.signal)).pipe(
                    map((result) => actions.success(result, { request })),
                    catchError((err) => {
                        throw Error(
                            `failed to execute request for transaction ${request.meta.transaction}`,
                            { cause: err }
                        );
                    })
                );
            })
        );
    };

export default handleRequests;
