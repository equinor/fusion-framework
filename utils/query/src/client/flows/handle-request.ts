import { from, of } from 'rxjs';

import { Flow } from '@equinor/fusion-observable';
import { catchError, map, tap } from 'rxjs/operators';
import { actions, Actions } from '../actions';
import { QueryFn, State } from '../types';

import { processRequest } from './process-request';

export const handleRequests =
    (fetch: QueryFn): Flow<Actions, State> =>
    (action$) =>
        action$.pipe(
            processRequest((request) =>
                from(fetch(request.payload, request.meta.controller.signal)).pipe(
                    map((result) => actions.success(result, { request })),
                    catchError((err) =>
                        of(
                            actions.failure(
                                Error(
                                    `failed to execute request for transaction ${request.meta.transaction}`,
                                    { cause: err }
                                ),
                                { request }
                            )
                        )
                    )
                )
            )
        );

export default handleRequests;
