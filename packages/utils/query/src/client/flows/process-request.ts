import {
    filter,
    fromEvent,
    MonoTypeOperatorFunction,
    Observable,
    from,
    ObservableInput,
} from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Actions, actions } from '../actions';

export type RequestHandler = (
    request: ReturnType<typeof actions.request>
) => ObservableInput<Actions>;

export const processRequest =
    (handler: RequestHandler): MonoTypeOperatorFunction<Actions> =>
    (source$: Observable<Actions>) => {
        return source$.pipe(
            filter(actions.request.match),
            mergeMap((request) => {
                const {
                    meta: { controller, transaction },
                } = request;

                return new Observable<Actions>((subscriber) => {
                    /**
                     * if the abort signal has been triggered,
                     * create a cancel action and complete the observable
                     */
                    if (controller.signal.aborted) {
                        subscriber.next(
                            actions.cancel({
                                transaction,
                                reason: `request [${transaction}] was aborted!`,
                            })
                        );
                        return subscriber.complete();
                    }

                    /** subscribe to cancel request on the action stream */
                    subscriber.add(
                        source$.pipe(filter(actions.cancel.match)).subscribe((action) => {
                            /** if no transaction specified or transaction match current */
                            if (action.payload.transaction === transaction) {
                                if (!controller.signal.aborted) {
                                    controller.abort();
                                }
                                subscriber.complete();
                            }
                        })
                    );

                    /** subscribe to abort from the controller */
                    subscriber.add(
                        fromEvent(controller.signal, 'abort').subscribe(() => {
                            subscriber.next(
                                actions.cancel({
                                    transaction,
                                    reason: `request [${transaction}] was aborted!`,
                                })
                            );
                            subscriber.complete();
                        })
                    );

                    subscriber.add(
                        from(handler(request)).subscribe({
                            next: (value) => subscriber.next(value),
                            error: (err) => subscriber.next(actions.error(err, { request })),
                            complete: () => subscriber.complete(),
                        })
                    );
                });
            })
        );
    };

export default processRequest;
