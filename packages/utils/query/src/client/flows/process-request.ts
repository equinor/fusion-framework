import {
    filter,
    from,
    Observable,
    type MonoTypeOperatorFunction,
    type ObservableInput,
} from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Actions, actions } from '../actions';

export type RequestHandler = (
    request: ReturnType<typeof actions.request>,
    signal: AbortSignal,
) => ObservableInput<Actions>;

export const processRequest =
    (handler: RequestHandler): MonoTypeOperatorFunction<Actions> =>
    (source$: Observable<Actions>) => {
        return source$.pipe(
            filter(actions.request.match),
            mergeMap((request) => {
                const { meta } = request;
                const { transaction } = meta;
                const controller = new AbortController();
                const { signal } = controller;
                return new Observable<Actions>((subscriber) => {
                    /** subscribe to cancel request on the action stream */
                    subscriber.add(
                        source$
                            .pipe(
                                /** */
                                filter(actions.cancel.match),
                            )
                            .subscribe((action) => {
                                /** if no transaction specified or transaction match current */
                                if (action.payload.transaction === transaction) {
                                    if (!signal.aborted) {
                                        controller.abort();
                                    }
                                    subscriber.complete();
                                }
                            }),
                    );

                    subscriber.add(
                        from(handler(request, signal)).subscribe({
                            next: (value) => subscriber.next(value),
                            error: (err) => subscriber.next(actions.error(err, { request })),
                            complete: () => subscriber.complete(),
                        }),
                    );
                });
            }),
        );
    };

export default processRequest;
